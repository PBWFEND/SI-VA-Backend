# LATIHAN INDIVIDU — PERTEMUAN 10
## JSON WEB TOKEN (JWT) DAN AUTHORIZATION

---

### IDENTITAS MAHASISWA
- **Nama:** Della Kartika
- **NIM:** 240160221008
- **Kelas:** SI-VA
- **Mata Kuliah:** Pemrograman Backend Web Framework
- **Studi Kasus:** Sistem Informasi Absensi Mahasiswa
- **Lokasi Direktori:** `Della-Kartika-240160221008/pertemuan-10/Latihan-Individu/`

---

## JAWABAN PERTANYAAN EVALUASI & TUGAS PRAKTIKUM

### 1. Penambahan Role Ketiga `staf` dan Implementasi Endpoint Khusus
Dalam arsitektur otorisasi berbasis role (*Role-Based Access Control* / RBAC) pada Sistem Informasi Absensi Mahasiswa, role `staf` ditambahkan sebagai pemisah antara kewenangan administrator sistem (`admin`), verifikator kelas oleh pendidik (`dosen`), pengelola berkas administratif presensi (`staf`), dan pengisi presensi perkuliahan (`mahasiswa`).

- **Kode Rute & Middleware Role `staf`:**
  Pada file [`latihan-10.ts`](file:///d:/SI-VA-Backend/Della-Kartika-240160221008/pertemuan-10/Latihan-Individu/latihan-10.ts), didefinisikan endpoint `stafAbsensiRekapEndpoint`:
  ```typescript
  export const stafAbsensiRekapEndpoint = (req: HttpRequest): HttpResponse => {
    // 1. Verifikasi Keberadaan dan Validitas Token (401 jika gagal)
    const authErr = authenticate(req);
    if (authErr) return authErr;

    // 2. Verifikasi Kesesuaian Role (403 jika bukan staf)
    const roleErr = authorize(["staf"])(req);
    if (roleErr) return roleErr;

    // 3. Respon Sukses untuk Pengguna Berhak (200 OK)
    return {
      status: 200,
      body: {
        success: true,
        message: "Selamat datang di Panel Verifikasi Staf Absensi Mahasiswa",
        data: {
          petugas: req.user?.nama,
          email: req.user?.email,
          role: req.user?.role,
          menuVerifikasi: [
            "Verifikasi Surat Izin / Keterangan Sakit",
            "Cetak Laporan Kehadiran Mahasiswa SI-VA",
            "Koreksi Kehadiran Terlambat",
          ],
        },
      },
    };
  };
  ```

---

### 2. Hasil Pengujian Endpoint, Token Rusak, dan Pembatasan Role
Seluruh kasus uji dieksekusi secara otomatis melalui [`test-latihan-10.ts`](file:///d:/SI-VA-Backend/Della-Kartika-240160221008/pertemuan-10/Latihan-Individu/test-latihan-10.ts).

Berikut rekapitulasi hasil pengujian:

| No | Skenario Pengujian | Input / Header | Target Status | Hasil Status | Status Kelulusan | Analisis Perilaku Sistem |
|:--:|:---|:---|:---:|:---:|:---:|:---|
| 1 | Akses endpoint staf absensi dengan token role staf valid | `Bearer <stafToken>` | 200 | 200 | **PASS** | Token valid, signature sesuai, payload role `staf` diterima |
| 2 | Penolakan akses tanpa header Authorization | Kosong `{}` | 401 | 401 | **PASS** | Ditolak: Header Authorization tidak ditemukan |
| 3 | Penolakan skema otorisasi salah | `Basic <stafToken>` | 401 | 401 | **PASS** | Ditolak: Format Authorization wajib `Bearer <token>` |
| 4 | Penolakan token dengan signature palsu / dimanipulasi | `Bearer <tamperedToken>` | 401 | 401 | **PASS** | Ditolak: Signature mismatch (`INVALID_SIGNATURE`) |
| 5 | Penolakan string token malformed | `Bearer token_acak` | 401 | 401 | **PASS** | Ditolak: Token tidak memiliki 3 bagian titik (`INVALID_FORMAT`) |
| 6 | Penolakan role mahasiswa mengakses rute staf absensi | `Bearer <mhsToken>` | 403 | 403 | **PASS** | Otorisasi gagal: Role `mahasiswa` dilarang (403 Forbidden) |
| 7 | Penolakan role dosen mengakses rute staf absensi | `Bearer <dosenToken>` | 403 | 403 | **PASS** | Otorisasi gagal: Role `dosen` dilarang (403 Forbidden) |
| 8 | Penolakan token yang telah kedaluwarsa | `Bearer <expiredToken>` | 401 | 401 | **PASS** | Ditolak: `now > payload.exp` (`TOKEN_EXPIRED`) |
| 9 | Verifikasi sanitasi payload JWT | Payload token | 200 | 200 | **PASS** | Field `password` dan `passwordHash` terbukti tidak bocor |

**Hasil: 9 dari 9 Skenario Lulus (100% PASS).**

---

### 3. Mengapa Klaim `exp` Harus Diverifikasi pada Setiap Request?
Klaim `exp` (*Expiration Time*) adalah klaim standar terdaftar (*registered claim*) pada spesifikasi RFC 7519 yang menentukan batas akhir masa aktif token dalam format Unix Timestamp (*seconds since epoch*).

Klaim `exp` wajib diperiksa secara ketat pada setiap request karena:
1. **Sifat Stateless JWT:** Backend tidak menyimpan status sesi (*session state*) pada basis data. Oleh sebab itu, integritas waktu kedaluwarsa yang tertera di dalam payload token adalah satu-satunya pelindung durasi masa pakai token tersebut.
2. **Mitigasi Serangan Pengulangan (*Replay Attacks*):** Jika server tidak memeriksa klaim `exp`, penyerang yang berhasil menyadap token (misalnya melalui jaringan Wi-Fi publik atau cache proxy) dapat menggunakan token tersebut berulang kali tanpa batas waktu.
3. **Membatasi Jendela Kerentanan (*Exposure Window*):** Token yang dicuri hanya dapat digunakan dalam rentang waktu yang sangat singkat sebelum kedaluwarsa.
4. **Logika Verifikasi:**
   ```typescript
   const now = Math.floor(Date.now() / 1000);
   if (payload.exp && now > payload.exp) {
     return { valid: false, error: "TOKEN_EXPIRED", message: "Token telah kedaluwarsa (expired)" };
   }
   ```

---

### 4. Perbandingan Dampak Access Token Berumur 15 Menit vs 24 Jam Ketika Terjadi Kebocoran

| Parameter Evaluasi | Access Token 15 Menit (*Short-Lived*) | Access Token 24 Jam (*Long-Lived*) |
|---|---|---|
| **Jendela Ancaman Pencurian (*Blast Radius*)** | **Sangat Terkendali (Maksimal 15 Menit)**.<br>Setelah 15 menit, token otomatis mati secara mandiri tanpa campur tangan backend. | **Sangat Berbahaya (Hingga 24 Jam Penuh)**.<br>Penyerang memiliki waktu seharian penuh untuk mengubah catatan absensi, memanipulasi data mahasiswa, atau mengeksfiltrasi informasi pribadi. |
| **Ketergantungan Mekanisme Revokasi Server** | **Minimal**.<br>Backend tidak wajib membangun infrastruktur *token blacklist* di Redis/Database, meminimalkan kompleksitas dan konsumsi RAM server. | **Kritis / Wajib Disediakan**.<br>Jika token bocor, satu-satunya cara menghentikannya sebelum 24 jam adalah memasukkan token ke tabel *blacklist* atau mengganti `JWT_SECRET` server secara drastis. |
| **Dampak Pembaruan Hak Akses Pengguna** | **Cepat Diperbarui**.<br>Jika seorang mahasiswa yang tadinya asisten dosen dinonaktifkan perannya, token lama yang membawa klaim role tinggi hanya akan berlaku maksimal 15 menit. | **Lambat Diperbarui**.<br>Pengguna yang wewenangnya sudah dicabut di database masih dapat menggunakan token lama untuk mengakses sistem selama 24 jam. |
| **Kebutuhan Refresh Token** | **Memerlukan Refresh Token**.<br>Dibutuhkan mekanisme refresh token yang aman (*HttpOnly Cookie*) agar pengguna tidak terganggu harus login ulang setiap 15 menit. | **Tidak Membutuhkan Refresh Token**.<br>Pengguna cukup login sekali sehari, namun dengan kompromi celah keamanan yang sangat berbahaya. |

**Kesimpulan:** Menggunakan masa berlaku singkat (15 menit) merupakan standar *best-practice* industri backend modern demi menjaga keamanan data dan membatasi risiko kebocoran kredensial presensi mahasiswa.

