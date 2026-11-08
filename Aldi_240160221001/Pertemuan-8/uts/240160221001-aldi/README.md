# UTS Mini Project Backend: REST API Manajemen Data Mahasiswa

Repositori ini berisi implementasi resmi **UTS Mini Project Backend** berupa layanan RESTful API untuk manajemen data mahasiswa. Proyek ini dibangun dengan pemisahan arsitektur berlapis (*layered architecture*: Route, Controller, dan Service), menggunakan Express.js, TypeScript, dan Prisma ORM dengan basis data SQLite.

---

## Identitas Mahasiswa

- **Nama**: Aldi Restu Fauzi
- **NIM**: 240160221001
- **Project**: REST API Manajemen Data Mahasiswa
- **Mata Kuliah**: Praktikum Backend Web Development

---

## Fitur Utama

1. **Operasi CRUD Lengkap**:
   - `POST /mahasiswa`: Menambahkan data mahasiswa baru dengan validasi data ketat.
   - `GET /mahasiswa`: Mengambil seluruh daftar mahasiswa dengan dukungan filter query parameter (`prodi`, `angkatan`).
   - `GET /mahasiswa/:nim`: Mengambil detail data mahasiswa berdasarkan Nomor Induk Mahasiswa (NIM).
   - `PATCH /mahasiswa/:nim`: Memperbarui sebagian atribut data mahasiswa (nama, prodi, angkatan) dengan proteksi imutabilitas NIM.
   - `DELETE /mahasiswa/:nim`: Menghapus data mahasiswa dari basis data (HTTP 204 No Content).
2. **Endpoint Pendukung**:
   - `GET /`: Status ringkasan layanan API.
   - `GET /api/health`: Pemeriksaan kesehatan konektivitas basis data dan integritas server.
3. **Pola Singleton Prisma Client**:
   - Mencegah inisialisasi koneksi ganda (*multiple instances*) saat pengembangan.
   - Menyediakan facade root `client.ts` yang selaras dengan panduan struktur §5.1 dan §5.3.
4. **Graceful Shutdown**:
   - Menangani sinyal sistem operasi `SIGINT` (Ctrl+C) dan `SIGTERM` secara aman.
   - Menolak koneksi/request baru dan menunggu koneksi aktif selesai (*drain connections*).
   - Memutus koneksi Prisma Client (`await prisma.$disconnect()`) secara bersih sebelum proses dihentikan.
   - Dilengkapi proteksi terhadap pemicuan shutdown ganda.
5. **Validasi Input Ketat**:
   - Penolakan tipe data salah (misalnya `angkatan` berupa string atau bilangan desimal).
   - Penolakan rentang tahun di luar batas yang ditentukan (`2000` s.d. tahun berjalan).
   - Penanganan duplikasi NIM dengan status HTTP `409 Conflict`.
   - Penanganan malformed JSON dengan status HTTP `400 Bad Request`.
6. **Eksekusi Native TypeScript**:
   - Menggunakan fitur `--experimental-strip-types` pada Node.js 22.6+ sehingga dapat dijalankan langsung tanpa langkah kompilasi manual.

---

## Struktur Direktori Proyek

Struktur proyek disusun mengikuti ketentuan resmi §5.1:

