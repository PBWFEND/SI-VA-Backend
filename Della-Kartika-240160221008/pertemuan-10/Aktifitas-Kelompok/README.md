# AKTIFITAS KELOMPOK — PERTEMUAN 10
## PERANCANGAN SISTEM AUTHORIZATION DAN JSON WEB TOKEN (JWT)

---

### IDENTITAS KELOMPOK
- **Kelompok:** 1 (Satu)
- **Kelas:** SI-VA
- **Mata Kuliah:** Pemrograman Backend Web Framework
- **Studi Kasus:** Sistem Informasi Absensi Mahasiswa
- **Anggota Kelompok:**
  - Della Kartika
  - Nadya Zahra Aulia
  - Rico Muhammad F
  - Nabilla Natasya Putri

---

## 1. PENDAHULUAN & STUDI KASUS DOMAIN
Sistem Informasi Absensi Mahasiswa bertanggung jawab dalam pencatatan kehadiran, verifikasi surat izin/sakit, dan pelaporan presensi perkuliahan secara digital. Setelah lapisan autentikasi dibangun pada Pertemuan 9 untuk memverifikasi akun pengguna, Pertemuan 10 ini memfokuskan perancangan pada mekanisme otorisasi (*Authorization*) berbasis *JSON Web Token* (JWT).

Otorisasi presensi menjamin bahwa setiap aksi manipulasi status kehadiran hanya dapat dilakukan oleh pengguna yang memiliki kewenangan sah. Kelompok 1 mendefinisikan 4 (empat) peran (*role*) pengguna dalam sistem absensi:
1. **ADMIN:** Memegang kendali tertinggi sistem presensi, berwenang mengelola seluruh akun pengguna, melihat log audit, serta melakukan koreksi atau penghapusan catatan absensi jika terjadi galat sistem.
2. **DOSEN:** Memiliki wewenang untuk memeriksa rekap kehadiran kelas, memverifikasi status kehadiran mahasiswa di kelasnya (HADIR, IZIN, SAKIT, ALPA), serta mengubah status presensi mahasiswa.
3. **STAF:** Berperan sebagai staf tata usaha/akademik yang bertugas memvalidasi dokumen surat keterangan sakit/izin mahasiswa serta mencetak rekapitulasi kehadiran per semester.
4. **MAHASISWA:** Berhak melihat rekapitulasi riwayat presensi pribadi dan melakukan pengisian absensi mandiri pada jadwal perkuliahan aktif.

---

## 2. MATRIKS RANCANGAN ENDPOINT, KLAIM JWT, DAN KONTROL AKSES

Berikut adalah tabel rancangan endpoint API Sistem Informasi Absensi Mahasiswa terlindungi, kebutuhan klaim JWT, batasan role, serta ekspektasi status respon HTTP:

| No | Endpoint URL | Metode HTTP | Deskripsi Fungsi | Klaim JWT Wajib | Role yang Diizinkan | Status Jika Tanpa Token / Token Rusak | Status Jika Role Tidak Sesuai |
|:--:|:---|:---:|:---|:---|:---|:---:|:---:|
| 1 | `/auth/register` | `POST` | Registrasi akun baru pengguna | *Publik* | Semua (Tanpa Login) | N/A | N/A |
| 2 | `/auth/login` | `POST` | Login & penerbitan Access Token | *Publik* | Semua (Tanpa Login) | N/A | N/A |
| 3 | `/health` | `GET` | Health check & monitoring status API | *Publik* | Semua (Tanpa Login) | N/A | N/A |
| 4 | `/auth/me` | `GET` | Mendapatkan data profil pengguna yang login | `sub`, `email`, `role` | `ADMIN`, `DOSEN`, `STAF`, `MAHASISWA` | `401 Unauthorized` | N/A (Semua role login berhak) |
| 5 | `/api/absensi` | `GET` | Menampilkan seluruh riwayat presensi | `sub`, `role` | `ADMIN`, `DOSEN`, `STAF`, `MAHASISWA` | `401 Unauthorized` | `403 Forbidden` |
| 6 | `/api/absensi/:id` | `GET` | Menampilkan detail catatan absensi spesifik | `sub`, `role` | `ADMIN`, `DOSEN`, `STAF`, `MAHASISWA` | `401 Unauthorized` | `403 Forbidden` |
| 7 | `/api/absensi` | `POST` | Input data absensi/kehadiran baru | `sub`, `role` | `ADMIN`, `DOSEN`, `STAF`, `MAHASISWA` | `401 Unauthorized` | `403 Forbidden` |
| 8 | `/api/absensi/:id` | `PUT` | Memperbarui status kehadiran / keterangan | `sub`, `role` | `ADMIN`, `DOSEN`, `STAF` | `401 Unauthorized` | `403 Forbidden` (Contoh: Mahasiswa) |
| 9 | `/api/absensi/:id` | `DELETE` | Menghapus catatan absensi permanen | `sub`, `role` | `ADMIN` | `401 Unauthorized` | `403 Forbidden` (Dosen, Staf, Mahasiswa) |
| 10 | `/api/staf/rekap` | `GET` | Menampilkan rekapitulasi kehadiran staf | `sub`, `role` | `ADMIN`, `STAF` | `401 Unauthorized` | `403 Forbidden` (Dosen, Mahasiswa) |

---

## 3. ANALISIS PERBEDAAN KODE STATUS: 401 VS 403

Pemisahan tanggung jawab kode status HTTP sangat krusial dalam domain presensi:

### A. HTTP 401 Unauthorized (Kegagalan Autentikasi)
- **Definisi:** Klien mencoba mengakses endpoint presensi tanpa identitas yang valid. Terjadi ketika header `Authorization` tidak dikirimkan, skema bukan `Bearer`, token rusak/dimanipulasi, atau token telah kedaluwarsa (*expired*).
- **Pesan Respon Standar:**
  ```json
  {
    "success": false,
    "message": "Akses ditolak: Token autentikasi tidak ditemukan atau tidak valid"
  }
  ```

