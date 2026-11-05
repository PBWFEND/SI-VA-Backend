# AKTIVITAS KELOMPOK — PERTEMUAN 11: KEAMANAN API
## STUDI KASUS: SISTEM INFORMASI ABSENSI MAHASISWA

---

### A. IDENTITAS KELOMPOK

**Kelompok:** Kelompok 1  
**Mata Kuliah:** Pemrograman Berorientasi Objek / Praktikum Backend  
**Program Studi:** Sistem Informasi (Kelas SI-VA)  
**Topik:** Pengamanan RESTful API (Security Hardening, Rate Limiting, Input Validation, CORS, Header Security, Anti-Spoofing & Anti-SQL Injection)  
**Studi Kasus:** Sistem Informasi Absensi Mahasiswa  

**Anggota Kelompok:**
1. Della Kartika
2. Nadya Zahra Aulia
3. Rico Muhammad F
4. Nabilla Natasya Putri

---

### B. LATAR BELAKANG & TUJUAN KEAMANAN

Dalam era layanan digital kampus, Sistem Informasi Absensi Mahasiswa memproses data pencatatan kehadiran yang sangat rentan terhadap manipulasi jika tidak diamankan dengan prinsip *defense in depth* (keamanan berlapis). Risiko keamanan yang nyata meliputi:
1. **Pencatatan Kehadiran Palsu (Identity Spoofing):** Mahasiswa nakal dapat merekayasa payload JSON dengan memasukkan NIM mahasiswa lain saat melakukan presensi (*titip absen digital*).
2. **Serangan Brute Force & Credential Stuffing:** Percobaan penebakan kata sandi berulang-ulang pada endpoint otentikasi `/api/auth/login`.
3. **Denial of Service (DoS):** Pengiriman payload JSON berukuran raksasa (*payload flooding*) yang menguras memori server Node.js.
4. **Cross-Origin Resource Sharing (CORS) Misconfiguration:** Akses sembarangan dari domain web berbahaya (`*`) yang dapat memicu eksfiltrasi data absensi via browser.
5. **SQL / ORM Injection:** Injeksi string manipulatif pada filter pencarian riwayat absensi (`?search=' OR '1'='1`).
6. **Information Disclosure:** Pembocoran stack trace error internal dan detail query database ketika terjadi exception yang memudahkan peretas melakukan reconnaissance.

Tujuan dari aktivitas kelompok ini adalah merancang, menerapkan, dan menguji standar pengamanan menyeluruh pada API Absensi Mahasiswa agar tangguh terhadap berbagai vektor serangan umum.

---

### C. CHECKLIST DAN STANDAR IMPLEMENTASI KEAMANAN API

Kelompok 1 merumuskan 9 (sembilan) lapisan perlindungan keamanan untuk Sistem Informasi Absensi Mahasiswa:

| No | Komponen Keamanan | Standar Implementasi | Tujuan & Mitigasi Risiko |
|:--:|:------------------|:---------------------|:-------------------------|
| 1 | **Security Headers (Helmet)** | `helmet()` middleware: `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Strict-Transport-Security`, `X-XSS-Protection: 0`. | Mencegah MIME-sniffing, clickjacking, dan serangan berbasis framing browser. |
| 2 | **CORS Origin Whitelist** | Whitelist ketat: `http://localhost:3000`, `http://localhost:5173`. Domain selain whitelist ditolak dengan error `403 Not allowed by CORS`. | Mencegah aplikasi web pihak ketiga yang tidak tepercaya membaca response data absensi. |
| 3 | **Payload Size Limitation** | `express.json({ limit: "10kb" })` | Mencegah DoS akibat request body JSON berukuran raksasa yang membebani event loop Node.js. |
| 4 | **Rate Limiting (Global & Auth)** | Global: 100 req / 15 menit.<br>Auth (`/api/auth/login`): 5 req / 15 menit. Response: `429 Too Many Requests`. | Mencegah brute force attack, credential stuffing, dan traffic flooding. |
| 5 | **Anti-Spoofing Identity Enforcement** | Saat peran `MAHASISWA` mencatat absensi (`POST /api/absensi`), backend **wajib mengabaikan `req.body.nim`** dan hanya menggunakan `req.user.nim` serta `req.user.nama` dari JWT terverifikasi. | Mencegah mahasiswa melakukan manipulasi kehadiran atau "titip absen" untuk NIM mahasiswa lain. |
| 6 | **Input Validation & Sanitization** | Validasi format NIM (hanya angka 8–15 karakter), mata kuliah wajib, status absensi (`HADIR`, `IZIN`, `SAKIT`, `ALPA`), dan panjang keterangan. | Mencegah input malformed, buffer overflow, dan data kotor masuk ke database. |
| 7 | **Parameterized Queries (Anti-SQLi)** | Menggunakan query builder Prisma dengan parameter binding untuk semua operasi filter dan search. | Menjamin karakter berbahaya seperti `' OR '1'='1` diperlakukan sebagai literal string, bukan instruksi SQL. |
| 8 | **Role-Based Authorization (RBAC)** | Endpoint sensitif (hapus absensi, ubah status absensi mahasiswa lain) dibatasi khusus untuk `ADMIN` atau `DOSEN`. | Mencegah eskalasi hak akses (*privilege escalation*) oleh akun mahasiswa biasa. |
| 9 | **Safe Error Handling & X-Request-Id** | Middleware audit `X-Request-Id` menggunakan UUID v4. Global error handler menelan stack trace dan mengembalikan response JSON seragam. | Memudahkan pelacakan request lintas log tanpa membocorkan rahasia internal (*information disclosure*). |

