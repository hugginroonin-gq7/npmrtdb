# 🏗️ Architecture Documentation

## Overview

npmrtdb is a multi-host NPM/NPX wrapper that enables concurrent package installation and execution from multiple registries with intelligent fallback strategies.

## Design Principles

1. **Concurrent-first**: All hosts are tried simultaneously for maximum speed
2. **Public-first**: Attempt public access before falling back to authentication
3. **Zero-config**: No modification to user's global npm configuration
4. **Cross-platform**: Works identically on Windows, Linux, and macOS
5. **Fail-fast**: Cancel all attempts as soon as one succeeds

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      User Command                            │
│  npmrtdb --db <url> --mode=latest install lodash            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   CLI Entrypoint                             │
│              (bin/npmrtdb.js)                                │
│  • Parse arguments                                           │
│  • Set debug mode                                            │
│  • Load database                                             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   Args Parser                                │
│             (src/args-parser.js)                             │
│  • Separate wrapper flags from pass-through args            │
│  • Extract package name                                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  Database Loader                             │
│                (src/db.js)                                   │
│  • Fetch JSON from URL                                       │
│  • Validate schema                                           │
│  • Filter enabled hosts                                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
┌──────────────────┐    ┌──────────────────┐
│  Mode: any       │    │  Mode: latest    │
│  (Fast path)     │    │  (Metadata)      │
└────────┬─────────┘    └────────┬─────────┘
         │                       │
         │                       ▼
         │              ┌─────────────────────────┐
         │              │  Metadata Fetcher       │
         │              │  (src/metadata.js)      │
         │              │  • Fetch from all hosts │
         │              │  • Concurrent with      │
         │              │    timeout & retry      │
         │              └───────────┬─────────────┘
         │                          │
         │                          ▼
         │              ┌─────────────────────────┐
         │              │  Version Comparator     │
         │              │  (src/version.js)       │
         │              │  • Extract digits       │
         │              │  • Find max version     │
         │              │  • Pin to args          │
         │              └───────────┬─────────────┘
         │                          │
         └──────────────┬───────────┘
                        │
                        ▼
         ┌──────────────────────────────────┐
         │        Orchestrator              │
         │       (src/core.js)              │
         │                                  │
         │  Stage 1: Public-first           │
         │  ┌────────────────────────┐      │
         │  │  For each public host: │      │
         │  │  • Create temp .npmrc  │      │
         │  │  • Spawn npm/npx       │      │
         │  │  • Run concurrently    │      │
         │  └────────┬───────────────┘      │
         │           │                      │
         │           ▼                      │
         │  ┌────────────────────────┐      │
         │  │  First success?        │      │
         │  │  Yes → Cancel others   │      │
         │  │  No  → Stage 2         │      │
         │  └────────┬───────────────┘      │
         │           │                      │
         │           ▼                      │
         │  Stage 2: Token fallback         │
         │  ┌────────────────────────┐      │
         │  │  For hosts with tokens:│      │
         │  │  • Create .npmrc+token │      │
         │  │  • Spawn npm/npx       │      │
         │  │  • Run concurrently    │      │
         │  └────────┬───────────────┘      │
         │           │                      │
         └───────────┼──────────────────────┘
                     │
                     ▼
         ┌──────────────────────────┐
         │    Process Executor      │
         │   (src/executor.js)      │
         │  • Spawn child process   │
         │  • Monitor with signal   │
         │  • Cancel on winner      │
         │  • Collect errors        │
         └──────────┬───────────────┘
                    │
                    ▼
         ┌──────────────────────────┐
         │      Cleanup             │
         │  • Delete temp .npmrc    │
         │  • Kill remaining procs  │
         │  • Return winner         │
         └──────────────────────────┘
