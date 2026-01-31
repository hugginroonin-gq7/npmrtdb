/**
 * Temporary .npmrc file generation
 */

import { mkdtemp, writeFile, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { debug } from './logger.js';

/**
 * Create temporary .npmrc file for a host
 */
export async function createTempNpmrc(host, token = null) {
  const tempDir = await mkdtemp(join(tmpdir(), 'npmrtdb-'));
  const npmrcPath = join(tempDir, '.npmrc');
  
  const lines = [];
  
  // Main registry configuration
  lines.push(`registry=${host.registry}`);
  
  // Scope-specific registry
  if (host.scope) {
    lines.push(`${host.scope}:registry=${host.registry}`);
  }
  
  // Authentication token
  if (token) {
    try {
      const registryUrl = new URL(host.registry);
      const registryHost = registryUrl.host;
      
      // Format: //registry.host.com/:_authToken=TOKEN
      lines.push(`//${registryHost}/:_authToken=${token}`);
    } catch (err) {
      debug(`Failed to parse registry URL for auth: ${err.message}`);
    }
  }
  
  // Always auth setting
  if (host.auth?.alwaysAuth) {
    lines.push('always-auth=true');
  }
  
  // Extra npmrc lines
  if (host.npmrcExtras && Array.isArray(host.npmrcExtras)) {
    lines.push(...host.npmrcExtras);
  }
  
  const content = lines.join('\n') + '\n';
  
  await writeFile(npmrcPath, content, 'utf8');
  
  debug(`Created temp .npmrc at ${npmrcPath} for host '${host.name}'`);
  debug(`Content:\n${content}`);
  
  return { npmrcPath, tempDir };
}

/**
 * Cleanup temporary directory
 */
export async function cleanupTemp(tempDir) {
  try {
    await rm(tempDir, { recursive: true, force: true });
    debug(`Cleaned up temp directory: ${tempDir}`);
  } catch (err) {
    debug(`Failed to cleanup temp directory ${tempDir}: ${err.message}`);
  }
}