```text
uts/240160221001-aldi/
├── app.ts                  # Konfigurasi middleware Express, routing, 404, dan central error handler
├── server.ts               # Inisialisasi HTTP server, startup banner, dan graceful shutdown
├── client.ts               # Facade Prisma Client singleton di root (§5.1 & §5.3)
├── prisma.config.ts        # Konfigurasi Prisma 7 (schema path, migrations, datasource URL)
├── package.json            # Definisi dependencies, devDependencies, dan executable scripts
├── package-lock.json       # Kunci dependensi dan versi paket
├── tsconfig.json           # Konfigurasi compiler TypeScript (Node16 module resolution)
├── .env.example            # Template variabel lingkungan (PORT dan DATABASE_URL)
├── .gitignore              # Proteksi node_modules, .env, dan file database lokal
├── README.md               # Dokumentasi resmi proyek
├── prisma/
│   ├── schema.prisma       # Definisi model data Mahasiswa dan konfigurasi datasource SQLite
│   └── migrations/         # Berkas riwayat migrasi database
│       ├── migration_lock.toml
│       └── 20261031090506_init_mahasiswa/
│           └── migration.sql # Berkas DDL SQL pembuatan tabel mahasiswa dan indeks unik
└── src/
    ├── config/
    │   └── client.ts       # Implementasi dasar Prisma Client singleton via globalThis
    ├── controller/
    │   └── mahasiswa.controller.ts # Validasi HTTP request, parsing payload, dan HTTP response
    ├── routes/
    │   └── mahasiswa.routes.ts     # Pendaftaran rute HTTP endpoint mahasiswa
    └── service/
        └── mahasiswa.service.ts    # Logika bisnis, query Prisma ORM, dan custom error
```

---

## Kebutuhan Sistem

- **Node.js**: Versi `22.6.0` atau yang lebih baru (disarankan Node.js LTS terbaru).
- **npm**: Versi `10.0.0` atau yang lebih baru.

---

## Panduan Instalasi dan Menjalankan Proyek

Ikuti urutan langkah resmi (§5.2) berikut untuk menyiapkan dan menjalankan server:

### 1. Pasang Dependensi
Buka terminal dan navigasikan ke direktori proyek ini:
```bash
npm install
```

### 2. Siapkan File Environment
Salin file `.env.example` menjadi `.env`:
- **Linux/macOS (Bash):**
  ```bash
  cp .env.example .env
  ```
- **Windows (PowerShell):**
  ```powershell
  Copy-Item .env.example .env
  ```

Konfigurasi default pada `.env`:
```env
DATABASE_URL="file:./prisma/dev.db"
PORT=3008
```

### 3. Jalankan Migrasi Database
Terapkan skema migrasi untuk membuat file basis data SQLite lokal:
```bash
npx prisma migrate dev --name init
```
*Atau gunakan script npm:*
```bash
npm run prisma:migrate
```

### 4. Generate Prisma Client
Bangun client ORM berdasarkan skema model terbaru:
```bash
npx prisma generate
```
*Atau gunakan script npm:*
```bash
npm run prisma:generate
```

### 5. Jalankan Server
Jalankan server aplikasi:
```bash
npm start
```
Saat server berhasil berjalan, konsol akan menampilkan pesan:
```text
API berjalan di http://localhost:3008
```

Untuk mode pengembangan dengan pemantauan perubahan berkas otomatis (*watch mode*):
```bash
npm run dev
```

### 6. Menghentikan Server (*Graceful Shutdown*)
Tekan kombinasi tombol `Ctrl + C` pada terminal tempat server berjalan. Server akan menangani sinyal `SIGINT`/`SIGTERM`, menghentikan penerimaan request baru, menutup koneksi database Prisma secara bersih, dan menampilkan log:
```text
Menerima sinyal SIGINT. Menutup server dan koneksi database...
Koneksi Prisma berhasil diputus. Server berhenti dengan bersih.
```

---

## Spesifikasi Model Data

Model data didefinisikan pada `prisma/schema.prisma`:

| Field | Tipe Data | Atribut | Keterangan |
|:---|:---|:---|:---|
| `id` | `Int` | `@id @default(autoincrement())` | Primary key internal database. |
| `nim` | `String` | `@unique` | Nomor Induk Mahasiswa, unik, tidak boleh duplikat. |
| `nama` | `String` | - | Nama lengkap mahasiswa. |
| `prodi` | `String` | - | Program studi mahasiswa. |
| `angkatan` | `Int` | - | Tahun angkatan masuk mahasiswa. |

Nama tabel fisik pada SQLite dipetakan menjadi `"mahasiswa"`.

---

## Aturan Validasi Input

