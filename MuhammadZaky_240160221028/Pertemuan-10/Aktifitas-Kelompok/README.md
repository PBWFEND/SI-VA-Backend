# AKTIFITAS KELOMPOK — PERTEMUAN 10
## PERANCANGAN SISTEM AUTHORIZATION DAN JSON WEB TOKEN (JWT)

---

### IDENTITAS KELOMPOK
- **Kelompok:** 2 (Dua)
- **Kelas:** SI-VA
- **Mata Kuliah:** Pemrograman Backend Web Framework
- **Studi Kasus:** Sistem Informasi Akademik / Manajemen Data Mahasiswa
- **Anggota Kelompok:**
  - Muhammad Zaky
  - Alya Ayu Meysha
  - Sandika Yusuf Permana
  - Imam Abdillah Aulia

---

## 1. PENDAHULUAN & STUDI KASUS DOMAIN
Sistem Informasi Akademik mengelola data civitas akademika yang melibatkan beragam entitas pengguna dengan tingkat otoritas yang berbeda. Pada Pertemuan 9, sistem telah memiliki lapisan autentikasi untuk membuktikan keaslian identitas pengguna (*Who are you?*). Pada Pertemuan 10 ini, kelompok merancang lapisan otorisasi (*What are you allowed to do?*) menggunakan standar *JSON Web Token* (JWT) berbasis RFC 7519.

Dalam domain Sistem Informasi Akademik, didefinisikan 4 (empat) peran (*role*) utama:
1. **ADMIN:** Memiliki kendali penuh terhadap manajemen pengguna, konfigurasi sistem, dan penghapusan data akademik permanen.
2. **DOSEN:** Memiliki wewenang untuk melihat data mahasiswa, menambahkan mahasiswa bimbingan, dan memperbarui data nilai/akademik.
3. **STAF:** Memiliki hak operasional administratif untuk menginput dan memvalidasi kelengkapan data akademik mahasiswa, namun tidak berhak menghapus data master.
4. **MAHASISWA:** Memiliki hak akses terbatas untuk melihat profil pribadi dan data akademik umum (*read-only*), tanpa akses ke operasi modifikasi data master mahasiswa lain.

---

## 2. MATRIKS RANCANGAN ENDPOINT, KLAIM JWT, DAN KONTROL AKSES

Berikut adalah tabel rancangan endpoint API Sistem Informasi Akademik terlindungi, kebutuhan klaim pada token, batasan role, serta ekspektasi status respon HTTP:

| No | Endpoint URL | Metode HTTP | Deskripsi Fungsi | Klaim JWT Wajib | Role yang Diizinkan | Status Jika Tanpa Token / Token Rusak | Status Jika Role Tidak Sesuai |
|:--:|:---|:---:|:---|:---|:---|:---:|:---:|
| 1 | `/auth/register` | `POST` | Registrasi akun baru pengguna | *Publik* | Semua (Tanpa Login) | N/A | N/A |
| 2 | `/auth/login` | `POST` | Login & penerbitan Access Token | *Publik* | Semua (Tanpa Login) | N/A | N/A |
| 3 | `/health` | `GET` | Health check & monitoring status API | *Publik* | Semua (Tanpa Login) | N/A | N/A |
| 4 | `/auth/me` | `GET` | Mendapatkan data profil pengguna yang login | `sub`, `email`, `role` | `ADMIN`, `DOSEN`, `STAF`, `MAHASISWA` | `401 Unauthorized` | N/A (Semua role login berhak) |
| 5 | `/api/mahasiswa` | `GET` | Menampilkan seluruh daftar data mahasiswa | `sub`, `role` | `ADMIN`, `DOSEN`, `STAF`, `MAHASISWA` | `401 Unauthorized` | `403 Forbidden` |
| 6 | `/api/mahasiswa/:id` | `GET` | Menampilkan detail data mahasiswa spesifik | `sub`, `role` | `ADMIN`, `DOSEN`, `STAF`, `MAHASISWA` | `401 Unauthorized` | `403 Forbidden` |
| 7 | `/api/mahasiswa` | `POST` | Menambahkan data mahasiswa baru | `sub`, `role` | `ADMIN`, `DOSEN`, `STAF` | `401 Unauthorized` | `403 Forbidden` (Contoh: Mahasiswa) |
| 8 | `/api/mahasiswa/:id` | `PUT` | Memperbarui data mahasiswa | `sub`, `role` | `ADMIN`, `DOSEN`, `STAF` | `401 Unauthorized` | `403 Forbidden` (Contoh: Mahasiswa) |
| 9 | `/api/mahasiswa/:id` | `DELETE` | Menghapus data mahasiswa (destruktif) | `sub`, `role` | `ADMIN` | `401 Unauthorized` | `403 Forbidden` (Dosen, Staf, Mahasiswa) |
| 10 | `/api/staf/rekap` | `GET` | Menampilkan ringkasan statistik administratif | `sub`, `role` | `ADMIN`, `STAF` | `401 Unauthorized` | `403 Forbidden` (Dosen, Mahasiswa) |