```

## Module Responsibilities

### CLI Layer (`bin/`)

**npmrtdb.js** & **npmxrtdb.js**
- Entry points for npm and npx wrappers
- Handle command-line invocation
- Set up error handlers
- Output final results

### Core Logic (`src/core.js`)

**Orchestrator**
- Implements 2-stage execution strategy
- Manages concurrent attempts
- Handles mode selection (any vs latest)
- Coordinates all other modules

### Data Management

**db.js**
- Fetches database JSON from URL
- Validates schema
- Filters enabled hosts
- Provides retry logic for network failures

**metadata.js**
- Fetches package metadata from registries
- Implements concurrent fetch with timeout
- Auto-retry with increased timeout
- Extracts version information

**version.js**
- Digit-based version comparison
- Finds latest version from list
- Extracts versions from packument

### Execution Layer

**executor.js**
- Spawns npm/npx child processes
- Implements concurrent execution with AbortController
- Handles cancellation when winner found
- Collects and formats errors
- Detects authentication errors

**npmrc.js**
- Generates temporary .npmrc files
- Handles scope-specific registries
- Manages authentication tokens
- Cleanup temporary files

**platform.js**
- Detects operating system
- Resolves correct npm/npx command (npm.cmd on Windows)
- Provides cross-platform compatibility

### Utilities

**args-parser.js**
- Parses command-line arguments
- Separates wrapper flags from pass-through args
- Supports `--` separator
- Extracts package names

**logger.js**
- Debug mode logging
- Consistent error/info output
- Conditionally enabled based on flags

**help.js**
- Help text for both tools
- Usage examples
- Option documentation

## Execution Flow

### Mode: any (Fast Path)

1. Parse arguments
2. Load database
3. Create public attempts (hosts without alwaysAuth)
4. Run all attempts concurrently
5. First success → cancel others, return winner
6. All fail + auth errors → Stage 2 (tokens)
7. Run token attempts concurrently
8. Return winner or aggregate errors

### Mode: latest (Metadata Path)

1. Parse arguments
2. Load database
3. **Fetch metadata from ALL hosts concurrently**
   - Timeout: 30s (first attempt)
   - Retry: 60s (second attempt) if all fail
4. **Collect all versions across hosts**
5. **Find max version using digit comparison**
6. **Pin version to install/exec args**
7. **Filter hosts that have this version**
8. Continue with Stage 1/2 using filtered hosts

## Concurrency Model

### Concurrent Execution
```javascript
Promise.all([
  attempt1,
  attempt2,
  attempt3,
])
```

### Race to First Success
```javascript
Promise.race([
  attempt1.then(success),
  attempt2.then(success),
  attempt3.then(success),
])
```

### Cancellation
```javascript
const controller = new AbortController();
spawn(cmd, args, { signal: controller.signal });
// On winner:
controller.abort(); // Cancels all attempts
```

## Error Handling Strategy

### Network Errors
- Retry with exponential backoff
- Aggregate errors from all hosts
- Clear error messages to user

### Authentication Errors
- Detect 401/403/ENEEDAUTH
- Trigger Stage 2 (token fallback)
- Log which hosts need authentication

### Timeout Errors
- Per-attempt timeout (30s default)
- Increased retry timeout (60s)
- Global timeout not implemented yet (TODO)

## Temporary File Management

Each attempt creates:
```
/tmp/npmrtdb-XXXXXX/
  └── .npmrc
```

Cleanup happens:
- After successful execution
- After failed execution
- Via try/finally blocks

## Cross-Platform Considerations

### Windows
- Use `npm.cmd` and `npx.cmd`
- AbortController might not kill immediately
- Path separators handled by Node.js path module

### Linux/macOS
- Use `npm` and `npx` directly
- Standard POSIX signals work well

### Universal
- All paths use `path.join()`
- Temp directories use `os.tmpdir()`
- No bash/shell-specific commands

## Performance Characteristics

### Time Complexity
- **Mode any**: O(1) - first success
- **Mode latest**: O(n) metadata fetch + O(1) execution

### Space Complexity
- O(n) temporary .npmrc files (n = number of hosts)
- O(m) for metadata storage (m = total versions)

### Network Usage
- **Mode any**: Minimal - stops after first success
- **Mode latest**: Higher - fetches all metadata first

## Security Considerations

### Token Handling
- Tokens never logged (TODO: sanitize in errors)
- Stored in temporary .npmrc with restrictive permissions
- Cleaned up after execution

### Registry URLs
- Validated as proper URLs
- HTTPS enforced (except custom npmrcExtras)
- No localhost in production (TODO)

### Process Isolation
- Each attempt isolated with temp .npmrc
- No global config modification
- Separate child processes

## Extension Points

### Adding New Features
1. **New wrapper flag**: Add to args-parser.js
2. **New stage**: Modify core.js orchestrator
3. **New host strategy**: Extend db.js schema
4. **New version logic**: Modify version.js

### Plugin System (Future)
```javascript
// Example plugin API (not implemented)
export function beforeExecute(host, args) {
  // Modify args based on host
  return args;
}

export function onSuccess(host, result) {
  // Post-process successful execution
}
```

## Testing Strategy

### Unit Tests (TODO)
- Each module tested independently
- Mock external dependencies (fetch, spawn)
- Test error conditions

### Integration Tests (TODO)
- Use Verdaccio (local npm registry)
- Test real npm/npx execution
- Test concurrent scenarios

### Platform Tests (TODO)
- GitHub Actions matrix
- Windows + Linux + macOS
- Multiple Node.js versions

## Future Architecture Improvements

1. **Plugin System**: Allow custom host selection strategies
2. **Caching Layer**: Cache packument to reduce network calls
3. **Health Monitoring**: Track host performance over time
4. **Smart Ordering**: Prioritize faster hosts based on history
5. **Distributed Cache**: Share metadata across machines
6. **Event System**: Emit events for monitoring/telemetry

## Performance Tuning

### Current Optimizations
- Concurrent execution (not sequential)
- Early cancellation on success
- Minimal overhead (no heavy dependencies)

### Future Optimizations
- Metadata cache with TTL
- Connection pooling
- Request deduplication
- Staggered retries to reduce thundering herd

## Conclusion

The architecture prioritizes:
- **Speed**: Concurrent execution
- **Reliability**: 2-stage fallback
- **Simplicity**: Minimal dependencies
- **Portability**: Cross-platform compatibility
- **Safety**: No global config changes

This design allows for efficient multi-host package management while maintaining npm/npx compatibility.
