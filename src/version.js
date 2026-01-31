/**
 * Version comparison using digits extraction
 * Example: "1.260131.11534" -> "126013111534"
 */

import { debug } from './logger.js';

/**
 * Extract all digits from version string
 */
export function extractDigits(version) {
  if (!version || typeof version !== 'string') {
    return '0';
  }
  const digits = version.replace(/\D/g, '');
  return digits || '0';
}

/**
 * Compare two versions by their digit representation
 * Returns: 1 if v1 > v2, -1 if v1 < v2, 0 if equal
 */
export function compareVersions(v1, v2) {
  const d1 = BigInt(extractDigits(v1));
  const d2 = BigInt(extractDigits(v2));
  
  if (d1 > d2) return 1;
  if (d1 < d2) return -1;
  return 0;
}

/**
 * Find the latest version from an array of version strings
 */
export function findLatestVersion(versions) {
  if (!versions || versions.length === 0) {
    return null;
  }
  
  const latest = versions.reduce((max, current) => {
    if (!max) return current;
    return compareVersions(current, max) > 0 ? current : max;
  }, null);
  
  debug(`Latest version from [${versions.join(', ')}]: ${latest} (digits: ${extractDigits(latest)})`);
  
  return latest;
}

/**
 * Parse versions from packument (package metadata)
 */
export function extractVersionsFromPackument(packument) {
  if (!packument || !packument.versions) {
    return [];
  }
  
  return Object.keys(packument.versions);
}