### 1. Validasi Pembuatan Data (`POST /mahasiswa`)
- Request body harus berupa objek JSON yang valid.
- `nim`: Wajib diisi, tipe data `string`, tidak boleh string kosong atau hanya spasi.
- `nama`: Wajib diisi, tipe data `string`, tidak boleh string kosong atau hanya spasi.
- `prodi`: Wajib diisi, tipe data `string`, tidak boleh string kosong atau hanya spasi.
- `angkatan`: Wajib diisi, tipe data `number` murni (bukan string numerik), harus berupa bilangan bulat (*integer*), berada dalam rentang `2000` sampai tahun saat ini (misal `2026`).

### 2. Validasi Pembaruan Data (`PATCH /mahasiswa/:nim`)
- Parameter `:nim` pada URL harus valid dan tidak boleh kosong.
- Request body harus berupa objek JSON dan memuat minimal satu field yang ingin diperbarui (`nama`, `prodi`, atau `angkatan`).
- Field `nim` **tidak boleh diubah**. Mengirimkan field `nim` di dalam body request akan menghasilkan penolakan status `400 Bad Request`.
- Setiap field yang dikirimkan wajib memenuhi aturan tipe data yang sama dengan pembuatan data.

### 3. Validasi Filter Query (`GET /mahasiswa`)
- `prodi`: Opsional. Jika disertakan, harus berupa teks tidak kosong.
- `angkatan`: Opsional. Jika disertakan, harus berupa 4 digit angka yang bernilai antara `2000` sampai tahun saat ini.

---

## Standar Kode Status HTTP

Layanan API menggunakan standar kode status HTTP berikut:

| Kode Status | Kategori | Keterangan Penggunaan |
|:---:|:---|:---|
| **200 OK** | Sukses | Request GET atau PATCH berhasil dieksekusi dan mengembalikan data. |
| **201 Created** | Sukses | Request POST berhasil membuat data mahasiswa baru. |
| **204 No Content** | Sukses | Request DELETE berhasil menghapus data tanpa body balasan. |
| **400 Bad Request** | Kesalahan Klien | Format JSON tidak valid, field wajib tidak diisi, tipe data salah, atau nilai di luar batas validasi. |
| **404 Not Found** | Kesalahan Klien | NIM yang diminta tidak ditemukan di database, atau URL endpoint tidak terdaftar. |
| **409 Conflict** | Kesalahan Klien | NIM yang hendak ditambahkan sudah digunakan oleh data lain di database. |
| **500 Internal Server Error** | Kesalahan Server | Terjadi kendala internal server atau kegagalan koneksi ke basis data. |

---

## Dokumentasi Endpoint & Contoh `curl`

Berikut adalah daftar lengkap endpoint beserta contoh pengujian menggunakan `curl`:

### 1. Root Service Information
- **Metode**: `GET`
- **URL**: `/`
- **Deskripsi**: Menampilkan informasi status API.
- **Contoh curl**:
  ```bash
  curl -i -X GET http://localhost:3008/
  ```
- **Contoh Respons (200 OK)**:
  ```json
  {
    "success": true,
    "message": "REST API Mahasiswa dengan Pola Service/Controller berjalan"
  }
  ```

---

### 2. Pemeriksaan Kesehatan Basis Data (Health Check)
- **Metode**: `GET`
- **URL**: `/api/health`
- **Deskripsi**: Memeriksa konektivitas antara Express server dan SQLite melalui query Prisma `SELECT 1`.
- **Contoh curl**:
  ```bash
  curl -i -X GET http://localhost:3008/api/health
  ```
- **Contoh Respons (200 OK)**:
  ```json
  {
    "success": true,
    "message": "API dan database terhubung"
  }
  ```

---

### 3. Mengambil Semua Mahasiswa (Daftar & Filter)
- **Metode**: `GET`
- **URL**: `/mahasiswa`
- **Parameter Query (Opsional)**:
  - `prodi`: Menyaring berdasarkan nama program studi (pencarian persis).
  - `angkatan`: Menyaring berdasarkan tahun angkatan (4 digit).
