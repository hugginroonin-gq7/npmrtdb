# 🚀 Quick Start Guide

## Installation

```bash
npm install -g npmrtdb
```

## Setup

1. **Create a database JSON file** (or use a hosted URL):

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
        "tokenEnv": "GITHUB_TOKEN"
      },
      "enabled": true
    }
  ]
}
```

2. **Set environment variable** (optional):

```bash
export MHNPM_DB_URL="https://example.com/db.json"
```

3. **Set auth tokens** for private registries:

```bash
export GITHUB_TOKEN="ghp_your_token_here"
export GITEA_TOKEN="your_gitea_token"
```

## Basic Usage

### Install packages

```bash
# Using environment variable
npmrtdb install lodash

# Using --db flag
npmrtdb --db https://example.com/db.json install lodash

# With npm flags
npmrtdb install lodash --save-dev
```

### Execute packages

```bash
# Run npx commands
npmxrtdb cowsay "Hello World"

# With latest version
npmxrtdb --mode=latest eslint --init
```

## Common Scenarios

### 1. Install from any available host (fastest)

```bash
npmrtdb install express
```

### 2. Install specific version from latest available

```bash
npmrtdb --mode=latest install react
```

### 3. Debug connection issues

```bash
npmrtdb --debug install lodash
```

### 4. Private package with authentication

```bash
export GITHUB_TOKEN="ghp_..."
npmrtdb install @myorg/private-package
```

### 5. Get JSON output for scripting

```bash
npmrtdb --json install lodash > result.json
```

## Tips

✅ Use `--mode=any` for speed (default)  
✅ Use `--mode=latest` for version consistency  
✅ Use `--debug` to troubleshoot issues  
✅ Use `--timeout` to adjust for slow networks  
✅ Set `MHNPM_DB_URL` to avoid typing `--db` every time  

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check [example-db.json](example-db.json) for configuration examples
- Report issues or contribute on GitHub
