#!/usr/bin/env node

/**
 * npmxrtdb - Multi-host NPX wrapper
 */

import { parseArgs, extractPackageName } from '../src/args-parser.js';
import { orchestrate } from '../src/core.js';
import { loadHosts } from '../src/db.js';
import { setDebugMode, error as logError } from '../src/logger.js';
import { showHelp } from '../src/help.js';
import { getNpxCommand } from '../src/platform.js';

async function main() {
  let wrapperFlags;
  try {
    const parsed = parseArgs(process.argv.slice(2));
    wrapperFlags = parsed.wrapperFlags;
    const passThruArgs = parsed.passThruArgs;
    
    // Enable debug mode if requested
    if (wrapperFlags.debug) {
      setDebugMode(true);
    }
    
    // Show help
    if (wrapperFlags.help) {
      showHelp('npmxrtdb');
      process.exit(0);
    }
    
    // Get DB URL
    const dbUrl = wrapperFlags.db || process.env.MHNPM_DB_URL;
    if (!dbUrl) {
      logError('Missing DB URL. Use --db flag or set MHNPM_DB_URL environment variable');
      logError('Use --help for more information');
      process.exit(1);
    }
    
    // Load hosts
    const hosts = await loadHosts(dbUrl);
    
    // Extract package name
    const packageName = extractPackageName(passThruArgs);
    
    // Get npx command
    const npxCmd = getNpxCommand();
    
    // Orchestrate execution
    const winner = await orchestrate(hosts, npxCmd, passThruArgs, {
      mode: wrapperFlags.mode,
      timeout: wrapperFlags.timeout,
      preferPublic: wrapperFlags.preferPublic,
      packageName,
    });
    
    // Output result if --json flag
    if (wrapperFlags.json) {
      console.log(JSON.stringify({
        success: true,
        host: winner.host.name,
        registry: winner.host.registry,
        elapsed: winner.elapsed,
      }, null, 2));
    }
    
    process.exit(0);
  } catch (err) {
    logError(err.message);
    
    if (wrapperFlags?.debug) {
      console.error(err);
    }
    
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('uncaughtException', (err) => {
  logError('Uncaught exception:', err.message);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  logError('Unhandled rejection:', err.message);
  process.exit(1);
});

main();