---

### D. ARSITEKTUR KEAMANAN ENDPOINT ABSENSI

Berikut adalah alur penyaringan request dari client hingga tersimpan aman di database:

```
[ Client Request ]
       │
       ▼
[ Layer 1: X-Request-Id ] ──► Inject UUID v4 ke Request & Response Header
       │
       ▼
[ Layer 2: Helmet Middleware ] ──► Inject Security Headers (nosniff, SAMEORIGIN, etc.)
       │
       ▼
[ Layer 3: CORS Whitelist ] ──► Periksa Origin (Tolak origin ilegal dengan 403)
       │
       ▼
[ Layer 4: Global Rate Limiter ] ──► Periksa batas frekuensi (100 req / 15 min)
       │
       ▼
[ Layer 5: Payload Limit (10KB) ] ──► Tolak body > 10KB dengan 413 Payload Too Large
       │
       ▼
[ Layer 6: Endpoint Router ]
       ├── /api/auth/login ──► [ Auth Rate Limiter (5 req / 15 min) ] ──► Auth Controller
       └── /api/absensi ──► [ JWT Authentication ] ──► [ Role Authorization ]
                                      │
                                      ▼
                        [ Input Validation Middleware ]
                                      │
                                      ▼
                  [ Anti-Spoofing: Identity Enforcement ]
                     (Paksa NIM & Nama dari JWT Payload)
                                      │
                                      ▼
                  [ Parameterized Query / Prisma ORM ]
                                      │
                                      ▼
                             [ SQLite Database ]
```

---

### E. SKENARIO PENGUJIAN KEAMANAN DENGAN CURL

Berikut adalah perintah cURL untuk memverifikasi fungsionalitas pengamanan API:

#### 1. Verifikasi Security Headers & X-Request-Id
```bash
curl -i http://localhost:3000/api/health
```
*Ekspektasi Response:*
Header mengandung:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `X-Request-Id: <uuid-v4>`

#### 2. Uji CORS Origin Whitelist (Ditolak)
```bash
curl -i -H "Origin: http://evil-hacker.com" http://localhost:3000/api/health
```
*Ekspektasi Response:* HTTP 403 Forbidden dengan pesan `Not allowed by CORS`.

#### 3. Uji Payload Size Limitation (>10KB)
```bash
curl -i -X POST http://localhost:3000/api/absensi \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"keterangan":"'$(head -c 12000 /dev/zero | tr '\0' 'A')'"}'
```
*Ekspektasi Response:* HTTP 413 Payload Too Large.

#### 4. Uji Auth Rate Limiting (Brute Force Protection)
Kirimkan 6 kali percobaan login berturut-turut:
```bash
for i in {1..6}; do
  curl -i -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"della","password":"wrongpassword"}'
done
```
*Ekspektasi Response:* Percobaan ke-6 menghasilkan HTTP 429 Too Many Requests.

#### 5. Uji Anti-Spoofing (Percobaan Manipulasi NIM oleh Mahasiswa)
Mahasiswa dengan NIM `240160221008` login, lalu mencoba mengirimkan payload dengan `nim: "240160221999"`:
```bash
curl -i -X POST http://localhost:3000/api/absensi \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN_MAHASISWA>" \
  -d '{
    "nim": "240160221999",
    "mataKuliah": "Pemrograman Backend",
    "status": "HADIR",
    "keterangan": "Hadir tepat waktu"
  }'
```
*Ekspektasi Keamanan:* Sistem secara otomatis mengesampingkan NIM `240160221999` dan mencatat kehadiran atas nama pemilik token yang sah (`240160221008 - Della Kartika`).

#### 6. Uji Parameterized Query (Anti-SQL Injection pada Pencarian)
```bash
curl -i -G "http://localhost:3000/api/absensi" \
  -H "Authorization: Bearer <TOKEN>" \
  --data-urlencode "search=' OR '1'='1"
```
*Ekspektasi Keamanan:* Server memperlakukan string input secara literal dan tidak membocorkan seluruh isi tabel database, mengembalikan HTTP 200 dengan hasil filter yang aman.

---

### F. KESIMPULAN

Melalui implementasi sembilan pilar keamanan ini, Sistem Informasi Absensi Mahasiswa terlindungi dari serangan eksploitasi data kehadiran, ancaman *denial of service*, serta serangan otentikasi. Pendekatan berlapis (*defense-in-depth*) memastikan bahwa integritas data presensi mahasiswa tetap terjamin, valid, dan dapat dipertanggungjawabkan secara akademik.

