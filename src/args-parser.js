/**
 * Arguments parser - separate wrapper flags from pass-through args
 */

import { debug } from "./logger.js";

/**
 * Parse command line arguments
 * Supports both -- separator and smart parsing
 */
export function parseArgs(argv) {
  const wrapperFlags = {
    help: false,
    db: null,
    mode: "any",
    timeout: 30000,
    debug: false,
    json: false,
    preferPublic: true,
  };

  let passThruArgs = [];
  const separatorIndex = argv.indexOf("--");

  if (separatorIndex >= 0) {
    // Use -- separator
    const beforeSeparator = argv.slice(0, separatorIndex);
    passThruArgs = argv.slice(separatorIndex + 1);

    parseWrapperFlags(beforeSeparator, wrapperFlags);
  } else {
    // Smart parsing - extract wrapper flags from any position
    const { flags, remaining } = extractWrapperFlags(argv);
    Object.assign(wrapperFlags, flags);
    passThruArgs = remaining;
  }

  debug("Wrapper flags:", wrapperFlags);
  debug("Pass-through args:", passThruArgs);

  return { wrapperFlags, passThruArgs };
}

/**
 * Parse wrapper flags from args
 */
function parseWrapperFlags(args, flags) {
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--help" || arg === "-h") {
      flags.help = true;
    } else if (arg === "--debug") {
      flags.debug = true;
    } else if (arg === "--json") {
      flags.json = true;
    } else if (arg.startsWith("--db=")) {
      flags.db = arg.substring(5);
    } else if (arg === "--db") {
      flags.db = args[++i];
    } else if (arg.startsWith("--mode=")) {
      flags.mode = arg.substring(7);
    } else if (arg === "--mode") {
      flags.mode = args[++i];
    } else if (arg.startsWith("--timeout=")) {
      flags.timeout = parseInt(arg.substring(10), 10);
    } else if (arg === "--timeout") {
      flags.timeout = parseInt(args[++i], 10);
    } else if (arg === "--prefer-public" || arg.startsWith("--prefer-public=")) {
      if (arg.includes("=")) {
        flags.preferPublic = arg.split("=")[1] !== "false";
      } else {
        flags.preferPublic = true;
      }
    }
  }
}

/**
 * Extract wrapper flags from mixed args
 */
function extractWrapperFlags(argv) {
  const wrapperFlagNames = ["--help", "-h", "--debug", "--json", "--db", "--mode", "--timeout", "--prefer-public"];

  const flags = {};
  const remaining = [];

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    // Check if this is a wrapper flag
    const isWrapperFlag = wrapperFlagNames.some((name) => arg === name || arg.startsWith(name + "="));

    if (isWrapperFlag) {
      // Parse the flag
      if (arg === "--help" || arg === "-h") {
        flags.help = true;
      } else if (arg === "--debug") {
        flags.debug = true;
      } else if (arg === "--json") {
        flags.json = true;
      } else if (arg.startsWith("--db=")) {
        flags.db = arg.substring(5);
      } else if (arg === "--db") {
        flags.db = argv[++i];
      } else if (arg.startsWith("--mode=")) {
        flags.mode = arg.substring(7);
      } else if (arg === "--mode") {
        flags.mode = argv[++i];
      } else if (arg.startsWith("--timeout=")) {
        flags.timeout = parseInt(arg.substring(10), 10);
      } else if (arg === "--timeout") {
        flags.timeout = parseInt(argv[++i], 10);
      } else if (arg === "--prefer-public" || arg.startsWith("--prefer-public=")) {
        if (arg.includes("=")) {
          flags.preferPublic = arg.split("=")[1] !== "false";
        } else {
          flags.preferPublic = true;
        }
      }
    } else {
      remaining.push(arg);
    }
  }

  return { flags, remaining };
}

/**
 * Extract package name from npm/npx args
 */
export function extractPackageName(args) {
  // For npm install: find first arg that doesn't start with -
  // For npx: first arg is usually the package name

  for (const arg of args) {
    if (!arg.startsWith("-") && arg !== "install" && arg !== "i" && arg !== "add") {
      // Extract package name without version specifier
      const match = arg.match(/^(@?[^@\s]+)/);
      return match ? match[1] : arg;
    }
  }

  return null;
}
