# LATIHAN INDIVIDU — PERTEMUAN 10

## JSON WEB TOKEN (JWT) DAN AUTHORIZATION

### IDENTITAS MAHASISWA

- **Nama:** Devaldy Dzikri
- **NIM:** 240160221050
- **Kelas:** SI-VA
- **Studi Kasus:** Sistem Informasi Akademik / Manajemen Data Mahasiswa

---

## 1. Penambahan Role `staf` dan Endpoint Khusus

Implementasi menggunakan empat role, yaitu `admin`, `dosen`, `mahasiswa`, dan `staf`. Role `staf` digunakan untuk pengguna yang menjalankan kegiatan administrasi akademik.

Pada file `latihan-10.ts`, fungsi `stafDashboardEndpoint` merupakan endpoint simulasi yang hanya dapat diakses oleh pengguna dengan role `staf`.

Pemeriksaan dilakukan melalui dua tahap:

1. `authenticate()` memeriksa header Authorization dan validitas JWT. Jika token tidak ditemukan atau tidak valid, sistem mengembalikan status 401.
2. `authorize(["staf"])` memeriksa role pengguna. Jika role tidak sesuai, sistem mengembalikan status 403.

Jika kedua pemeriksaan berhasil, endpoint mengembalikan status 200 dan informasi dashboard staf.

## 2. Pengujian

Pengujian otomatis terdapat pada file `test-latihan-10.ts`. Sembilan skenario yang diuji adalah:

| No. | Skenario                                            | Status yang diharapkan |
| --: | --------------------------------------------------- | ---------------------: |
|   1 | Staf mengakses endpoint dengan token valid          |                    200 |
|   2 | Request tanpa header Authorization                  |                    401 |
|   3 | Request menggunakan skema Basic                     |                    401 |
|   4 | Token dengan signature yang dimanipulasi            |                    401 |
|   5 | Token dengan format tidak valid                     |                    401 |
|   6 | Mahasiswa mengakses endpoint staf                   |                    403 |
|   7 | Dosen mengakses endpoint staf                       |                    403 |
|   8 | Token telah kedaluwarsa                             |                    401 |
|   9 | Payload JWT tidak memuat password atau passwordHash |                    200 |

**Hasil aktual:** jalankan test terlebih dahulu dan masukkan jumlah PASS, FAIL, serta persentase berdasarkan keluaran terminal. Jangan mengisi hasil sebagai lulus sebelum pengujian benar-benar berhasil.

## 3. Mengapa Klaim `exp` Harus Diverifikasi?

Klaim `exp` (Expiration Time) menentukan waktu kedaluwarsa token dalam Unix Timestamp. Server perlu memeriksa klaim tersebut pada setiap verifikasi token agar token yang sudah kedaluwarsa tidak diterima.

Pemeriksaan ini penting untuk:

- Membatasi masa penggunaan token.
- Mengurangi waktu penyalahgunaan apabila token dicuri.
- Menolak token lama yang sudah melewati batas waktu.
- Menjaga agar setiap request menggunakan token yang masih berlaku.

Pada implementasi ini, waktu saat ini dibandingkan dengan nilai `payload.exp`. Jika waktu saat ini sudah mencapai atau melewati waktu kedaluwarsa, token ditolak dengan error `TOKEN_EXPIRED`.

## 4. Perbandingan Access Token 15 Menit dan 24 Jam

| Parameter               | 15 Menit                                   | 24 Jam                                    |
| ----------------------- | ------------------------------------------ | ----------------------------------------- |
| Masa berlaku            | Singkat                                    | Lebih lama                                |
| Risiko jika token bocor | Jendela penyalahgunaan lebih pendek        | Jendela penyalahgunaan lebih panjang      |
| Dampak perubahan role   | Token lama lebih cepat kedaluwarsa         | Klaim role lama dapat bertahan lebih lama |
| Kenyamanan pengguna     | Mungkin memerlukan mekanisme refresh token | Lebih jarang perlu login ulang            |

**Kesimpulan:** Access token berumur pendek membatasi waktu penyalahgunaan ketika token bocor. Token 24 jam lebih nyaman, tetapi memperbesar rentang waktu ketika token yang dicuri masih dapat digunakan. Pemilihan masa berlaku perlu mempertimbangkan keamanan dan kenyamanan pengguna.

## 5. Cara Menjalankan

Pastikan Node.js sudah terpasang. Dari direktori `Latihan-Individu`, jalankan:

```bash
npx tsx test-latihan-10.ts
```

Jika `tsx` belum tersedia pada project, pasang sebagai development dependency:

```bash
npm install -D tsx typescript
```

Pengujian akan menampilkan hasil setiap skenario beserta rekapitulasi PASS dan FAIL.

## 6. Catatan Implementasi

- Project ini merupakan simulasi JWT dan authorization untuk latihan.
- Data `MOCK_USERS` hanya data contoh lokal, bukan database sungguhan.
- `passwordHash` pada data simulasi adalah placeholder untuk menggambarkan data yang tidak boleh dimasukkan ke payload JWT; bukan hash password produksi.
- Secret bawaan hanya untuk pengujian lokal. Pada penerapan nyata, gunakan `JWT_SECRET` dari environment dengan nilai acak yang kuat dan jangan memasukkan secret ke repository.
- Implementasi ini berfokus pada access token dan belum mencakup refresh token, pencabutan token, atau blacklist.

## KESIMPULAN

Latihan ini menerapkan pembuatan dan verifikasi JWT, pemeriksaan masa berlaku token, middleware authentication, serta authorization berdasarkan role. Status 401 digunakan ketika autentikasi gagal, sedangkan status 403 digunakan ketika pengguna sudah terautentikasi tetapi tidak memiliki hak akses yang diperlukan.
