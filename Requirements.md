# Requirements.md — npmrtdb / npmxrtdb (Multi-Host NPM/Npx Wrapper, JS)

## 🎯 Mục tiêu
🌿 Xây dựng dự án npm **npmrtdb** cung cấp 2 CLI wrapper:
- ⚙️ **`npmrtdb`** → wrapper cho `npm` (ưu tiên use-case `npm install`)
- 🚀 **`npmxrtdb`** → wrapper cho `npx` (exec package/command)

Mục đích: **cài đặt hoặc thực thi package từ nhiều registry/host** (npmjs, GitHub Packages, Gitea, Codeberg…) dựa trên danh sách host đọc từ **Realtime DB URL**.

✨ Wrapper phải **chạy song song (concurrent)** trên các host; **host nào thành công trước thì chốt host đó** (dừng/cancel các host còn lại) để tối ưu tốc độ.

---

## ✅ Phạm vi & Ràng buộc công nghệ
🟩 Viết bằng **JavaScript thuần** (KHÔNG TypeScript)  
🟩 Tương thích **Windows + Linux** (cross-platform)  
🟩 **Không phụ thuộc OS** (không dùng bash-only, không yêu cầu tiện ích hệ thống riêng)  
🟩 Ưu tiên Node.js **18+** (khuyến nghị), hoặc ghi rõ minimum version nếu khác  
🟩 Không ghi đè cấu hình npm toàn cục của máy người dùng  

---

## 🧩 Sản phẩm đầu ra (Deliverables)
📦 Dự án npm hoàn chỉnh, publish được với tên **`npmrtdb`** (package name dự kiến; có thể đổi nếu trùng trên registry).  
🧱 Có 2 CLI entrypoint:
- ⚙️ `npmrtdb` → wrapper cho `npm` (đặc biệt `install`, nhưng phải hỗ trợ pass-through mọi lệnh/flags của npm)
- 🚀 `npmxrtdb` → wrapper cho `npx`

📁 Cấu trúc thư mục khuyến nghị:
- 🌿 `package.json` (khai báo `bin` cho `npmrtdb`, `npmxrtdb`)
- 🌿 `bin/npmrtdb.js`
- 🌿 `bin/npmxrtdb.js`
- 🌿 `src/core.js` (logic chung: load DB, build attempts, stages, cancellation)
- 🌿 `src/version.js` (parse digits & compare)
- 🌿 `src/npmrc.js` (generate `.npmrc` tạm)
- 🌿 `README.md` (hướng dẫn dùng, env vars, ví dụ)

---

## 🌐 Realtime DB URL & JSON schema tối thiểu
🔗 CLI nhận DB URL bằng:
- 🧷 `--db <url>`
- 🧷 hoặc env `MHNPM_DB_URL` (giữ nguyên tên env này để tương thích nếu cần)

📦 JSON từ URL phải hỗ trợ tối thiểu:
- 🧩 `hosts`: mảng host theo thứ tự ưu tiên (dù chạy song song)
  - 🏷️ `name`: string (npmjs/github/gitea/codeberg…)
  - 🌐 `registry`: URL registry (vd `https://registry.npmjs.org/`, `https://npm.pkg.github.com/`, `https://<gitea>/api/packages/<owner>/npm/`)
  - 🧷 `scope`: optional (vd `@myorg`) để set registry theo scope
  - 🔐 `auth`: optional
    - 🧩 `tokenEnv`: tên biến môi trường chứa token (vd `GITHUB_TOKEN`, `GITEA_TOKEN`)
    - 🧩 `alwaysAuth`: boolean (host luôn cần auth)
  - 🧾 `npmrcExtras`: optional array (các dòng `.npmrc` bổ sung)
  - ✅ `enabled`: boolean

📌 Nếu JSON không có `packageName` thì CLI lấy `packageName` từ args giống `npm`/`npx` gốc.

---

## ⚡ Cơ chế chạy đa host (Concurrent, không tuần tự)
🚀 Bắt buộc chạy song song để đạt tốc độ cao:
- ⚡ Tạo attempts cho tất cả host và chạy đồng thời (Promise.any / Promise.race theo thiết kế)
- 🏁 Host nào thành công trước → chốt host đó để dùng
- 🛑 Dừng/cancel các host còn lại (kill child process + cleanup)
- 🧹 Không để orphan process

🧠 Gợi ý kỹ thuật:
- 🧰 Spawn `npm`/`npx` bằng `execa` hoặc `child_process.spawn`
- 🧨 Dùng `AbortController` + signal để cancel (cross-platform)
- 🧷 Nếu cancel không hoàn hảo: tối thiểu phải kill process và bỏ qua output

---

## 🔐 Chiến lược Public-first rồi mới Token (Private fallback)
🌱 Stage 1 — Public-first (Concurrent):
- ✅ Với mỗi host: thử chạy “không auth” trước (trừ khi `alwaysAuth=true`)
- ⚡ Tất cả chạy song song
- 🏁 Nếu 1 host thành công → dừng toàn bộ host còn lại

