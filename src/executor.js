/**
 * Process executor with cancellation support
 */

import { execa } from "execa";
import { debug } from "./logger.js";

/**
 * Execute a single attempt
 */
export async function executeAttempt(cmd, args, npmrcPath, signal, timeout) {
  debug(`Executing: ${cmd} ${args.join(" ")}`);
  debug(`Using .npmrc: ${npmrcPath}`);

  const subprocess = execa(cmd, args, {
    env: {
      ...process.env,
      NPM_CONFIG_USERCONFIG: npmrcPath,
    },
    signal,
    timeout,
    stdio: "inherit", // Pass-through stdout/stderr
    reject: true,
  });

  return subprocess;
}

/**
 * Run concurrent attempts and return first success
 */
export async function runConcurrentAttempts(attempts, timeout) {
  if (attempts.length === 0) {
    throw new Error("No attempts to run");
  }

  debug(`Starting ${attempts.length} concurrent attempt(s) with ${timeout}ms timeout each`);

  const controller = new AbortController();

  // Each attempt resolves with winner info, or rejects with an error carrying host context
  const wrapped = attempts.map((attempt, index) =>
    (async () => {
      const startTime = Date.now();
      try {
        await executeAttempt(attempt.cmd, attempt.args, attempt.npmrcPath, controller.signal, timeout);

        const elapsed = Date.now() - startTime;
        debug(`✓ Host '${attempt.host.name}' succeeded in ${elapsed}ms`);

        return { success: true, host: attempt.host, elapsed, index };
      } catch (error) {
        // If aborted, mark as cancelled
        if (error?.name === "AbortError" || controller.signal.aborted) {
          debug(`✗ Host '${attempt.host.name}' cancelled`);
          const e = Object.assign(new Error("cancelled"), { cancelled: true, host: attempt.host, index });
          throw e;
        }

        debug(`✗ Host '${attempt.host.name}' failed: ${error.message}`);
        // Attach host context for aggregation
        error.host = attempt.host;
        error.index = index;
        throw error;
      }
    })(),
  );

  try {
    const winner = await Promise.any(wrapped);

    debug(`Winner: Host '${winner.host.name}' (${winner.elapsed}ms)`);

    // Cancel all other attempts immediately
    controller.abort();

    // Give a moment for cancellation to propagate
    await new Promise((resolve) => setTimeout(resolve, 50));

    return winner;
  } catch (agg) {
    controller.abort();

    // Promise.any throws AggregateError when all rejected
    const errors = (agg?.errors || [])
      .filter((e) => e && !e.cancelled)
      .map((e) => ({
        host: e.host?.name || "unknown",
        error: e.message || "Unknown error",
        stderr: e.stderr || "",
        exitCode: e.exitCode,
      }));

    throw new AllAttemptsFailedError("All attempts failed", errors);
  }
}

/**
 * Custom error for all attempts failed
 */
export class AllAttemptsFailedError extends Error {
  constructor(message, errors) {
    super(message);
    this.name = "AllAttemptsFailedError";
    this.errors = errors;
  }

  toString() {
    let msg = `${this.message}:\n`;
    for (const err of this.errors) {
      msg += `  - ${err.host}: ${err.error}`;
      if (err.exitCode !== undefined) {
        msg += ` (exit code: ${err.exitCode})`;
      }
      msg += "\n";
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
  const authIndicators = ["401", "403", "e401", "eneedauth", "forbidden", "unauthorized", "authentication required", "authentication failed"];

  return authIndicators.some((indicator) => errorStr.includes(indicator));
}

/**
 * Check if any error in the list is an auth error
 */
export function hasAuthError(errors) {
  if (!Array.isArray(errors)) return false;
  return errors.some((err) => isAuthError(err.error));
}
