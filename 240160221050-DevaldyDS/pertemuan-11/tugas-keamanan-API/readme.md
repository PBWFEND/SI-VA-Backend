# Pertemuan 11 — Keamanan Backend dan REST API

Repository ini merupakan pengembangan dari proyek **REST API Manajemen Buku** pada Pertemuan 8, 9, dan 10 dalam mata kuliah Praktikum Pemrograman Berbasis Web Backend.

Pada Pertemuan 11, proyek dikembangkan dengan menambahkan beberapa lapisan keamanan untuk melindungi API dari input tidak valid, SQL Injection, akses lintas origin yang tidak diizinkan, serta permintaan berlebihan (Request Flooding).

## 1. Identitas Proyek

| Keterangan  | Detail                                     |
| ----------- | ------------------------------------------ |
| Nama Proyek | REST API Manajemen Buku                    |
| Pertemuan   | 11 — Keamanan Backend dan API              |
| Mata Kuliah | Praktikum Pemrograman Berbasis Web Backend |
| Nama        | Devaldy Dzikri Syach Mas'ud                |
| NIM         | 240160221050                               |
| Teknologi   | Node.js, Express.js, TypeScript            |
| Database    | SQLite                                     |
| ORM         | Prisma                                     |
| Autentikasi | JWT                                        |

## 2. Tujuan Pengembangan

Pengembangan pada Pertemuan 11 bertujuan untuk meningkatkan keamanan REST API yang telah dibuat pada pertemuan sebelumnya.

Adapun tujuan pengembangan meliputi:

1. Menerapkan validasi input pada request body dan parameter URL.
2. Mencegah SQL Injection dengan menggunakan Prisma ORM dan query terparameterisasi.
3. Mengamankan HTTP response menggunakan Helmet.
4. Mengatur akses Cross-Origin Resource Sharing (CORS) berdasarkan daftar origin yang diizinkan.
5. Menerapkan Rate Limiting untuk membatasi jumlah permintaan API.
6. Membatasi ukuran request body untuk mengurangi risiko penyalahgunaan sumber daya.
7. Mengamankan penanganan error agar tidak membocorkan informasi internal server.

## 3. Teknologi dan Dependensi

Teknologi dan library yang digunakan dalam pengembangan proyek ini:

| Teknologi / Library | Fungsi                            |
| ------------------- | --------------------------------- |
| Node.js             | Runtime JavaScript                |
| Express.js          | Framework backend                 |
| TypeScript          | Bahasa pemrograman                |
| Prisma ORM          | Pengelolaan database dan query    |
| SQLite              | Database                          |
| JWT                 | Autentikasi dan otorisasi         |
| bcryptjs            | Hashing password                  |
| Helmet              | Pengamanan HTTP security headers  |
| CORS                | Pengaturan akses lintas origin    |
| express-rate-limit  | Pembatasan jumlah request         |
| express-validator   | Validasi dan sanitasi input       |
| dotenv              | Pengelolaan environment variables |
| tsx                 | Menjalankan TypeScript            |

## 4. Fitur Keamanan yang Diimplementasikan

### 4.1 Input Validation

Validasi input diterapkan menggunakan `express-validator` pada endpoint pengelolaan buku.

Validasi meliputi:

- Judul buku harus berupa teks dengan panjang 3–150 karakter.
- Nama penulis harus berupa teks dengan panjang 3–100 karakter.
- Tahun terbit harus berupa bilangan bulat antara 1000–2100.
- Stok harus berupa bilangan bulat minimal 0.
- ID buku harus berupa bilangan bulat positif.
- Field yang tidak dikenal akan ditolak.
- Request update harus memiliki minimal satu field yang dikirim.

Jika input tidak sesuai ketentuan, API mengembalikan status HTTP `400 Bad Request`.

File implementasi:
`src/middleware/validation.middleware.ts`

### 4.2 Pencegahan SQL Injection

Pengelolaan data buku menggunakan Prisma ORM dengan operasi seperti:

- `findMany()`
- `findUnique()`
- `create()`
- `update()`
- `delete()`

Penggunaan Prisma ORM membantu mencegah SQL Injection karena nilai input diproses melalui query terparameterisasi, bukan dengan menggabungkan input pengguna langsung ke dalam perintah SQL.

File implementasi:
`src/service/buku.service.ts`

### 4.3 HTTP Security Headers dengan Helmet

Helmet digunakan untuk menambahkan HTTP security headers pada response API.

Implementasi:

```ts
app.use(helmet());
```

Beberapa header keamanan yang diterapkan antara lain:

- `X-Content-Type-Options`
- `X-Frame-Options`
- `Content-Security-Policy`
- `Strict-Transport-Security` pada kondisi yang sesuai.

File implementasi:
`app.ts`

### 4.4 Cross-Origin Resource Sharing (CORS)

CORS digunakan untuk mengatur origin yang diperbolehkan mengakses API melalui browser.

Daftar origin disimpan dalam environment variable `CORS_ORIGINS`.

Contoh konfigurasi:

