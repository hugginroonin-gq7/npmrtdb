# 📦 npmrtdb

Multi-host NPM/NPX wrapper with concurrent registry attempts and public-first strategy.

## 🎯 Features

✅ **Concurrent execution** - Try multiple npm registries simultaneously for maximum speed  
✅ **Public-first strategy** - Attempt public access before falling back to authenticated requests  
✅ **Smart version selection** - Choose any available version or pin to the latest based on digit comparison  
✅ **Cross-platform** - Works on Windows, Linux, and macOS  
✅ **Zero configuration changes** - Doesn't modify your global npm configuration  
✅ **Full pass-through** - All npm/npx flags and arguments work exactly as expected  

## 🚀 Installation

```bash
npm install -g npmrtdb
```

Or use directly with npx:

```bash
npx npmrtdb --db <url> install lodash
```

## 📋 Usage

### npmrtdb (npm wrapper)

```bash
# Basic usage
npmrtdb --db https://example.com/db.json install lodash

# With latest version selection
npmrtdb --db https://example.com/db.json --mode=latest install lodash

# All npm flags work
npmrtdb install lodash --save-dev --legacy-peer-deps

# Use -- to separate wrapper and npm args
npmrtdb --db https://example.com/db.json --debug -- install lodash -D
```

### npmxrtdb (npx wrapper)

```bash
# Execute packages from any available host
npmxrtdb --db https://example.com/db.json eslint --init

# With latest version
npmxrtdb --db https://example.com/db.json --mode=latest cowsay "Hello"

# All npx flags work
npmxrtdb --package=@angular/cli ng new my-app
```

## ⚙️ Configuration

### Database URL

The database URL can be provided via:
- `--db <url>` flag
- `MHNPM_DB_URL` environment variable

### Database JSON Schema

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
    },
    {
      "name": "gitea",
      "registry": "https://gitea.example.com/api/packages/myorg/npm/",
      "auth": {
        "tokenEnv": "GITEA_TOKEN",
        "alwaysAuth": false
      },
      "npmrcExtras": [
        "strict-ssl=false"
      ],
      "enabled": true
    }
  ]
}
```

### Host Fields

- **name** (required): Human-readable identifier
- **registry** (required): Registry URL
- **enabled** (optional, default: true): Whether to use this host
- **scope** (optional): Scope for scoped packages (e.g., `@myorg`)
- **auth** (optional): Authentication configuration
  - **tokenEnv**: Environment variable name containing auth token
  - **alwaysAuth**: Whether to always send auth (default: false)
- **npmrcExtras** (optional): Additional .npmrc lines

## 🎛️ Wrapper Options

| Flag | Description | Default |
|------|-------------|---------|
| `--db <url>` | Database URL | `$MHNPM_DB_URL` |
| `--mode <any\|latest>` | Version selection mode | `any` |
| `--timeout <ms>` | Timeout per attempt | `30000` |
| `--debug` | Enable debug logging | `false` |
| `--json` | Output JSON result | `false` |
| `--prefer-public` | Try public first | `true` |
| `--help, -h` | Show help | - |

## 🔄 Execution Strategy

### Stage 1: Public-first (Concurrent)

All hosts without `alwaysAuth: true` are tried simultaneously without authentication.

### Stage 2: Token fallback (Concurrent)

If Stage 1 fails with authentication errors, hosts with available tokens are tried concurrently.

### Cancellation

When any host succeeds, all other attempts are immediately cancelled to save resources.

## 🔢 Version Selection Modes

### `any` (default)

Use the first host that successfully provides the package. Fastest option.

### `latest`

1. Fetch metadata from all hosts concurrently
2. Collect all available versions
3. Select the highest version using digit comparison
4. Pin that exact version when installing/executing
5. Only use hosts that have the selected version

**Digit Comparison Example:**
- `1.260131.11534` → digits: `126013111534`
- `11.0.15` → digits: `11015`
- Winner: `1.260131.11534` (larger digit value)

## 🔐 Authentication

Set environment variables for private registries:

```bash
export GITHUB_TOKEN="ghp_..."
export GITEA_TOKEN="..."
export NPM_TOKEN="..."
```

The wrapper will automatically use tokens when needed based on host configuration.

## 🐛 Troubleshooting

### "All attempts failed"

Enable debug mode to see detailed error messages:

```bash
npmrtdb --debug install lodash
```

### "401 Unauthorized"

Make sure your authentication tokens are set correctly:

```bash
echo $GITHUB_TOKEN  # Should output your token
```

### Timeout errors

Increase timeout if you have slow network:

```bash
npmrtdb --timeout=60000 install lodash
```

### No metadata found (latest mode)

Some hosts might not respond in time. The wrapper will automatically retry with increased timeout.

## 📊 JSON Output

Use `--json` to get machine-readable output:

```bash
npmrtdb --json --db https://example.com/db.json install lodash
```

Output:
```json
{
  "success": true,
  "host": "npmjs",
  "registry": "https://registry.npmjs.org/",
  "elapsed": 1523
}
```

## 🔧 Development

### Local testing

```bash
# Clone the repo
git clone <repo-url>
cd npmrtdb

# Install dependencies
npm install

# Link locally
npm link

# Test
npmrtdb --help
npmxrtdb --help
```

### Run with debug

```bash
npmrtdb --debug --db <url> install lodash
```

## 📝 License

MIT

## 🙏 Credits

Created by Huggin for efficient multi-host npm package management.

## 🔗 Links

- [npm documentation](https://docs.npmjs.com/)
- [npx documentation](https://docs.npmjs.com/cli/v10/commands/npx)
- [GitHub Packages npm registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry)