### B. HTTP 403 Forbidden (Kegagalan Otorisasi / Pelanggaran Wewenang)
- **Definisi:** Klien telah teridentifikasi dengan sah melalui token JWT (misalnya seorang `MAHASISWA`), namun mencoba mengakses tindakan yang berada di luar hak aksesnya (misalnya mencoba menghapus data presensi via `DELETE /api/absensi/:id` yang dikhususkan untuk `ADMIN`).
- **Pesan Respon Standar:**
  ```json
  {
    "success": false,
    "message": "Akses terlarang: Anda tidak memiliki izin untuk mengakses resource ini"
  }
  ```

> [!IMPORTANT]
> Jangan pernah mengembalikan kode status `401` saat kegagalan disebabkan oleh batasan role. Pengembalian `401` akan memicu siklus refresh token atau logout palsu di sisi antarmuka pengguna, padahal token tersebut valid namun wewenangnya yang tidak mencukupi.

---

## 4. TINJAUAN KEAMANAN & PENCEGAHAN KERENTANAN

Dalam rancangan kelompok 1, diidentifikasi tiga aspek kritis pengamanan token presensi:

1. **Bahaya Endpoint Manipulasi Presensi Tanpa Middleware:**
   - *Risiko:* Jika endpoint `PUT /api/absensi/:id` atau `DELETE /api/absensi/:id` tidak dilindungi middleware `authenticateToken` dan `authorizeRoles`, mahasiswa dapat secara sepihak mengubah status `ALPA` menjadi `HADIR` untuk dirinya sendiri maupun orang lain.
   - *Mitigasi:* Seluruh rute modifikasi presensi wajib dilindungi middleware ganda: verifikasi token dan validasi role wewenang.
2. **Kebocoran Informasi Sensitif pada Payload Token:**
   - *Risiko:* Mengikutsertakan hash password atau rahasia internal pada token. Payload JWT hanya menggunakan Base64Url encoding sehingga isinya dapat dibaca publik.
   - *Mitigasi:* Payload JWT dibatasi hanya berisi identitas non-sensitif: `sub` (ID akun), `email`, `role`, dan `nim`.
3. **Pengelolaan Kunci Rahasia dan Masa Berlaku:**
   - *Risiko:* Menggunakan secret token statis di dalam repositori atau menetapkan masa kedaluwarsa token tanpa batas.
   - *Mitigasi:* Nilai `JWT_SECRET` dikelola via environment variable `.env` (dilindungi `.gitignore`), dan access token dibatasi berumur singkat (`15m`).

---

## 5. DIAGRAM ALUR AUTENTIKASI DAN OTORISASI PRESENSI (MERMAID)

```mermaid
sequenceDiagram
    autonumber
    actor Mahasiswa
    participant Client as Aplikasi Klien Presensi
    participant AuthRouter as Auth Controller & Service
    participant AbsensiRoute as Protected Absensi Middleware
    participant DB as Basis Data Absensi (SQLite / Prisma)

    %% Skenario 1: Login & Perolehan Token
    rect rgb(240, 248, 255)
    Note over Mahasiswa, DB: Fase 1: Autentikasi Pengguna & Penerbitan Token JWT
    Mahasiswa->>Client: Input Email & Password Akun
    Client->>AuthRouter: POST /auth/login { email, password }
    AuthRouter->>DB: Cari Akun Pengguna berdasarkan Email
    DB-->>AuthRouter: Kembalikan Data Akun (passwordHash & role: "MAHASISWA")
    AuthRouter->>AuthRouter: Verifikasi Hash Password (scrypt + timingSafeEqual)
    alt Kredensial Valid
        AuthRouter->>AuthRouter: Terbitkan JWT Access Token (payload: sub, email, role, nim; exp: 15m)
        AuthRouter-->>Client: 200 OK { token, expiresIn, data }
    else Kredensial Salah
        AuthRouter-->>Client: 401 Unauthorized { message: "Email atau kata sandi salah" }
    end
    end

    %% Skenario 2: Upaya Penghapusan Absensi oleh Mahasiswa (Ditolak 403)
    rect rgb(255, 240, 240)
    Note over Mahasiswa, DB: Fase 2: Otorisasi & Pencegahan Pelanggaran Wewenang
    Client->>AbsensiRoute: DELETE /api/absensi/10 (Header: Authorization: Bearer <token_mhs>)
    AbsensiRoute->>AbsensiRoute: Middleware 1 (authenticateToken): Verifikasi Signature & Expiration
    alt Token Valid
        AbsensiRoute->>AbsensiRoute: Tempelkan payload ke req.user
        AbsensiRoute->>AbsensiRoute: Middleware 2 (authorizeRoles("ADMIN")): Evaluasi req.user.role
        alt Role Adalah "MAHASISWA" (Bukan ADMIN)
            AbsensiRoute-->>Client: 403 Forbidden { message: "Akses terlarang: role tidak memiliki izin" }
        end
    else Token Hilang / Expired
        AbsensiRoute-->>Client: 401 Unauthorized { message: "Token tidak valid atau kedaluwarsa" }
    end
    end
```

---

## 6. KESIMPULAN
Rancangan otorisasi berbasis JWT pada Sistem Informasi Absensi Mahasiswa menjamin keandalan pencatatan presensi akademik. Mekanisme ini memastikan mahasiswa dapat mengisi absensi secara tertib, sementara integritas pengubahan dan penghapusan data presensi master tetap terlindungi di bawah wewenang Dosen, Staf, dan Administrator.

