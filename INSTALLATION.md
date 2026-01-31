# 📥 Installation Guide

## Quick Install

### Global Installation (Recommended)

```bash
npm install -g npmrtdb
```

After installation, you can use `npmrtdb` and `npmxrtdb` from anywhere.

### Local Installation

```bash
npm install npmrtdb
```

Then use via npx:

```bash
npx npmrtdb --db <url> install lodash
npx npmxrtdb --db <url> cowsay "Hello"
```

### Direct Usage (No Installation)

```bash
npx npmrtdb --db <url> install lodash
```

## From Source

1. **Clone or download the project**

```bash
# Extract the zip file
unzip npmrtdb.zip
cd npmrtdb
```

2. **Install dependencies**

```bash
npm install
```

3. **Link globally**

```bash
npm link
```

4. **Verify installation**

```bash
npmrtdb --help
npmxrtdb --help
```

## Requirements

- **Node.js**: 18.0.0 or higher
- **npm**: Comes with Node.js
- **Operating System**: Windows, Linux, or macOS

## Verification

Test the installation:

```bash
# Check version
npmrtdb --help | head -n 1
npmxrtdb --help | head -n 1

# Test with a simple command
npmrtdb --db https://example.com/db.json --help
```

## Troubleshooting

### "command not found" after global install

Make sure npm global bin directory is in your PATH:

```bash
# Check npm global bin path
npm bin -g

# Add to PATH (Linux/macOS)
export PATH="$(npm bin -g):$PATH"

# Add to PATH (Windows, in PowerShell)
$env:PATH += ";$(npm bin -g)"
```

### Permission errors on Linux/macOS

Use `sudo` for global installation:

```bash
sudo npm install -g npmrtdb
```

Or configure npm to use a different directory:

```bash
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
npm install -g npmrtdb
```

### Windows: "cannot be loaded because running scripts is disabled"

Enable script execution in PowerShell:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## Updating

```bash
npm update -g npmrtdb
```

## Uninstalling

```bash
npm uninstall -g npmrtdb
```

## Next Steps

After installation, check out:
- [Quick Start Guide](QUICKSTART.md)
- [Full Documentation](README.md)
- [Example Configuration](example-db.json)