- **Contoh curl (Semua Data)**:
  ```bash
  curl -i -X GET http://localhost:3008/mahasiswa
  ```
- **Contoh curl (Dengan Filter Prodi)**:
  ```bash
  curl -i -X GET "http://localhost:3008/mahasiswa?prodi=Sistem%20Informasi"
  ```
- **Contoh curl (Dengan Filter Gabungan)**:
  ```bash
  curl -i -X GET "http://localhost:3008/mahasiswa?prodi=Sistem%20Informasi&angkatan=2024"
  ```
- **Contoh Respons (200 OK)**:
  ```json
  {
    "success": true,
    "total": 1,
    "data": [
      {
        "id": 1,
        "nim": "240160221001",
        "nama": "Aldi Restu Fauzi",
        "prodi": "Sistem Informasi",
        "angkatan": 2024
      }
    ]
  }
  ```

---

### 4. Mengambil Detail Mahasiswa Berdasarkan NIM
- **Metode**: `GET`
- **URL**: `/mahasiswa/:nim`
- **Contoh curl (Data Ditemukan)**:
  ```bash
  curl -i -X GET http://localhost:3008/mahasiswa/240160221001
  ```
- **Contoh Respons (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "nim": "240160221001",
      "nama": "Aldi Restu Fauzi",
      "prodi": "Sistem Informasi",
      "angkatan": 2024
    }
  }
  ```
- **Contoh curl (Data Tidak Ditemukan)**:
  ```bash
  curl -i -X GET http://localhost:3008/mahasiswa/999999999999
  ```
- **Contoh Respons (404 Not Found)**:
  ```json
  {
    "success": false,
    "message": "Mahasiswa dengan NIM '999999999999' tidak ditemukan"
  }
  ```

---

### 5. Menambahkan Mahasiswa Baru
- **Metode**: `POST`
- **URL**: `/mahasiswa`
- **Header**: `Content-Type: application/json`
- **Contoh curl (Data Valid)**:
  ```bash
  curl -i -X POST http://localhost:3008/mahasiswa \
    -H "Content-Type: application/json" \
    -d '{
      "nim": "240160221001",
      "nama": "Aldi Restu Fauzi",
      "prodi": "Sistem Informasi",
      "angkatan": 2024
    }'
  ```
- **Contoh Respons (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Mahasiswa berhasil ditambahkan",
    "data": {
      "id": 1,
      "nim": "240160221001",
      "nama": "Aldi Restu Fauzi",
      "prodi": "Sistem Informasi",
      "angkatan": 2024
    }
  }
  ```
- **Contoh curl (NIM Duplikat / Konflik)**:
  ```bash
  curl -i -X POST http://localhost:3008/mahasiswa \
    -H "Content-Type: application/json" \
    -d '{
      "nim": "240160221001",
      "nama": "Aldi Duplicate",
      "prodi": "Informatika",
      "angkatan": 2024
    }'
  ```
- **Contoh Respons (409 Conflict)**:
  ```json
  {
    "success": false,
    "message": "Mahasiswa dengan NIM '240160221001' sudah terdaftar"
  }
  ```

---

### 6. Memperbarui Data Mahasiswa (Partial Update)
- **Metode**: `PATCH`
- **URL**: `/mahasiswa/:nim`
- **Header**: `Content-Type: application/json`
- **Contoh curl (Memperbarui Nama & Prodi)**:
  ```bash
  curl -i -X PATCH http://localhost:3008/mahasiswa/240160221001 \
    -H "Content-Type: application/json" \
    -d '{
      "nama": "Aldi Restu Fauzi, S.Kom.",
      "prodi": "Teknologi Informasi"
    }'
  ```
