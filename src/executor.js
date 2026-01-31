/**
 * Process executor with cancellation support
 */

import { execa } from 'execa';
import { debug } from './logger.js';

/**
 * Execute a single attempt
 */
export async function executeAttempt(cmd, args, npmrcPath, signal, timeout) {
  debug(`Executing: ${cmd} ${args.join(' ')}`);
  debug(`Using .npmrc: ${npmrcPath}`);
  
  const subprocess = execa(cmd, args, {
    env: {
      ...process.env,
      NPM_CONFIG_USERCONFIG: npmrcPath,
    },
    signal,
    timeout,
    stdio: 'inherit', // Pass-through stdout/stderr
    reject: true,
  });
  
  return subprocess;
}

/**
 * Run concurrent attempts and return first success
 */
export async function runConcurrentAttempts(attempts, timeout) {
  if (attempts.length === 0) {
    throw new Error('No attempts to run');
  }
  
  debug(`Starting ${attempts.length} concurrent attempt(s) with ${timeout}ms timeout each`);
  
  const controller = new AbortController();
  const results = [];
  
  // Create promises for all attempts
  const promises = attempts.map(async (attempt, index) => {
    try {
      const startTime = Date.now();
      
      await executeAttempt(
        attempt.cmd,
        attempt.args,
        attempt.npmrcPath,
        controller.signal,
        timeout
      );
      
      const elapsed = Date.now() - startTime;
      
      debug(`✓ Host '${attempt.host.name}' succeeded in ${elapsed}ms`);
      
      return {
        success: true,
        host: attempt.host,
        elapsed,
        index,
      };
    } catch (error) {
      // Check if cancelled by AbortController
      if (error.name === 'AbortError' || controller.signal.aborted) {
        debug(`✗ Host '${attempt.host.name}' cancelled`);
        return {
          success: false,
          cancelled: true,
          host: attempt.host,
          index,
        };
      }
      
      debug(`✗ Host '${attempt.host.name}' failed: ${error.message}`);
      
      return {
        success: false,
        error,
        host: attempt.host,
        index,
      };
    }
  });
  
  // Wait for first success or all failures
  try {
    const settled = await Promise.allSettled(promises);
    
    // Find first successful result
    for (const result of settled) {
      if (result.status === 'fulfilled' && result.value.success) {
        const winner = result.value;
        
        debug(`Winner: Host '${winner.host.name}' (${winner.elapsed}ms)`);
        
        // Cancel all other attempts
        controller.abort();
        
        // Wait a bit for cancellation to propagate
        await new Promise(resolve => setTimeout(resolve, 100));
        
        return winner;
      }
    }
    
    // All failed - collect errors
    const errors = settled
      .map(r => r.status === 'fulfilled' ? r.value : null)
      .filter(r => r && !r.success && !r.cancelled)
      .map(r => ({
        host: r.host.name,
        error: r.error?.message || 'Unknown error',
        stderr: r.error?.stderr || '',
        exitCode: r.error?.exitCode,
      }));
    
    throw new AllAttemptsFailedError('All attempts failed', errors);
  } finally {
    // Ensure controller is aborted
    controller.abort();
  }
}

/**
 * Custom error for all attempts failed
 */
export class AllAttemptsFailedError extends Error {
  constructor(message, errors) {
    super(message);
    this.name = 'AllAttemptsFailedError';
    this.errors = errors;
  }
  
  toString() {
    let msg = `${this.message}:\n`;
    for (const err of this.errors) {
      msg += `  - ${err.host}: ${err.error}`;
      if (err.exitCode !== undefined) {
        msg += ` (exit code: ${err.exitCode})`;
      }
      msg += '\n';
    }
    return msg;
  }
}

/**
 * Check if error indicates authentication issue
 */
export function isAuthError(error) {
  if (!error) return false;
  
  const errorStr = error.toString().toLowerCase();
  const authIndicators = [
    '401',
    '403',
    'e401',
    'eneedauth',
    'forbidden',
    'unauthorized',
    'authentication required',
    'authentication failed',
  ];
  
  return authIndicators.some(indicator => errorStr.includes(indicator));
}

/**
 * Check if any error in the list is an auth error
 */
export function hasAuthError(errors) {
  if (!Array.isArray(errors)) return false;
  return errors.some(err => isAuthError(err.error));
}
