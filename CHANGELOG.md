# 🔄 CHANGES - npmrtdb v0.2.0

## ✨ Thay đổi chính

### 1️⃣ Database Schema Mới

**Cũ** (v0.1.0):

```json
{
  "hosts": [
    { "name": "npmjs", "registry": "...", ... },
    { "name": "github", "registry": "...", ... }
  ]
}
```

**Mới** (v0.2.0):

```json
{
  "hosts": {
    "npmjs": { "registry": "...", ... },
    "github": { "registry": "...", ... }
  }
}
```

**Lý do**: Dễ cập nhật hosts theo key cố định (không bị thay đổi thứ tự trong mảng).

---

### 2️⃣ Không còn fetch packument bằng JavaScript

**Cũ**: Wrapper tự fetch packument từ registry bằng `fetch()`.

**Mới**: Ủy quyền toàn bộ cho npm CLI:

- `npm view <package> versions --json` - lấy danh sách versions
- `npm install` - cài đặt package
- `npx` - execute package

**Lợi ích**:

- Đơn giản hóa code
- Tin tưởng vào npm CLI (đã được test kỹ)
- Cross-platform tốt hơn (npm CLI xử lý auth/network)

---

### 3️⃣ Files đã xóa

❌ **src/metadata.js** - Không còn cần vì không tự fetch  
❌ **ARCHITECTURE.md** - Mô tả cũ không còn đúng  
❌ **Requirements.md** - Đã thay bằng version mới

---

### 4️⃣ Code changes

**src/db.js**:

- Đổi từ validate array → validate object
- Parse object thành array với `name` từ key

**src/core.js**:

- Thay `fetchAllMetadata()` bằng `collectVersionsViaNpmView()`
- Dùng `npm view` thay vì HTTP fetch

**Các file khác**: Giữ nguyên logic.

---

## 📦 Cấu trúc mới

```
npmrtdb/
├── bin/
│   ├── npmrtdb.js         # npm wrapper
│   └── npmxrtdb.js        # npx wrapper
├── src/
│   ├── args-parser.js     # Parse arguments
│   ├── core.js            # Orchestrator (dùng npm view)
│   ├── db.js              # Load DB (object schema)
│   ├── executor.js        # Run concurrent attempts
│   ├── help.js            # Help text
│   ├── logger.js          # Debug logging
│   ├── npmrc.js           # Generate temp .npmrc
│   ├── platform.js        # Platform detection
│   └── version.js         # Digit comparison
├── example-db.json        # Sample DB (object schema)
├── package.json
├── README.md
├── LICENSE
└── test.js
```

---

## 🚀 Migration Guide

### Nếu anh đang dùng v0.1.0:

1. **Cập nhật DB JSON**:
   - Đổi từ `hosts: [...]` sang `hosts: {...}`
   - Dùng host name làm key

2. **Cài lại package**:

   ```bash
   npm uninstall -g npmrtdb
   npm install -g npmrtdb@0.2.0
   ```

3. **Không cần thay đổi CLI usage** - Commands giống như cũ!

---

## ✅ Testing

```bash
# Test help
npmrtdb --help
npmxrtdb --help

# Test với DB mới
npmrtdb --db <url> install lodash
```

---

## 📝 Notes

- Version bump: 0.1.0 → **0.2.0**
- Breaking change: Database schema
- Backward incompatible: Phải update DB JSON
