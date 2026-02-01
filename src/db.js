/**
 * Database loader - fetch and validate hosts configuration
 * Hosts are now stored as object with fixed keys (not array)
 */

import { debug, error } from "./logger.js";

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
          Accept: "application/json",
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
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

/**
 * Validate host configuration
 */
function validateHost(host, name) {
  if (!host.registry || typeof host.registry !== "string") {
    throw new Error(`Host '${name}': missing or invalid 'registry' field`);
  }

  // Validate registry URL
  try {
    new URL(host.registry);
  } catch (err) {
    throw new Error(`Host '${name}': invalid registry URL '${host.registry}'`);
  }

  if (host.enabled !== undefined && typeof host.enabled !== "boolean") {
    throw new Error(`Host '${name}': 'enabled' must be boolean`);
  }

  return true;
}

/**
 * Load and validate hosts from DB URL
 * Returns array of hosts with name added from key
 */
export async function loadHosts(dbUrl) {
  if (!dbUrl) {
    throw new Error("DB URL is required. Use --db flag or set MHNPM_DB_URL environment variable");
  }

  debug(`Loading hosts from DB: ${dbUrl}`);

  const data = await fetchWithRetry(dbUrl);

  if (!data.hosts || typeof data.hosts !== "object" || Array.isArray(data.hosts)) {
    throw new Error('Invalid DB format: "hosts" must be an object (not array)');
  }

  const hostKeys = Object.keys(data.hosts);

  if (hostKeys.length === 0) {
    throw new Error("No hosts found in database");
  }

  // Convert object to array with name from key
  const hostsArray = [];

  for (const name of hostKeys) {
    const host = data.hosts[name];

    // Validate
    validateHost(host, name);

    // Skip disabled hosts
    if (host.enabled === false) {
      debug(`Skipping disabled host: ${name}`);
      continue;
    }

    // Add name from key
    hostsArray.push({
      name,
      ...host,
    });
  }

  if (hostsArray.length === 0) {
    throw new Error("No enabled hosts found in database");
  }

  debug(`Loaded ${hostsArray.length} enabled host(s): ${hostsArray.map((h) => h.name).join(", ")}`);

  return hostsArray;
}
