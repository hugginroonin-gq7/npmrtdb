# 📝 TODO & Future Improvements

## 🔧 Core Functionality

- [ ] Add unit tests with Vitest or Node test runner
- [ ] Add integration tests with Verdaccio (local npm registry)
- [ ] Implement retry logic with exponential backoff
- [ ] Add support for custom registry headers
- [ ] Implement cache for packument to reduce network requests
- [ ] Add dry-run mode (`--dry-run`)
- [ ] Add verbose mode (`--verbose`) for more detailed logging

## 🎨 User Experience

- [ ] Add progress indicators during concurrent attempts
- [ ] Colorize debug output with chalk
- [ ] Add interactive mode to select host manually
- [ ] Show download/upload progress bars
- [ ] Add completion time estimation
- [ ] Add `--quiet` mode to suppress all output except errors

## 🔐 Security & Stability

- [ ] Sanitize all tokens in logs and error messages
- [ ] Add global timeout for entire operation
- [ ] Implement proper cleanup for orphan processes on crashes
- [ ] Add validation for registry URLs (block localhost in production)
- [ ] Add checksum verification for packages
- [ ] Support for certificate pinning

## ⚡ Performance

- [ ] Implement smart host ordering based on past performance
- [ ] Add metadata cache with TTL (5 minutes)
- [ ] Parallel metadata fetch with staggered delays
- [ ] Add connection pooling for HTTP requests
- [ ] Implement request deduplication

## 📊 Monitoring & Analytics

- [ ] Add telemetry (opt-in) to track which hosts are fastest
- [ ] Generate performance reports
- [ ] Add health check command (`npmrtdb health`)
- [ ] Log timing information for each stage
- [ ] Add statistics dashboard

## 🧪 Testing & Quality

- [ ] Set up GitHub Actions CI/CD
- [ ] Add Windows + Linux test matrix
- [ ] Add code coverage reporting
- [ ] Add linting (ESLint)
- [ ] Add formatting (Prettier)
- [ ] Add pre-commit hooks

## 📚 Documentation

- [ ] Add video tutorial
- [ ] Create troubleshooting flowchart
- [ ] Add recipes for common scenarios
- [ ] Create migration guide from manual .npmrc
- [ ] Add FAQ section
- [ ] Document all error codes

## 🌐 Features

- [ ] Support for .yarnrc.yml (Yarn v2/v3)
- [ ] Support for pnpm configuration
- [ ] Add plugin system for custom host strategies
- [ ] Support for workspace/monorepo configurations
- [ ] Add support for multiple database sources with fallback
- [ ] Implement host health monitoring
- [ ] Add support for proxy configuration

## 🔄 DevOps

- [ ] Automated version bumping
- [ ] Automated changelog generation
- [ ] NPM package publishing workflow
- [ ] Docker image for CI/CD usage
- [ ] GitHub release automation

## 🐛 Known Issues

- [ ] Windows: AbortController might not kill child processes immediately
  - **Workaround**: Add PID-based kill fallback
- [ ] Large packument fetches can timeout
  - **Workaround**: Implemented retry with increased timeout
- [ ] No cleanup if Node.js process killed forcefully
  - **Workaround**: Add process signal handlers

## 💡 Ideas for Consideration

- [ ] GUI tool for managing database JSON
- [ ] Browser extension for viewing package availability
- [ ] VS Code extension integration
- [ ] Support for alternative package managers (pnpm, yarn)
- [ ] Machine learning-based host selection
- [ ] Distributed caching layer
- [ ] P2P package sharing

## 🎯 Priority Items (v0.2.0)

1. Unit tests for core modules
2. GitHub Actions CI
3. Cache for packument
4. Dry-run mode
5. Better error messages

## 🚀 Production Readiness Checklist

- [ ] All core features implemented ✅
- [ ] Comprehensive test coverage
- [ ] Security audit completed
- [ ] Performance benchmarking done
- [ ] Documentation complete ✅
- [ ] CI/CD pipeline set up
- [ ] Error handling hardened
- [ ] Monitoring & logging ready
- [ ] Release process documented

---

**Contributing**: Feel free to pick any item from this list! See [CONTRIBUTING.md](CONTRIBUTING.md) for details.
