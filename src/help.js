/**
 * Help text for CLI tools
 */

export const NPMRTDB_HELP = `
npmrtdb - Multi-host NPM wrapper with concurrent registry attempts

USAGE:
  npmrtdb [wrapper-options] [--] [npm-args...]

WRAPPER OPTIONS:
  --db <url>              Database URL (or set MHNPM_DB_URL env)
  --mode <any|latest>     Version selection mode (default: any)
  --timeout <ms>          Timeout per attempt in milliseconds (default: 30000)
  --debug                 Enable debug logging
  --json                  Output machine-readable JSON result
  --prefer-public         Try public access first (default: true)
  --help, -h              Show this help message

MODES:
  any       Use first available host with package (fastest)
  latest    Use npm view, select highest version by digits, pin version

EXAMPLES:
  # Install lodash using any available host
  npmrtdb --db https://example.com/db.json install lodash

  # Install with latest version selection
  npmrtdb --db https://example.com/db.json --mode=latest install lodash

  # Install with all npm flags preserved
  npmrtdb install lodash --save-dev --legacy-peer-deps

  # Use -- separator to clearly separate wrapper and npm args
  npmrtdb --db https://example.com/db.json -- install lodash -D

ENVIRONMENT VARIABLES:
  MHNPM_DB_URL           Database URL (can be overridden by --db)
  <TOKEN_ENV>            Authentication tokens (e.g., GITHUB_TOKEN, GITEA_TOKEN)

NOTES:
  - Wrapper flags can appear anywhere in the command line
  - Use -- to explicitly separate wrapper flags from npm arguments
  - All npm flags and arguments are passed through unchanged
`;

export const NPMXRTDB_HELP = `
npmxrtdb - Multi-host NPX wrapper with concurrent registry attempts

USAGE:
  npmxrtdb [wrapper-options] [--] [npx-args...]

WRAPPER OPTIONS:
  --db <url>              Database URL (or set MHNPM_DB_URL env)
  --mode <any|latest>     Version selection mode (default: any)
  --timeout <ms>          Timeout per attempt in milliseconds (default: 30000)
  --debug                 Enable debug logging
  --json                  Output machine-readable JSON result
  --prefer-public         Try public access first (default: true)
  --help, -h              Show this help message

MODES:
  any       Use first available host with package (fastest)
  latest    Use npm view, select highest version by digits, pin version

EXAMPLES:
  # Execute eslint from any available host
  npmxrtdb --db https://example.com/db.json eslint --init

  # Execute with latest version selection
  npmxrtdb --db https://example.com/db.json --mode=latest eslint .

  # Execute with all npx flags preserved
  npmxrtdb cowsay "Hello World"

  # Use -- separator
  npmxrtdb --db https://example.com/db.json -- eslint . --fix

ENVIRONMENT VARIABLES:
  MHNPM_DB_URL           Database URL (can be overridden by --db)
  <TOKEN_ENV>            Authentication tokens (e.g., GITHUB_TOKEN, GITEA_TOKEN)

NOTES:
  - Wrapper flags can appear anywhere in the command line
  - Use -- to explicitly separate wrapper flags from npx arguments
  - All npx flags and arguments are passed through unchanged
`;

export function showHelp(toolName) {
  if (toolName === "npmrtdb") {
    console.log(NPMRTDB_HELP);
  } else if (toolName === "npmxrtdb") {
    console.log(NPMXRTDB_HELP);
  }
}
