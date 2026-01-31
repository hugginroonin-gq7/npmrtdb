/**
 * Database loader - fetch and validate hosts configuration
 */

import { debug, error } from './logger.js';

/**
 * Fetch JSON from URL with timeout and retries
 */
async function fetchWithRetry(url, timeout = 10000, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      debug(`Fetching DB from ${url} (attempt ${i + 1}/${retries + 1})`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      if (i === retries) {
        throw new Error(`Failed to fetch DB after ${retries + 1} attempts: ${err.message}`);
      }
      debug(`Fetch failed, retrying... (${err.message})`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

/**
 * Validate host configuration
 */
function validateHost(host, index) {
  if (!host.name || typeof host.name !== 'string') {
    throw new Error(`Host at index ${index}: missing or invalid 'name' field`);
  }
  
  if (!host.registry || typeof host.registry !== 'string') {
    throw new Error(`Host '${host.name}': missing or invalid 'registry' field`);
  }
  
  // Validate registry URL
  try {
    new URL(host.registry);
  } catch (err) {
    throw new Error(`Host '${host.name}': invalid registry URL '${host.registry}'`);
  }
  
  if (host.enabled !== undefined && typeof host.enabled !== 'boolean') {
    throw new Error(`Host '${host.name}': 'enabled' must be boolean`);
  }
  
  return true;
}

/**
 * Load and validate hosts from DB URL
 */
export async function loadHosts(dbUrl) {
  if (!dbUrl) {
    throw new Error('DB URL is required. Use --db flag or set MHNPM_DB_URL environment variable');
  }
  
  debug(`Loading hosts from DB: ${dbUrl}`);
  
  const data = await fetchWithRetry(dbUrl);
  
  if (!data.hosts || !Array.isArray(data.hosts)) {
    throw new Error('Invalid DB format: missing or invalid "hosts" array');
  }
  
  if (data.hosts.length === 0) {
    throw new Error('No hosts found in database');
  }
  
  // Validate each host
  data.hosts.forEach((host, index) => validateHost(host, index));
  
  // Filter enabled hosts only
  const enabledHosts = data.hosts.filter(host => host.enabled !== false);
  
  if (enabledHosts.length === 0) {
    throw new Error('No enabled hosts found in database');
  }
  
  debug(`Loaded ${enabledHosts.length} enabled host(s): ${enabledHosts.map(h => h.name).join(', ')}`);
  
  return enabledHosts;
}
