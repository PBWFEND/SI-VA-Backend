# LATIHAN INDIVIDU — PERTEMUAN 11
## KEAMANAN BACKEND DAN API

---

### IDENTITAS MAHASISWA
- **Nama:** Sandika Yusuf Permana
- **NIM:** 240160221044
- **Kelas:** SI-VA
- **Mata Kuliah:** Pemrograman Backend Web Framework
- **Studi Kasus:** Sistem Informasi Akademik / Manajemen Data Mahasiswa
- **Lokasi Direktori:** `SandikaYusuf-240160221044/Pertemuan-11/Latihan-Individu/`

---

## JAWABAN PERTANYAAN EVALUASI & TUGAS PRAKTIKUM

### 1. Penerapan Batas Laju (*Rate Limiting*) yang Lebih Ketat pada `POST /api/mahasiswa`
Endpoint pembuatan data (`POST /api/mahasiswa`) merupakan operasi yang memicu penulisan data ke dalam basis data SQLite dan melibatkan komputasi I/O. Tanpa pembatasan, bot atau pengguna nakal dapat membanjiri server dengan jutaan entri sampah (*Spamming / Storage Exhaustion*).

- **Konfigurasi Rate Limiting:**
  Menerapkan ambang batas ketat maksimal 3 request per 10 detik per alamat IP klien.
- **Hasil Uji:**
  Ketika request ke-4 dikirimkan oleh IP yang sama, sistem secara langsung menolak permintaan dengan kode status HTTP `429 Too Many Requests` disertai header `Retry-After: 10`:
  ```json
  {
    "status": 429,
    "headers": {
      "Retry-After": "10"
    },
    "body": {
      "success": false,
      "message": "Terlalu banyak permintaan pembuatan mahasiswa. Silakan coba sesaat lagi.",
      "retryAfterSeconds": 10
    }
  }
  ```

---

