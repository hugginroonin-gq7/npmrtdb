/**
 * Core orchestrator - 2-stage concurrent execution strategy
 */

import { debug, info, error as logError } from './logger.js';
import { createTempNpmrc, cleanupTemp } from './npmrc.js';
import { runConcurrentAttempts, AllAttemptsFailedError, hasAuthError } from './executor.js';
import { fetchAllMetadata, collectAllVersions, filterHostsWithVersion } from './metadata.js';
import { findLatestVersion } from './version.js';

/**
 * Build an attempt object
 */
async function buildAttempt(host, cmd, args, token = null) {
  const { npmrcPath, tempDir } = await createTempNpmrc(host, token);
  
  return {
    host,
    cmd,
    args,
    npmrcPath,
    tempDir,
  };
}

/**
 * Cleanup attempts
 */
async function cleanupAttempts(attempts) {
  await Promise.all(
    attempts.map(attempt => cleanupTemp(attempt.tempDir))
  );
}

/**
 * Pin version to args if mode is 'latest'
 */
function pinVersionToArgs(args, packageName, version) {
  // Replace packageName with packageName@version
  const newArgs = args.map(arg => {
    if (arg === packageName) {
      return `${packageName}@${version}`;
    }
    // Handle scoped packages
    if (arg.startsWith(packageName + '@')) {
      // Already has version, replace it
      return `${packageName}@${version}`;
    }
    return arg;
  });
  
  // If package name not found in args, add it
  if (!newArgs.some(arg => arg.startsWith(packageName))) {
    // For npm install, add after 'install' or 'i'
    const installIndex = newArgs.findIndex(arg => arg === 'install' || arg === 'i');
    if (installIndex >= 0) {
      newArgs.splice(installIndex + 1, 0, `${packageName}@${version}`);
    } else {
      newArgs.unshift(`${packageName}@${version}`);
    }
  }
  
  return newArgs;
}

/**
 * Orchestrate multi-host execution with 2-stage strategy
 */
export async function orchestrate(hosts, cmd, passThruArgs, options = {}) {
  const {
    mode = 'any',
    timeout = 30000,
    preferPublic = true,
  } = options;
  
  let packageName = options.packageName;
  let finalArgs = passThruArgs;
  let hostsToUse = hosts;
  
  // Mode: latest - fetch metadata and pin version
  if (mode === 'latest') {
    if (!packageName) {
      throw new Error('Package name is required for --mode=latest');
    }
    
    info('Mode: latest - fetching metadata from all hosts...');
    
    const metadataResults = await fetchAllMetadata(hosts, packageName, timeout);
    const allVersions = collectAllVersions(metadataResults);
    
    if (allVersions.length === 0) {
      throw new Error(`No versions found for package '${packageName}' across all hosts`);
    }
    
    const latestVersion = findLatestVersion(allVersions);
    info(`Latest version: ${latestVersion}`);
    
    // Pin version to args
    finalArgs = pinVersionToArgs(passThruArgs, packageName, latestVersion);
    debug(`Pinned args: ${finalArgs.join(' ')}`);
    
    // Filter hosts that have this version
    hostsToUse = filterHostsWithVersion(metadataResults, latestVersion);
    
    if (hostsToUse.length === 0) {
      throw new Error(`No hosts have version ${latestVersion} of '${packageName}'`);
    }
    
    debug(`Hosts with version ${latestVersion}: ${hostsToUse.map(h => h.name).join(', ')}`);
  }
  
  // Stage 1: Public-first (concurrent)
  if (preferPublic) {
    const publicHosts = hostsToUse.filter(h => !h.auth?.alwaysAuth);
    
    if (publicHosts.length > 0) {
      info(`Stage 1: Trying ${publicHosts.length} public host(s) concurrently...`);
      
      try {
        const attempts = await Promise.all(
          publicHosts.map(host => buildAttempt(host, cmd, finalArgs, null))
        );
        
        try {
          const winner = await runConcurrentAttempts(attempts, timeout);
          
          info(`✓ Success with host '${winner.host.name}' (public, ${winner.elapsed}ms)`);
          
          return winner;
        } finally {
          await cleanupAttempts(attempts);
        }
      } catch (err) {
        if (err instanceof AllAttemptsFailedError) {
          debug('All public attempts failed');
          
          // Check if we should fallback to token auth
          if (!hasAuthError(err.errors)) {
            // Not an auth error, rethrow
            throw err;
          }
          
          debug('Auth error detected, will try Stage 2 with tokens');
        } else {
          throw err;
        }
      }
    }
  }
  
  // Stage 2: Token fallback (concurrent)
  const tokenHosts = hostsToUse.filter(h => {
    const tokenEnv = h.auth?.tokenEnv;
    return tokenEnv && process.env[tokenEnv];
  });
  
  if (tokenHosts.length === 0) {
    throw new Error('All hosts failed. No tokens available for fallback.');
  }
  
  info(`Stage 2: Trying ${tokenHosts.length} host(s) with tokens concurrently...`);
  
  const attempts = await Promise.all(
    tokenHosts.map(host => {
      const token = process.env[host.auth.tokenEnv];
      return buildAttempt(host, cmd, finalArgs, token);
    })
  );
  
  try {
    const winner = await runConcurrentAttempts(attempts, timeout);
    
    info(`✓ Success with host '${winner.host.name}' (authenticated, ${winner.elapsed}ms)`);
    
    return winner;
  } finally {
    await cleanupAttempts(attempts);
  }
}