---

## 3. ANALISIS PERBEDAAN KODE STATUS: 401 VS 403

Pemisahan tanggung jawab kode status HTTP sangat krusial dalam arsitektur API RESTful:

### A. HTTP 401 Unauthorized (Masalah Autentikasi)
- **Definisi:** Klien mencoba mengakses sumber daya yang memerlukan bukti identitas, namun klien **belum login**, **tidak menyertakan token** pada header `Authorization`, format header salah (bukan `Bearer <token>`), token rusak (*tampered*), atau masa berlaku token telah habis (*expired*).
- **Pesan Respon Standar:**
  ```json
  {
    "success": false,
    "message": "Akses ditolak: Token autentikasi tidak ditemukan atau tidak valid"
  }
  ```

### B. HTTP 403 Forbidden (Masalah Otorisasi / Hak Akses)
- **Definisi:** Server telah berhasil mengenali identitas klien melalui token yang valid (autentikasi berhasil), namun pengguna tersebut **tidak memiliki hak akses (*privilege*)** yang mencukupi untuk mengeksekusi operasi tersebut.
- **Pesan Respon Standar:**
  ```json
  {
    "success": false,
    "message": "Akses terlarang: Anda tidak memiliki izin untuk mengakses resource ini"
  }
  ```

> [!IMPORTANT]
> Jangan pernah mengembalikan kode status `401` saat kegagalan disebabkan oleh perbedaan role. Pengembalian `401` akan membingungkan klien karena klien mengira tokennya hangus dan mencoba login berulang kali, padahal masalahnya terletak pada wewenang role.

---

## 4. TINJAUAN KEAMANAN & PENCEGAHAN KERENTANAN

Dalam diskusi rancangan kelompok, diidentifikasi potensi bahaya implementasi token dan langkah mitigasinya:

1. **Bahaya Endpoint Terbuka Tanpa Middleware:**
   - *Risiko:* Jika rute `POST /api/mahasiswa` atau `DELETE /api/mahasiswa/:id` tidak dipasangi middleware `authenticateToken`, penyerang anonim dapat memodifikasi atau menghapus seluruh basis data akademik.
   - *Mitigasi:* Seluruh rute data bisnis wajib secara eksplisit dirantai (*chained*) dengan middleware `authenticateToken` dan `authorizeRoles(...)`.
2. **Kebocoran Data Sensitif pada Payload JWT:**
   - *Risiko:* Menaruh data sensitif seperti `passwordHash`, salt, nomor identitas kependudukan, atau token rahasia ke dalam payload JWT. Perlu dipahami bahwa payload JWT hanya disandikan dengan Base64Url (*encoded*), **bukan dienkripsi**. Siapa pun yang mencegat token dapat mendekode payload secara instan.
   - *Mitigasi:* Payload JWT hanya diisi klaim minimum yang esensial untuk otorisasi: `sub` (ID akun), `email`, `role`, dan `nim`.
