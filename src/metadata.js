/**
 * Package metadata fetcher
 */

import { debug } from './logger.js';
import { extractVersionsFromPackument } from './version.js';

/**
 * Fetch packument (package metadata) from registry
 */
async function fetchPackument(registry, packageName, token, timeout) {
  const url = `${registry.replace(/\/$/, '')}/${packageName}`;
  
  debug(`Fetching metadata from ${url}`);
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const headers = {
      'Accept': 'application/json',
    };
    
    // Add auth token if provided
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
      signal: controller.signal,
      headers,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/**
 * Fetch metadata from a single host
 */
async function fetchHostMetadata(host, packageName, timeout) {
  const token = host.auth?.tokenEnv ? process.env[host.auth.tokenEnv] : null;
  
  try {
    const packument = await fetchPackument(
      host.registry,
      packageName,
      token,
      timeout
    );
    
    const versions = extractVersionsFromPackument(packument);
    
    debug(`Host '${host.name}' has ${versions.length} version(s)`);
    
    return {
      host,
      success: true,
      versions,
    };
  } catch (err) {
    debug(`Host '${host.name}' metadata fetch failed: ${err.message}`);
    
    return {
      host,
      success: false,
      error: err.message,
    };
  }
}

/**
 * Fetch metadata from all hosts concurrently with retry logic
 */
export async function fetchAllMetadata(hosts, packageName, baseTimeout) {
  debug(`Fetching metadata for '${packageName}' from ${hosts.length} host(s)`);
  
  let timeout = baseTimeout;
  const maxRetries = 2;
  
  for (let retry = 0; retry < maxRetries; retry++) {
    debug(`Metadata fetch attempt ${retry + 1}/${maxRetries} with ${timeout}ms timeout`);
    
    const promises = hosts.map(host => 
      fetchHostMetadata(host, packageName, timeout)
    );
    
    const results = await Promise.all(promises);
    
    // Check if we got at least one success
    const successResults = results.filter(r => r.success);
    
    if (successResults.length > 0) {
      debug(`Got metadata from ${successResults.length} host(s)`);
      return results;
    }
    
    // All failed, increase timeout for next retry
    if (retry < maxRetries - 1) {
      timeout += 30000; // Add 30s
      debug(`All metadata fetches failed, retrying with ${timeout}ms timeout`);
    }
  }
  
  debug('All metadata fetch attempts exhausted');
  return [];
}

/**
 * Collect all unique versions from metadata results
 */
export function collectAllVersions(metadataResults) {
  const allVersions = new Set();
  
  for (const result of metadataResults) {
    if (result.success && result.versions) {
      result.versions.forEach(v => allVersions.add(v));
    }
  }
  
  return Array.from(allVersions);
}

/**
 * Filter hosts that have a specific version
 */
export function filterHostsWithVersion(metadataResults, version) {
  return metadataResults
    .filter(r => r.success && r.versions && r.versions.includes(version))
    .map(r => r.host);
}
