/**
 * Platform detection and command resolution
 */

import { platform } from 'os';

/**
 * Get the correct npm/npx command for current platform
 */
export function getCommand(baseCommand) {
  const isWindows = platform() === 'win32';
  
  // On Windows, use .cmd version
  if (isWindows) {
    return `${baseCommand}.cmd`;
  }
  
  return baseCommand;
}

/**
 * Get npm command
 */
export function getNpmCommand() {
  return getCommand('npm');
}

/**
 * Get npx command
 */
export function getNpxCommand() {
  return getCommand('npx');
}

/**
 * Check if running on Windows
 */
export function isWindows() {
  return platform() === 'win32';
}