3. **Masa Berlaku Token (*Token Expiration*):**
   - *Risiko:* Token tanpa klaim `exp` atau dengan masa berlaku terlalu lama (misal: 30 hari) berisiko fatal jika token dicuri oleh pihak ketiga (misalnya melalui XSS pada client).
   - *Mitigasi:* Access token dikonfigurasi dengan masa berlaku singkat (misal: 15 menit hingga 1 jam), dan secret kunci verifikasi wajib dibaca dari *environment variables* (`JWT_SECRET`), bukan di-hardcode ke dalam kode sumber.

---

## 5. DIAGRAM ALUR AUTENTIKASI DAN OTORISASI (MERMAID)

Berikut alur interaksi menyeluruh antara Pengguna, Klien, Server API Express, dan Basis Data:

```mermaid
sequenceDiagram
    autonumber
    actor Pengguna
    participant Client as Klien Frontend / HTTP
    participant AuthRouter as Auth Controller & Service
    participant ProtectedRoute as Protected Middleware & Routes
    participant DB as Basis Data (SQLite / Prisma)

    %% Skenario 1: Login
    rect rgb(240, 248, 255)
    Note over Pengguna, DB: Fase 1: Autentikasi & Penerbitan Token
    Pengguna->>Client: Input Email & Password
    Client->>AuthRouter: POST /auth/login { email, password }
    AuthRouter->>DB: Cari Pengguna berdasarkan Email
    DB-->>AuthRouter: Kembalikan Data Pengguna (termasuk passwordHash & role)
    AuthRouter->>AuthRouter: Verifikasi Hash Password (scrypt + timingSafeEqual)
    alt Password Benar
        AuthRouter->>AuthRouter: Terbitkan JWT Access Token (payload: sub, email, role, nim; expiresIn: 15m)
        AuthRouter-->>Client: 200 OK { token, expiresIn, data }
    else Password Salah
        AuthRouter-->>Client: 401 Unauthorized { message: "Email atau kata sandi salah" }
    end
    end

    %% Skenario 2: Akses Endpoint Terlindungi
    rect rgb(245, 255, 245)
    Note over Pengguna, DB: Fase 2: Otorisasi & Akses Sumber Daya Terlindungi
    Client->>ProtectedRoute: DELETE /api/mahasiswa/1 (Header: Authorization: Bearer <token>)
    ProtectedRoute->>ProtectedRoute: Middleware 1 (authenticateToken): Periksa Header & Verifikasi JWT Signature
    alt Token Tidak Ada / Rusak / Expired
        ProtectedRoute-->>Client: 401 Unauthorized { message: "Token tidak valid atau kedaluwarsa" }
    else Token Valid
        ProtectedRoute->>ProtectedRoute: Tempelkan payload ke req.user
        ProtectedRoute->>ProtectedRoute: Middleware 2 (authorizeRoles("ADMIN")): Periksa req.user.role
        alt Role Bukan ADMIN (Contoh: MAHASISWA / DOSEN)
            ProtectedRoute-->>Client: 403 Forbidden { message: "Akses terlarang: role tidak diizinkan" }
        else Role Sesuai (ADMIN)
            ProtectedRoute->>DB: Eksekusi Operasi Hapus Mahasiswa
            DB-->>ProtectedRoute: Konfirmasi Berhasil
            ProtectedRoute-->>Client: 200 OK { message: "Data mahasiswa berhasil dihapus" }
        end
    end
    end
```

---

## 6. KESIMPULAN
Penerapan mekanisme otorisasi berbasis JWT melengkapi arsitektur keamanan backend Sistem Informasi Akademik. Dengan membedakan secara tegas kondisi `401 Unauthorized` (kegagalan verifikasi identitas) dan `403 Forbidden` (pelanggaran batasan wewenang wajar), sistem dapat memberikan integritas data yang kokoh sekaligus memberikan umpan balik yang presisi kepada antarmuka pengguna.

