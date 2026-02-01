# 📦 npmrtdb

Multi-host NPM/NPX wrapper - ủy quyền npm CLI xử lý toàn bộ network operations.

## 🎯 Đặc điểm

✅ **Concurrent execution** - Thử nhiều registry cùng lúc  
✅ **Public-first strategy** - Thử public trước, fallback token sau  
✅ **npm CLI delegation** - Không tự fetch, ủy quyền cho `npm view` / `npm install` / `npx`  
✅ **Digit-based version comparison** - So sánh version theo digits (không semver)  
✅ **Cross-platform** - Windows + Linux  
✅ **Zero global config changes** - Không đụng npm config toàn cục

---

## 🚀 Cài đặt

```bash
npm install -g npmrtdb
```

Hoặc dùng trực tiếp:

```bash
npx npmrtdb --db <url> install lodash
```

---

## 📋 Sử dụng

### npmrtdb (npm wrapper)

```bash
# Cơ bản
npmrtdb --db https://example.com/db.json install lodash

# Với mode latest (npm view để tìm version cao nhất)
npmrtdb --db https://example.com/db.json --mode=latest install lodash

# Pass-through mọi flags
npmrtdb install lodash --save-dev --legacy-peer-deps

# Dùng -- để tách wrapper flags và npm args
npmrtdb --db https://example.com/db.json --debug -- install lodash -D
```

### npmxrtdb (npx wrapper)

```bash
# Execute package từ host nào có trước
npmxrtdb --db https://example.com/db.json eslint --init

# Với latest version
npmxrtdb --db https://example.com/db.json --mode=latest cowsay "Hello"

# Pass-through flags
npmxrtdb --package=@angular/cli ng new my-app
```

---

## ⚙️ Database JSON

### Schema mới (object với key cố định)

```json
{
  "hosts": {
    "npmjs": {
      "registry": "https://registry.npmjs.org/",
      "enabled": true
    },
    "github": {
      "registry": "https://npm.pkg.github.com/",
      "scope": "@myorg",
      "auth": {
        "tokenEnv": "GITHUB_TOKEN",
        "alwaysAuth": false
      },
      "enabled": true
    },
    "gitea": {
      "registry": "https://gitea.example.com/api/packages/myorg/npm/",
      "auth": {
        "tokenEnv": "GITEA_TOKEN",
        "alwaysAuth": false
      },
      "npmrcExtras": ["strict-ssl=false"],
      "enabled": true
    }
  }
}
```

### Host fields

- **registry** (required): URL registry
- **enabled** (optional, default true): Bật/tắt host
- **scope** (optional): Scope cho scoped packages (ví dụ `@myorg`)
- **auth** (optional):
  - **tokenEnv**: Tên biến môi trường chứa token
  - **alwaysAuth**: Luôn gửi auth (default false)
- **npmrcExtras** (optional): Các dòng `.npmrc` bổ sung

### Env variables

DB URL:

- Flag `--db <url>`, hoặc
- Env `MHNPM_DB_URL`

Tokens:

```bash
export GITHUB_TOKEN="ghp_..."
export GITEA_TOKEN="..."
```

---

## 🎛️ Wrapper Options

| Flag                   | Mô tả               | Default         |
| ---------------------- | ------------------- | --------------- |
| `--db <url>`           | Database URL        | `$MHNPM_DB_URL` |
| `--mode <any\|latest>` | Chế độ chọn version | `any`           |
| `--timeout <ms>`       | Timeout mỗi attempt | `30000`         |
| `--debug`              | Bật debug logging   | `false`         |
| `--json`               | Output JSON         | `false`         |
| `--prefer-public`      | Thử public trước    | `true`          |
| `--help, -h`           | Hiện help           | -               |

---

## 🔄 Chiến lược thực thi

### Stage 1: Public-first (Concurrent)

Tất cả hosts không có `alwaysAuth: true` sẽ chạy song song **không cần token**.

### Stage 2: Token fallback (Concurrent)

Nếu Stage 1 fail với auth errors, các host có token sẽ chạy song song **với token**.

### Cancellation

Host nào thành công trước → cancel toàn bộ host còn lại.

---

## 🔢 Version Selection Modes

### `any` (default)

Dùng host nào có package và chạy/cài được trước. **Nhanh nhất**.

### `latest`

1. Chạy `npm view <package> versions --json` trên các hosts (song song)
2. Gom tất cả versions
3. Tìm version cao nhất theo **digit comparison**
4. Pin version đó vào args
5. Chạy install/exec với version pin

**Digit Comparison:**

- `1.260131.11534` → digits: `126013111534`
- `11.0.15` → digits: `11015`
- Winner: `1.260131.11534` (số lớn hơn)

---

## 🔐 Authentication

Set environment variables:

```bash
export GITHUB_TOKEN="ghp_..."
export GITEA_TOKEN="..."
```

Wrapper tự động dùng token khi cần (Stage 2).

---

## 🐛 Troubleshooting

### "All attempts failed"

```bash
npmrtdb --debug install lodash
```

### "401 Unauthorized"

Check token:

```bash
echo $GITHUB_TOKEN
```

### Timeout errors

Tăng timeout:

```bash
npmrtdb --timeout=60000 install lodash
```

---

## 📊 JSON Output

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

---

## 🔧 Development

```bash
# Clone & install
git clone <repo-url>
cd npmrtdb
npm install

# Link locally
npm link

# Test
npmrtdb --help
```

---

## 📝 License

MIT

---

## 🙏 Credits

Created by **Huggin** for efficient multi-host npm package management.