```env
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

Request dari origin yang tidak terdaftar akan ditolak oleh konfigurasi CORS.

Request tanpa header Origin, seperti request dari Postman atau curl, tetap dapat diproses.

### 4.5 Rate Limiting

Rate Limiting diterapkan khusus pada endpoint penambahan buku.

Konfigurasi:

- Batas request: 3 kali.
- Periode waktu: 10 detik.
- Identifikasi pembatasan: alamat IP.
- Status ketika batas terlampaui: `429 Too Many Requests`.

Implementasi ini bertujuan mengurangi risiko penyalahgunaan endpoint akibat permintaan berlebihan.

File implementasi:
`src/middleware/rate-limit.middleware.ts`

### 4.6 Request Body Size Limit

Ukuran request JSON dibatasi maksimal 10 KB menggunakan konfigurasi:

```ts
app.use(express.json({ limit: "10kb" }));
```

Jika ukuran request melebihi batas tersebut, API mengembalikan status HTTP `413 Payload Too Large`.

### 4.7 Centralized Error Handling

Error handler digunakan untuk menangani kesalahan secara terpusat.

Beberapa penanganan yang diterapkan:

- JSON tidak valid menghasilkan status `400`.
- Request terlalu besar menghasilkan status `413`.
- Origin yang tidak diizinkan menghasilkan status `403`.
- Kesalahan internal menghasilkan status `500`.

Informasi detail kesalahan dicatat pada terminal server, sedangkan client hanya menerima pesan umum agar informasi internal tidak terekspos.

## 5. Struktur Folder

```text
tugas-keamanan-API/
│
├── prisma/
│   ├── migrations/
│   ├── dev.db
│   └── schema.prisma
│
├── src/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.routes.ts
│   │   └── auth.service.ts
│   │
│   ├── controller/
│   │   └── buku.controller.ts
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── validation.middleware.ts
│   │   └── rate-limit.middleware.ts
│   │
│   ├── routes/
│   │   └── buku.routes.ts
│   │
│   └── service/
│       └── buku.service.ts
│
├── .env
├── .gitignore
├── app.ts
├── client.ts
├── package.json
├── package-lock.json
├── prisma.config.ts
├── readme.md
├── server.ts
└── tsconfig.json
```

## 6. Instalasi dan Menjalankan Proyek

### 6.1 Clone Repository

```bash
git clone <URL_REPOSITORY>
```

Masuk ke folder proyek:

```bash
cd tugas-keamanan-API
```

### 6.2 Instalasi Dependensi

```bash
npm install
```

### 6.3 Konfigurasi Environment

Buat file `.env` pada folder utama proyek.

Contoh konfigurasi:

```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="ganti_dengan_secret_yang_kuat"
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

Sesuaikan `DATABASE_URL` dengan konfigurasi Prisma pada proyek.

Jangan mengunggah file `.env` ke repository GitHub karena berisi konfigurasi rahasia.

### 6.4 Generate Prisma Client

```bash
npx prisma generate
```

### 6.5 Migrasi Database

Jika database belum memiliki tabel:

```bash
npx prisma migrate dev
```

### 6.6 Menjalankan Server

```bash
npm run dev
```

Server berjalan pada:

```text
http://localhost:3008
```

Endpoint untuk memeriksa status API:

```text
GET http://localhost:3008/health
```

## 7. Pengujian Keamanan API

Pengujian dilakukan menggunakan terminal dengan `curl.exe` maupun Postman.

| No. | Pengujian                   | Hasil yang Diharapkan                       |
| --- | --------------------------- | ------------------------------------------- |
| 1   | Health Check                | HTTP 200 OK                                 |
| 2   | Validasi input tidak sesuai | HTTP 400 Bad Request                        |
| 3   | ID buku tidak valid         | HTTP 400 Bad Request                        |
| 4   | Origin CORS diizinkan       | Header Access-Control-Allow-Origin tersedia |
| 5   | Origin CORS tidak diizinkan | HTTP 403 Forbidden                          |
| 6   | Request body melebihi 10 KB | HTTP 413 Payload Too Large                  |
| 7   | Request POST melebihi batas | HTTP 429 Too Many Requests                  |
| 8   | Endpoint tidak ditemukan    | HTTP 404 Not Found                          |
| 9   | Kesalahan internal server   | HTTP 500 dengan pesan umum                  |

**Catatan:** Pengujian endpoint `/buku` memerlukan autentikasi JWT. Endpoint POST, PATCH, dan DELETE juga memerlukan role admin. Pengujian rate limiting dilakukan dengan mengirim lebih dari tiga request POST dalam periode 10 detik menggunakan akun admin yang valid.

## 8. Pengelolaan Keamanan Repository

File dan folder berikut tidak boleh diunggah ke repository:

- `.env`
- `node_modules/`
- `prisma/dev.db`
- File hasil generate Prisma yang tidak diperlukan.

File migration Prisma tetap disertakan dalam repository agar struktur database dapat direproduksi.

## 9. Kesimpulan

Pada Pertemuan 11, REST API Manajemen Buku dikembangkan dengan menambahkan beberapa mekanisme keamanan pada sisi backend. Implementasi meliputi validasi input, penggunaan Prisma ORM untuk query terparameterisasi, pengamanan HTTP headers menggunakan Helmet, pembatasan akses melalui CORS, Rate Limiting, pembatasan ukuran request body, serta centralized error handling.

Dengan penambahan fitur-fitur tersebut, API diharapkan menjadi lebih aman, terstruktur, dan mampu mengurangi risiko penyalahgunaan layanan.

---

**Pengembang:** Devaldy Dzikri Syach Mas'ud  
**NIM:** 240160221050  
**Program Studi:** Sistem Informasi  
\*\*Universitas Sebelas April Sumedang