- **Contoh Respons (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Data mahasiswa berhasil diperbarui",
    "data": {
      "id": 1,
      "nim": "240160221001",
      "nama": "Aldi Restu Fauzi, S.Kom.",
      "prodi": "Teknologi Informasi",
      "angkatan": 2024
    }
  }
  ```
- **Contoh curl (Mencoba Mengubah NIM - Ditolak)**:
  ```bash
  curl -i -X PATCH http://localhost:3008/mahasiswa/240160221001 \
    -H "Content-Type: application/json" \
    -d '{
      "nim": "240160229999"
    }'
  ```
- **Contoh Respons (400 Bad Request)**:
  ```json
  {
    "success": false,
    "message": "Field 'nim' tidak dapat diubah melalui endpoint PATCH"
  }
  ```

---

### 7. Menghapus Mahasiswa
- **Metode**: `DELETE`
- **URL**: `/mahasiswa/:nim`
- **Contoh curl (Data Berhasil Dihapus)**:
  ```bash
  curl -i -X DELETE http://localhost:3008/mahasiswa/240160221001
  ```
- **Respons (204 No Content)**:
  *(Tidak ada body respons - Header HTTP Status 204 No Content)*

- **Contoh curl (Menghapus Data yang Tidak Ada)**:
  ```bash
  curl -i -X DELETE http://localhost:3008/mahasiswa/999999999999
  ```
- **Contoh Respons (404 Not Found)**:
  ```json
  {
    "success": false,
    "message": "Mahasiswa dengan NIM '999999999999' tidak ditemukan"
  }
  ```

---

### 8. Contoh Kasus Pengujian Validasi Negatif (Error Handling)

Berikut adalah beberapa contoh pengujian negatif yang menghasilkan respon `400 Bad Request`:

1. **Payload Kosong pada POST**:
   ```bash
   curl -i -X POST http://localhost:3008/mahasiswa \
     -H "Content-Type: application/json" \
     -d '{}'
   ```
   *Respon 400 Bad Request:*
   ```json
   {
     "success": false,
     "message": "Field 'nim' wajib diisi berupa teks dan tidak boleh kosong"
   }
   ```

2. **Tipe Data Angkatan Salah (String):**
   ```bash
   curl -i -X POST http://localhost:3008/mahasiswa \
     -H "Content-Type: application/json" \
     -d '{
       "nim": "240160221099",
       "nama": "Test User",
       "prodi": "Sistem Informasi",
       "angkatan": "2024"
     }'
   ```
   *Respon 400 Bad Request:*
   ```json
   {
     "success": false,
     "message": "Field 'angkatan' wajib berupa angka bilangan bulat antara 2000 dan 2026"
   }
   ```

3. **Angkatan di Luar Batas Tahun:**
   ```bash
   curl -i -X POST http://localhost:3008/mahasiswa \
     -H "Content-Type: application/json" \
     -d '{
       "nim": "240160221099",
       "nama": "Test User",
       "prodi": "Sistem Informasi",
       "angkatan": 1999
     }'
   ```
   *Respon 400 Bad Request:*
   ```json
   {
     "success": false,
     "message": "Field 'angkatan' wajib berupa angka bilangan bulat antara 2000 dan 2026"
   }
   ```

4. **Payload PATCH Kosong:**
   ```bash
   curl -i -X PATCH http://localhost:3008/mahasiswa/240160221001 \
     -H "Content-Type: application/json" \
     -d '{}'
   ```
   *Respon 400 Bad Request:*
   ```json
   {
     "success": false,
     "message": "Isi minimal satu field yang ingin diperbarui (nama, prodi, atau angkatan)"
   }
   ```

5. **Endpoint Tidak Terdaftar (404 Not Found):**
   ```bash
   curl -i -X GET http://localhost:3008/api/endpoint-tidak-ada
   ```
   *Respon 404 Not Found:*
   ```json
   {
     "success": false,
     "message": "Endpoint tidak ditemukan"
   }
   ```

---

## Lisensi

Proyek ini dibuat untuk keperluan akademik Evaluasi Tengah Semester (UTS) Praktikum Backend Web Development 2026. Hak cipta dilindungi oleh lisensi ISC.

