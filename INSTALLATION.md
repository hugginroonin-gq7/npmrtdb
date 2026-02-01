# 📥 Cài đặt npmrtdb

## 🚀 Quick Install

```bash
# Từ thư mục project
cd npmrtdb
npm install
npm link
```

## ✅ Verify

```bash
npmrtdb --help
npmxrtdb --help
```

## 🧪 Test

```bash
npm test
```

Hoặc:

```bash
node test.js
```

## 📦 Publish (Optional)

```bash
npm publish
```

## 🔧 Uninstall

```bash
npm unlink
```

---

## 💡 Development Tips

### Test locally without linking

```bash
node bin/npmrtdb.js --help
node bin/npmxrtdb.js --help
```

### Debug mode

```bash
npmrtdb --debug --db <url> install lodash
```

---

## ⚙️ Requirements

- Node.js ≥ 18.0.0
- npm (đi kèm Node.js)

---

## 🌐 Database URL

Có thể dùng:

- File local: `file:///path/to/db.json`
- HTTP/HTTPS: `https://example.com/db.json`

Set env:

```bash
export MHNPM_DB_URL="https://example.com/db.json"
```

Hoặc dùng flag:

```bash
npmrtdb --db https://example.com/db.json install lodash
```
