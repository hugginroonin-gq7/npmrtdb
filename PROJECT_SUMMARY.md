# 📦 npmrtdb - Project Summary

## 🎯 What is this?

**npmrtdb** is a multi-host NPM/NPX wrapper that allows you to install and execute packages from multiple npm registries concurrently with intelligent fallback strategies.

## ✨ Key Features

🚀 **Concurrent Execution** - Tries all registries simultaneously, uses whoever responds first  
🌱 **Public-First Strategy** - Attempts public access before falling back to authentication  
🔢 **Smart Version Selection** - Two modes: `any` (fastest) or `latest` (highest version)  
🔐 **Token Management** - Automatic authentication handling per registry  
💻 **Cross-Platform** - Works on Windows, Linux, and macOS  
🧹 **Zero Config Changes** - Doesn't touch your global npm settings  

## 📁 Project Structure

```
npmrtdb/
├── bin/                    # CLI executables
│   ├── npmrtdb.js         # npm wrapper
│   └── npmxrtdb.js        # npx wrapper
├── src/                    # Core modules
│   ├── core.js            # Main orchestrator (2-stage strategy)
│   ├── executor.js        # Concurrent process execution
│   ├── metadata.js        # Package metadata fetcher
│   ├── version.js         # Digit-based version comparison
│   ├── db.js              # Database loader & validator
│   ├── npmrc.js           # Temp .npmrc generator
│   ├── args-parser.js     # Argument parser
│   ├── platform.js        # Platform detection
│   ├── logger.js          # Debug logging
│   └── help.js            # Help text
├── package.json
├── README.md              # Full documentation
├── QUICKSTART.md          # Getting started guide
├── INSTALLATION.md        # Installation instructions
├── ARCHITECTURE.md        # Technical architecture
├── CONTRIBUTING.md        # Contribution guide
├── TODO.md                # Future improvements
├── CHANGELOG.md           # Version history
├── example-db.json        # Sample configuration
├── test.js                # Basic tests
└── LICENSE                # MIT License
```

## 🚀 Quick Start

### 1. Extract the zip file
```bash
unzip npmrtdb.zip
cd npmrtdb
```

### 2. Install dependencies
```bash
npm install
```

### 3. Link globally (optional)
```bash
npm link
```

### 4. Try it out
```bash
# Show help
npmrtdb --help

# Use with a database URL
npmrtdb --db https://example.com/db.json install lodash

# Or set environment variable
export MHNPM_DB_URL="https://example.com/db.json"
npmrtdb install lodash
```

## 🎛️ How It Works

### Stage 1: Public-First (Concurrent)
All hosts configured without `alwaysAuth: true` are tried simultaneously without authentication tokens. First one to succeed wins!

### Stage 2: Token Fallback (Concurrent)
If Stage 1 fails with authentication errors, hosts with available tokens are tried concurrently. Again, first success wins.

### Cancellation
As soon as any host succeeds, all other attempts are immediately cancelled to save resources.

## 🔢 Version Modes

### `--mode=any` (Default)
- Use first available host with the package
- Fastest option
- Good for development

### `--mode=latest`
- Fetches metadata from all hosts
- Finds highest version using digit comparison
- Pins that exact version
- Good for production consistency

**Example of digit comparison:**
- `1.260131.11534` → `126013111534` (larger)
- `11.0.15` → `11015` (smaller)

## 🔐 Database Configuration

Create a JSON file with your registries:

```json
{
  "hosts": [
    {
      "name": "npmjs",
      "registry": "https://registry.npmjs.org/",
      "enabled": true
    },
    {
      "name": "github",
      "registry": "https://npm.pkg.github.com/",
      "scope": "@myorg",
      "auth": {
        "tokenEnv": "GITHUB_TOKEN",
        "alwaysAuth": false
      },
      "enabled": true
    }
  ]
}
```

Set tokens as environment variables:
```bash
export GITHUB_TOKEN="ghp_your_token"
export GITEA_TOKEN="your_gitea_token"
```

## 📊 Example Usage

```bash
# Install from any available host
npmrtdb install express

# Install with latest version pinning
npmrtdb --mode=latest install react

# Execute npx commands
npmxrtdb cowsay "Hello World"

# Debug mode
npmrtdb --debug install lodash

# JSON output
npmrtdb --json install lodash
```

## 🧪 Testing

Run basic tests:
```bash
npm test
```

Or manually:
```bash
node test.js
```

## 📖 Documentation Files

- **README.md** - Complete documentation with all features
- **QUICKSTART.md** - Fast getting started guide
- **INSTALLATION.md** - Detailed installation instructions
- **ARCHITECTURE.md** - Technical architecture documentation
- **CONTRIBUTING.md** - Guide for contributors
- **TODO.md** - Future improvements and roadmap
- **example-db.json** - Sample database configuration

## 🛠️ Requirements

- **Node.js**: 18.0.0 or higher
- **npm**: Included with Node.js
- **OS**: Windows, Linux, or macOS

## 🎯 Production Readiness

### ✅ Ready Now
- Concurrent execution
- Public-first strategy
- Cross-platform support
- Full npm/npx compatibility
- Clean error handling
- Comprehensive documentation

### 🔧 Nice to Have (See TODO.md)
- Unit tests
- CI/CD pipeline
- Metadata caching
- Performance monitoring
- Dry-run mode

## 📝 License

MIT License - See LICENSE file

## 🙏 Credits

Created by **Huggin** for efficient multi-host npm package management.

## 🔗 Next Steps

1. Read [QUICKSTART.md](QUICKSTART.md) to get started
2. Check [example-db.json](example-db.json) for configuration examples
3. Review [ARCHITECTURE.md](ARCHITECTURE.md) to understand internals
4. See [TODO.md](TODO.md) for contribution opportunities
5. Run `npm test` to verify installation

---

**Need Help?**
- Read the documentation in the project
- Check the example configuration
- Enable debug mode: `--debug`
- Review error messages carefully

**Want to Contribute?**
- See [CONTRIBUTING.md](CONTRIBUTING.md)
- Check [TODO.md](TODO.md) for ideas
- Submit issues and PRs

Happy package managing! 🎉
