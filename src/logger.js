/**
 * Simple logger with debug mode support
 */

let debugMode = false;

export function setDebugMode(enabled) {
  debugMode = enabled;
}

export function debug(...args) {
  if (debugMode) {
    console.error("[DEBUG]", ...args);
  }
}

export function info(...args) {
  console.error("[INFO]", ...args);
}

export function error(...args) {
  console.error("[ERROR]", ...args);
}

export function warn(...args) {
  console.error("[WARN]", ...args);
}
