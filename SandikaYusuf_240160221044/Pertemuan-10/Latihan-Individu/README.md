# LATIHAN INDIVIDU — PERTEMUAN 10
## JSON WEB TOKEN (JWT) DAN AUTHORIZATION

---

### IDENTITAS MAHASISWA
- **Nama:** Sandika Yusuf Permana
- **NIM:** 240160221044
- **Kelas:** SI-VA
- **Mata Kuliah:** Pemrograman Backend Web Framework
- **Studi Kasus:** Sistem Informasi Akademik / Manajemen Data Mahasiswa
- **Lokasi Direktori:** `SandikaYusuf-240160221044/Pertemuan-10/Latihan-Individu/`

---

## JAWABAN PERTANYAAN EVALUASI & TUGAS PRAKTIKUM

### 1. Penambahan Role Ketiga `staf` dan Implementasi Endpoint Khusus
Dalam arsitektur otorisasi berbasis role (*Role-Based Access Control* / RBAC), role `staf` ditambahkan sebagai pemisah antara wewenang eksekutif (`admin`), wewenang edukatif (`dosen`), wewenang administratif operasional (`staf`), dan wewenang peserta didik (`mahasiswa`).

- **Kode Rute & Middleware Role `staf`:**
  Pada file [`latihan-10.ts`](file:///d:/SI-VA-Backend/SandikaYusuf-240160221044/Pertemuan-10/Latihan-Individu/latihan-10.ts), didefinisikan endpoint `stafDashboardEndpoint`:
  ```typescript
  export const stafDashboardEndpoint = (req: HttpRequest): HttpResponse => {
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
        message: "Selamat datang di Panel Administrasi Staf Akademik",
        data: {
          petugas: req.user?.nama,
          email: req.user?.email,
          role: req.user?.role,
          menuOperasional: [
            "Verifikasi Kelengkapan Berkas Mahasiswa",
            "Input Jadwal Perkuliahan",
            "Rekapitulasi Presensi Semester",
          ],
        },
      },
    };
  };
  ```

---

### 2. Hasil Pengujian Endpoint, Token Rusak, dan Pembatasan Role
Seluruh kasus uji dieksekusi secara otomatis melalui [`test-latihan-10.ts`](file:///d:/SI-VA-Backend/SandikaYusuf-240160221044/Pertemuan-10/Latihan-Individu/test-latihan-10.ts).

Berikut rekapitulasi hasil pengujian:

| No | Skenario Pengujian | Input / Header | Target Status | Hasil Status | Status Kelulusan | Analisis Perilaku Sistem |
|:--:|:---|:---|:---:|:---:|:---:|:---|
| 1 | Akses endpoint staf dengan token role staf valid | `Bearer <stafToken>` | 200 | 200 | **PASS** | Token valid, signature sesuai, payload role `staf` diterima |
| 2 | Penolakan akses tanpa header Authorization | Kosong `{}` | 401 | 401 | **PASS** | Ditolak: Header Authorization tidak ditemukan |
| 3 | Penolakan skema otorisasi salah | `Basic <stafToken>` | 401 | 401 | **PASS** | Ditolak: Format Authorization wajib `Bearer <token>` |
| 4 | Penolakan token dengan signature palsu / dimanipulasi | `Bearer <tamperedToken>` | 401 | 401 | **PASS** | Ditolak: Signature mismatch (`INVALID_SIGNATURE`) |
| 5 | Penolakan string token malformed | `Bearer token_acak` | 401 | 401 | **PASS** | Ditolak: Token tidak memiliki 3 bagian titik (`INVALID_FORMAT`) |
| 6 | Penolakan role mahasiswa mengakses rute staf | `Bearer <mhsToken>` | 403 | 403 | **PASS** | Otorisasi gagal: Role `mahasiswa` dilarang (403 Forbidden) |
| 7 | Penolakan role dosen mengakses rute staf | `Bearer <dosenToken>` | 403 | 403 | **PASS** | Otorisasi gagal: Role `dosen` dilarang (403 Forbidden) |
| 8 | Penolakan token yang telah kedaluwarsa | `Bearer <expiredToken>` | 401 | 401 | **PASS** | Ditolak: `now > payload.exp` (`TOKEN_EXPIRED`) |
| 9 | Verifikasi sanitasi payload JWT | Payload token | 200 | 200 | **PASS** | Field `password` dan `passwordHash` terbukti tidak bocor |

**Hasil: 9 dari 9 Skenario Lulus (100% PASS).**

---

### 3. Mengapa Klaim `exp` Harus Diverifikasi pada Setiap Request?
Klaim `exp` (*Expiration Time*) adalah klaim standar terdaftar (*registered claim*) pada spesifikasi RFC 7519 yang menentukan waktu kedaluwarsa token dalam format Unix Timestamp (*seconds since epoch*). 

Klaim `exp` wajib diperiksa secara ketat pada setiap request karena:
1. **Sifat Stateless JWT:** Karena server tidak menyimpan session ID di database untuk setiap request, masa berlaku token adalah satu-satunya mekanisme pembatas durasi akses yang inherent pada token itu sendiri.
2. **Pencegahan Penyalahgunaan Token Lama (*Replay Attacks*):** Jika klaim `exp` diabaikan, token yang dibuat bertahun-tahun lalu oleh akun yang mungkin sudah dinonaktifkan akan tetap berlaku selamanya.
3. **Membatasi Jendela Kerentanan (*Window of Vulnerability*):** Jika sebuah token berhasil dicuri oleh pihak jahat, verifikasi `exp` memastikan bahwa penyerang hanya memiliki waktu yang sangat sempit untuk menyalahgunakannya.
4. **Logika Verifikasi:**
   ```typescript
   const now = Math.floor(Date.now() / 1000);
   if (payload.exp && now > payload.exp) {
     return { valid: false, error: "TOKEN_EXPIRED", message: "Token telah kedaluwarsa" };
   }
   ```

---

### 4. Perbandingan Dampak Access Token Berumur 15 Menit vs 24 Jam Ketika Terjadi Kebocoran

| Parameter Evaluasi | Access Token 15 Menit (*Short-Lived*) | Access Token 24 Jam (*Long-Lived*) |
|---|---|---|
| **Jendela Ancaman Pencurian (*Blast Radius*)** | **Sangat Rendah (Maksimal 15 Menit)**.<br>Setelah 15 menit, token otomatis mati dan tidak dapat digunakan lagi oleh penyerang. | **Sangat Tinggi (Hingga 24 Jam Penuh)**.<br>Penyerang memiliki waktu seharian penuh untuk mengeksfiltrasi data, memodifikasi catatan akademik, atau merusak sistem. |
| **Ketergantungan Mekanisme Revokasi Server** | **Minimal**.<br>Sistem tidak perlu membangun tabel *token blacklist* yang berat, karena token akan kedaluwarsa secara mandiri dalam waktu singkat. | **Kritis / Mutlak Wajib**.<br>Jika terjadi kebocoran, administrator terpaksa mencabut token secara manual di Redis/Database atau mengganti `JWT_SECRET` (yang menyebabkan seluruh pengguna logout). |
| **Dampak Perubahan Hak Akses / Role** | **Cepat Diperbarui**.<br>Jika pengguna diturunkan jabatannya (misal dari Staf menjadi Mahasiswa), token lama yang membawa klaim `role: "staf"` hanya berlaku maksimal 15 menit sebelum meminta token baru. | **Lambat Diperbarui**.<br>Pengguna yang telah dipecat atau diubah perannya masih memegang token dengan wewenang lama selama 24 jam ke depan. |
| **Kebutuhan Refresh Token** | **Memerlukan Refresh Token**.<br>Dibutuhkan arsitektur pasangan token (*access token* + *refresh token*) agar pengguna tidak terganggu harus login ulang setiap 15 menit. | **Tidak Membutuhkan Refresh Token**.<br>Pengguna cukup login sekali sehari, namun dengan kompromi keamanan yang sangat berisiko. |

**Kesimpulan:** Menggunakan masa berlaku singkat (15 menit) merupakan standar *best-practice* industri backend modern demi menjaga keamanan data dan membatasi risiko kebocoran kredensial.