### 2. Validasi Panjang Minimal untuk Field `nama`
Pada file [`latihan-11.ts`](file:///d:/SI-VA-Backend/SandikaYusuf-240160221044/Pertemuan-11/Latihan-Individu/latihan-11.ts), ditambahkan aturan validasi panjang nama mahasiswa minimal 3 karakter dan maksimal 100 karakter.
- **Implementasi:**
  ```typescript
  if (typeof nama !== "string" || nama.trim() === "") {
    errors.push("Field 'nama' wajib diisi dengan teks tidak kosong");
  } else if (nama.trim().length < 3) {
    errors.push("Panjang 'nama' terlalu pendek, minimal 3 karakter");
  } else if (nama.trim().length > 100) {
    errors.push("Panjang 'nama' melebihi batas maksimal 100 karakter");
  }
  ```
- **Pengujian Kasus Terlalu Pendek (`nama: "Al"`):**
  Server mengembalikan status `400 Bad Request`:
  ```json
  {
    "success": false,
    "message": "Validasi data mahasiswa gagal",
    "errors": ["Panjang 'nama' terlalu pendek, minimal 3 karakter"]
  }
  ```

---

### 3. Pengujian Origin yang Tidak Terdaftar pada Konfigurasi CORS
Mekanisme CORS selektif diuji dengan membandingkan permintaan dari origin resmi dan origin asing:
- **Origin Terdaftar (`http://localhost:3000`):**
  Server menyertakan header respons:
  ```http
  Access-Control-Allow-Origin: http://localhost:3000
  ```
- **Origin Tidak Terdaftar (`http://attacker-evil-domain.com`):**
  Server **tidak menyertakan** header `Access-Control-Allow-Origin`. Akibatnya, browser modern korban secara otomatis memblokir script pada website penyerang agar tidak dapat membaca respons data mahasiswa.

---

### 4. Mengapa `helmet` Tidak Dapat Mencegah SQL Injection?
Middleware `helmet` berfungsi mengamankan **Header HTTP pada Lapisan Browser Klien** (seperti menambahkan `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, dan `X-Frame-Options: SAMEORIGIN`) untuk mencegah serangan sisi klien seperti *Clickjacking* dan *Cross-Site Scripting (XSS)*.

Sebaliknya, **SQL Injection** adalah serangan yang terjadi pada **Lapisan Basis Data di Sisi Server Backend**. Serangan ini terjadi ketika input teks dari client dirangkai (*concatenated*) langsung ke dalam sintaks perintah SQL database. Karena `helmet` tidak memeriksa isi body maupun query database, `helmet` sama sekali tidak memiliki visibilitas terhadap query SQL. Pencegahan SQL Injection mutlak membutuhkan **Query Terparameterisasi (*Parameterized Queries*)** melalui ORM seperti Prisma.

---

### 5. Skenario yang Tidak Dapat Diselesaikan oleh Filter Input dan Mitigasi yang Tepat
- **Skenario Masalah: *Broken Object Level Authorization (BOLA) / Insecure Direct Object References (IDOR)***
  - *Ilustrasi:* Seorang mahasiswa dengan token sah memanggil endpoint `GET /api/mahasiswa/88` atau `DELETE /api/mahasiswa/88`. Input ID `88` adalah bilangan bulat positif yang 100% valid, lolos filter tipe data, dan tidak mengandung karakter SQL injection maupun XSS. Namun, data ID `88` adalah data milik mahasiswa lain yang tidak boleh dilihat atau dihapus oleh mahasiswa tersebut.
  - *Mengapa Filter Input Gagal:* Filter input hanya memvalidasi apakah tipe dan format data memenuhi spesifikasi (`isNumber`, `length`), bukan apakah pemanggil memiliki hak atas data spesifik tersebut dalam konteks bisnis.
- **Mitigasi yang Tepat:**
  1. **Enforce Authorization di Service Layer:** Memverifikasi kepemilikan data sebelum menjalankan query (`where: { id, userId: req.user.sub }`).
  2. **Role-Based Access Control (RBAC):** Memastikan operasi penghapusan atau koreksi data master hanya dapat dipicu oleh role berwenang (`ADMIN`).

---

## 6. TABEL HASIL PENGUJIAN OTOMATIS (`test-latihan-11.ts`)

| No | Skenario Pengujian | Input Data | Target Status | Hasil Status | Status Kelulusan | Verifikasi Perilaku |
|:--:|:---|:---|:---:|:---:|:---:|:---|
| 1 | Validasi nama terlalu pendek (<3 karakter) | `nama: "Al"` | 400 | 400 | **PASS** | Ditolak: Pesan 'terlalu pendek' |
| 2 | Validasi format NIM bukan angka | `nim: "240160221XYZ"` | 400 | 400 | **PASS** | Ditolak: Format NIM 8-20 digit angka murni |
| 3 | Validasi tahun angkatan tidak wajar | `angkatan: 1980` | 400 | 400 | **PASS** | Ditolak: Batas angkatan 2000-2100 |
| 4 | Permintaan dari Origin terdaftar | `Origin: http://localhost:3000` | 201 | 201 | **PASS** | Header `Access-Control-Allow-Origin` terkirim |
| 5 | Permintaan dari Origin tidak terdaftar | `Origin: http://attacker-evil-domain.com` | 201 | 201 | **PASS** | Header `Access-Control-Allow-Origin` diabaikan |
| 6 | Pemeriksaan Security Headers Helmet | Header Request Standar | 200 | 200 | **PASS** | Header `nosniff` dan `SAMEORIGIN` terpasang |
| 7 | Pemicuan Rate Limiting Ketat (Request ke-4) | IP: `10.0.0.99` (Loop 4x) | 429 | 429 | **PASS** | Status `429 Too Many Requests` + `Retry-After` |
| 8 | Uji Netralisasi Payload SQL Injection | `searchQuery: "' OR '1'='1"` | 200 | 200 | **PASS** | Dianggap string literal, data tabel tidak bocor |

**Hasil: 8 dari 8 Skenario Lulus (100% PASS).**

