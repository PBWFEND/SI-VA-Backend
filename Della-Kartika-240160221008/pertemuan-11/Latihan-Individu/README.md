# LATIHAN INDIVIDU — PERTEMUAN 11
## KEAMANAN BACKEND DAN API
### STUDI KASUS: SISTEM INFORMASI ABSENSI MAHASISWA

---

### IDENTITAS MAHASISWA
- **Nama:** Della Kartika
- **NIM:** 240160221008
- **Kelas:** SI-VA
- **Mata Kuliah:** Pemrograman Backend Web Framework
- **Studi Kasus:** Sistem Informasi Absensi Mahasiswa
- **Lokasi Direktori:** `Della-Kartika-240160221008/pertemuan-11/Latihan-Individu/`

---

## JAWABAN PERTANYAAN EVALUASI & TUGAS PRAKTIKUM

### 1. Penerapan Batas Laju (*Rate Limiting*) yang Lebih Ketat pada `POST /api/absensi`
Endpoint pencatatan absensi (`POST /api/absensi`) merupakan operasi penulisan yang mengubah catatan kehadiran di basis data. Tanpa pembatasan laju (*rate limiting*), penyerang atau skrip bot dapat membanjiri server dengan jutaan request presensi palsu (*Spamming / DoS*), yang dapat menyebabkan *database storage exhaustion* dan ketidakakuratan rekap absensi.

- **Konfigurasi Rate Limiting:**
  Menerapkan ambang batas ketat maksimal 3 request per 10 detik per alamat IP klien pada simulasi pengujian.
- **Hasil Uji:**
  Ketika request ke-4 dikirimkan oleh alamat IP yang sama, sistem secara langsung menolak permintaan dengan kode status HTTP `429 Too Many Requests` disertai header `Retry-After: 10`:
  ```json
  {
    "status": 429,
    "headers": {
      "Retry-After": "10"
    },
    "body": {
      "success": false,
      "message": "Terlalu banyak permintaan pencatatan absensi. Silakan coba sesaat lagi.",
      "retryAfterSeconds": 10
    }
  }
  ```

---

