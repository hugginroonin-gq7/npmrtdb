# Contributing to npmrtdb

Thank you for your interest in contributing to npmrtdb! 🎉

## Development Setup

1. **Fork and clone the repository**

```bash
git clone https://github.com/your-username/npmrtdb.git
cd npmrtdb
```

2. **Install dependencies**

```bash
npm install
```

3. **Link for local testing**

```bash
npm link
```

4. **Test your changes**

```bash
npmrtdb --help
npmxrtdb --help
```

## Project Structure

```
npmrtdb/
├── bin/                    # CLI entrypoints
│   ├── npmrtdb.js         # NPM wrapper
│   └── npmxrtdb.js        # NPX wrapper
├── src/                    # Core modules
│   ├── args-parser.js     # Argument parsing
│   ├── core.js            # Main orchestrator
│   ├── db.js              # Database loader
│   ├── executor.js        # Process execution
│   ├── help.js            # Help text
│   ├── logger.js          # Logging utilities
│   ├── metadata.js        # Package metadata fetcher
│   ├── npmrc.js           # .npmrc generator
│   ├── platform.js        # Platform detection
│   └── version.js         # Version comparison
├── package.json
├── README.md
└── example-db.json        # Sample database
```

## Code Style

- Use ES modules (`import/export`)
- 2 spaces indentation
- Semicolons optional but consistent
- Use JSDoc comments for public functions
- Keep functions small and focused

## Testing

Before submitting a PR:

1. **Manual testing**

```bash
# Test npm wrapper
npmrtdb --debug install lodash

# Test npx wrapper
npmxrtdb --debug cowsay "Test"

# Test with sample DB
npmrtdb --db ./example-db.json install express
```

2. **Test on both platforms** (if possible)
   - Windows
   - Linux/macOS

## Submitting Changes

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Update documentation if needed
5. Submit a pull request

## Bug Reports

Please include:
- Node.js version
- Operating system
- Command that failed
- Full error output (use `--debug`)
- Expected vs actual behavior

## Feature Requests

Open an issue describing:
- Use case
- Proposed solution
- Alternative approaches considered

## Questions?

Feel free to open an issue for discussion!