🔑 Stage 2 — Token fallback (Concurrent):
- 🧩 Chỉ chạy nếu Stage 1 fail toàn bộ
- 🔐 Chỉ thử host nào có `tokenEnv` và env token đang tồn tại
- ⚡ Chạy song song
- 🏁 Host nào thành công → chốt, dừng các host còn lại

🧭 Nhận diện lỗi auth để quyết định fallback:
- 🧨 HTTP 401/403 khi fetch metadata
- 🧨 stderr có `E401`, `ENEEDAUTH`, `403 Forbidden`, hoặc thông điệp tương đương

---

## 🧪 Chế độ chọn phiên bản (any / latest)
🎛️ Options bắt buộc:
- 🧩 `--mode=any` (mặc định): miễn host nào có package và chạy/cài được thì dùng
- 🧩 `--mode=latest`: chọn phiên bản “lớn nhất” theo rule digits rồi pin version để chạy/cài

### 🔢 Rule “latest” theo digits (không semver chuẩn)
🧠 Version format ví dụ: `1.yymmdd.1hhmm` (vd `1.260131.11534`)  
🔢 So sánh bằng cách:
- 🧩 Lấy **tất cả chữ số** trong version
- 🧩 Nối lại thành một số nguyên
- 🧩 Số nào lớn hơn → version mới hơn

📌 Ví dụ:
- `1.260131.11534` → digits `126013111534`
- `11.0.15` → digits `11015`

✅ Khi `--mode=latest`:
- ⚡ Fetch metadata/packument từ **tất cả hosts song song**
- 🧮 Gom all versions, tính version max theo digits
- 📌 Pin đúng version đó khi chạy/cài
- ❌ Host nào không có version pin → coi như fail trong vòng attempts

---

## 🧷 Pass-through args giống npm/npx gốc (bắt buộc)
🧠 Wrapper chỉ “chọn registry/host”, còn lại args phải giữ nguyên:
- ✅ Không giới hạn args của npm/npx
- ✅ Hỗ trợ tách wrapper flags và args pass-through bằng `--`
- ✅ Đồng thời hỗ trợ kiểu “thân thiện” nếu user không dùng `--` (wrapper tự parse và loại wrapper flags ở mọi vị trí)

🧪 Ví dụ mong muốn:
- 🧰 `npmrtdb install lodash -D` → chạy `npm install lodash -D` với registry host thắng
- 🚀 `npmxrtdb eslint . --fix` → chạy `npx eslint . --fix` với registry host thắng
- 🧩 `npmxrtdb --db <url> --mode=latest -- @scope/pkg --help` → pass-through `--help`

---

## 🧾 Options & Help bắt buộc
📌 CLI options tối thiểu (áp dụng cho cả `npmrtdb` và `npmxrtdb`):
- 🆘 `--help`, `-h`
- 🔗 `--db <url>` (hoặc env `MHNPM_DB_URL`)
- 🎛️ `--mode <any|latest>` (default `any`)
- ⏱️ `--timeout <ms>` (default hợp lý, vd `60000`)
- 🐞 `--debug` (log host thắng/thua, lý do fail)
- 🌱 `--prefer-public` (default true)
- 🧾 `--json` (output machine-readable: host thắng, registry, version chọn, elapsed)

📚 Help phải có ví dụ usage rõ ràng cho cả 2 lệnh.

---

## 🧱 Cấu hình registry an toàn (không phá config global)
🧩 Mỗi attempt phải tự tạo `.npmrc` tạm:
- 🧷 Tạo temp dir (cross-platform, dùng `os.tmpdir()`)
- 🧾 Tạo file `.npmrc` theo host:
  - `registry=<host.registry>`
  - nếu có `scope`: `@scope:registry=<host.registry>`
  - nếu có token: thêm `_authToken`
  - nếu cần: `always-auth=true`
  - append `npmrcExtras` nếu có

🚀 Khi spawn npm/npx:
- 🧷 Set env `NPM_CONFIG_USERCONFIG` trỏ tới `.npmrc` tạm
- 🧹 Cleanup temp sau khi xong (kể cả fail)

---

## ✅ Tiêu chí “thành công”
🟩 `npmrtdb`: child process exit code = 0  
🟩 `npmxrtdb`: child process exit code = 0  
🧾 Pass-through stdout/stderr giống công cụ gốc  
🛑 Fail nếu non-zero exit code, lỗi network, hoặc lỗi auth (để trigger Stage 2)

---

## 🧪 Test & Kiểm chứng (khuyến nghị)
🧪 Có thể thêm test script đơn giản:
- ✅ Mock DB JSON trả về nhiều host
- ✅ 1 host fail, 1 host success (đảm bảo cancel hoạt động)
- ✅ Mode latest chọn đúng version theo digits
- ✅ Chạy được trên Windows + Linux (CI matrix nếu có)

---

## 🧾 Ví dụ JSON DB mẫu (tham khảo)
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
      "auth": { "tokenEnv": "GITHUB_TOKEN", "alwaysAuth": false },
      "enabled": true
    },
    {
      "name": "gitea",
      "registry": "https://i.example.com/api/packages/myorg/npm/",
      "auth": { "tokenEnv": "GITEA_TOKEN", "alwaysAuth": false },
      "enabled": true
    }
  ]
}
```