### 2. Validasi Status Absensi dan Panjang Minimal Field Input
Pada file [`latihan-11.ts`](file:///d:/SI-VA-Backend/Della-Kartika-240160221008/pertemuan-11/Latihan-Individu/latihan-11.ts), diterapkan validasi ketat terhadap integritas data absensi:
1. Status absensi hanya boleh salah satu dari nilai enum yang sah: `HADIR`, `IZIN`, `SAKIT`, `ALPA`. Nilai di luar itu (seperti `"BOLOS"`) langsung ditolak dengan status HTTP `400 Bad Request`.
2. Format NIM wajib 8–20 digit angka murni.
3. Nama mata kuliah minimal 3 karakter.

- **Implementasi Validasi Status:**
  ```typescript
  if (!status || typeof status !== "string") {
    errors.push("Field 'status' wajib diisi (pilihan: HADIR, IZIN, SAKIT, ALPA)");
  } else if (!VALID_STATUS_LIST.includes(status.toUpperCase() as AbsensiStatus)) {
    errors.push(`Status absensi '${status}' tidak valid. Pilihan yang sah: ${VALID_STATUS_LIST.join(", ")}`);
  }
  ```
- **Pengujian Status Tidak Valid (`status: "BOLOS"`):**
  Server mengembalikan status `400 Bad Request`:
  ```json
  {
    "success": false,
    "message": "Validasi data absensi gagal",
    "errors": ["Status absensi 'BOLOS' tidak valid. Pilihan yang sah: HADIR, IZIN, SAKIT, ALPA"]
  }
  ```

---

### 3. Pengujian Origin yang Tidak Terdaftar pada Konfigurasi CORS
Mekanisme CORS selektif diuji untuk membedakan antara frontend resmi kampus dengan origin asing:
- **Origin Terdaftar (`http://localhost:3000`):**
  Server merespons dan menyertakan header:
  ```http
  Access-Control-Allow-Origin: http://localhost:3000
  ```
- **Origin Tidak Terdaftar (`http://attacker-evil-site.com`):**
  Server **tidak menyertakan** header `Access-Control-Allow-Origin`. Akibatnya, peramban (browser) modern secara otomatis memblokir script pada situs asing tersebut sehingga tidak dapat membaca respons data kehadiran mahasiswa.

---

### 4. Mengapa `helmet` Tidak Dapat Mencegah SQL Injection?
Middleware `helmet` bekerja pada **Lapisan Header HTTP Browser** (mengatur header keamanan seperti `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, dan `X-Frame-Options: SAMEORIGIN`) untuk memitigasi serangan di sisi peramban klien, seperti *Cross-Site Scripting (XSS)*, *MIME-sniffing*, dan *Clickjacking*.

Sebaliknya, **SQL Injection** adalah kerentanan yang terjadi pada **Lapisan Basis Data di Server Backend**. Serangan ini terjadi ketika input teks yang dikirimkan klien dirangkai (*string concatenation*) secara langsung ke dalam sintaks query SQL database. Karena `helmet` tidak memeriksa payload body, parameter URL, maupun eksekusi perintah ke basis data, `helmet` sama sekali tidak dapat melindungi query dari manipulasi SQL. Perlindungan mutlak dari SQL Injection dicapai melalui **Query Terparameterisasi (*Parameterized Queries*)** menggunakan ORM seperti Prisma.

---

### 5. Skenario yang Tidak Dapat Diselesaikan oleh Filter Input dan Mitigasi yang Tepat
- **Skenario Masalah: *Identity Spoofing pada Pencatatan Presensi (Titip Absen)* & *Broken Object Level Authorization (BOLA)***
  - *Ilustrasi Kasus:* Seorang mahasiswa bernama Budi login dengan akun resminya dan mendapatkan token JWT yang valid. Saat melakukan request presensi `POST /api/absensi`, Budi mengirimkan payload JSON berisi `nim: "240160221008"` (NIM Della) agar presensi Della tercatat hadir.
  - *Mengapa Filter Input Gagal:* Filter input hanya memvalidasi apakah tipe dan format data memenuhi spesifikasi (misalnya: apakah NIM berupa angka 8–20 digit, apakah status berupa `"HADIR"`). Karena input NIM Della adalah angka murni yang sah, filter input menganggap request tersebut 100% valid. Filter input tidak memiliki konteks mengenai *siapa yang sedang melakukan request*.
- **Mitigasi yang Tepat:**
  1. **Anti-Spoofing Identity Enforcement:** Pada Controller `createAbsensi`, jika peran pemanggil adalah `MAHASISWA`, backend **wajib mengabaikan atau mengganti `req.body.nim`** dengan `req.user.nim` dan `req.user.nama` yang diekstraksi dari payload JWT terverifikasi.
  2. **Role-Based Authorization (RBAC):** Hanya role `ADMIN` atau `DOSEN` yang diperbolehkan mencatat atau mengubah kehadiran atas nama NIM orang lain.

---

## 6. TABEL HASIL PENGUJIAN OTOMATIS (`test-latihan-11.ts`)

| No | Skenario Pengujian | Input Data | Target Status | Hasil Status | Status Kelulusan | Verifikasi Perilaku |
|:--:|:---|:---|:---:|:---:|:---:|:---|
| 1 | Validasi status absensi tidak valid | `status: "BOLOS"` | 400 | 400 | **PASS** | Ditolak: Pesan 'tidak valid' |
| 2 | Validasi format NIM bukan angka murni | `nim: "240160221XYZ"` | 400 | 400 | **PASS** | Ditolak: Format NIM 8-20 digit angka murni |
| 3 | Validasi nama mata kuliah terlalu pendek | `mataKuliah: "PB"` | 400 | 400 | **PASS** | Ditolak: Batas minimal 3 karakter |
| 4 | Permintaan dari Origin terdaftar | `Origin: http://localhost:3000` | 201 | 201 | **PASS** | Header `Access-Control-Allow-Origin` terkirim |
| 5 | Permintaan dari Origin tidak terdaftar | `Origin: http://attacker-evil-site.com` | 201 | 201 | **PASS** | Header `Access-Control-Allow-Origin` diabaikan |
| 6 | Pemeriksaan Security Headers Helmet | Header Request Standar | 200 | 200 | **PASS** | Header `nosniff` dan `SAMEORIGIN` terpasang |
| 7 | Pemicuan Rate Limiting Ketat (Request ke-4) | IP: `10.0.0.88` (Loop 4x) | 429 | 429 | **PASS** | Status `429 Too Many Requests` + `Retry-After` |
| 8 | Uji Netralisasi Payload SQL Injection | `searchQuery: "' OR '1'='1"` | 200 | 200 | **PASS** | Dianggap string literal, data tabel tidak bocor |

**Hasil: 8 dari 8 Skenario Lulus (100% PASS).**

