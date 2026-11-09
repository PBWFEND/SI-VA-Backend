# Praktikum Pertemuan 10 — JWT dan Authorization Backend

## Identitas Mahasiswa
- **Nama:** Sarah Azkiya
- **NIM:** 240160221057
- **Kelas / Angkatan:** SI-VA / 2024
- **Mata Kuliah:** Pemrograman Berbasis Web Back End
- **Studi Kasus:** Sistem Informasi Perpustakaan
- **Kelompok:** Kelompok 6
  1. Raihan Anugrah Pratama (240160221036)
  2. Yosep Adipura Herdi (240160221048)
  3. Sarah Azkiya (240160221057)

---

## 1. Ringkasan Pelaksanaan Pertemuan 10

Pada Pertemuan 10, topik pembelajaran berfokus pada **JWT (JSON Web Token) dan Role-Based Authorization**. Seluruh instruksi resmi telah diselesaikan secara lengkap dan terstruktur:

```text
Pertemuan-10/
├── README.md                          # Dokumentasi ringkasan induk Pertemuan 10
├── .gitignore                         # Mengabaikan node_modules, .env, dev.db
├── Aktivitas-Kelompok/
│   └── aktivitas-kelompok.md          # §18 Aktivitas Kelompok (Matriks Protected Endpoints & Security Review)
├── Latihan-Individu/                  # §19 Latihan Individu
│   ├── .env                           # Konfigurasi JWT & Database
│   ├── .env.example                   # Template environment
│   ├── latihan.ts                     # Modul mandiri (Role staf, token, exp check)
│   ├── test-runner.ts                 # Test runner mandiri (12 skenario pengujian)
│   └── README.md                      # Dokumentasi konsep exp & analisis token 15m vs 24h
└── Tugas/                             # §22 Output Pembelajaran — Tugas JWT & Authorization
    ├── .env                           # Environment JWT_SECRET & DATABASE_URL
    ├── .env.example                   # Template environment
    ├── .gitignore                     # Aturan ignore git
    ├── package.json                   # Dependensi Express, Prisma, jsonwebtoken
    ├── tsconfig.json                  # Konfigurasi TypeScript
    ├── app.ts                         # Inisialisasi Express & routing terlindungi
    ├── server.ts                      # Entry point server
    ├── client.ts                      # Koneksi Prisma Client SQLite
    ├── test-runner.ts                 # Test runner otomatis tugas P10 (21 skenario)
    ├── README.md                      # Dokumentasi teknis endpoint & cURL
    └── src/
        ├── routes/                    # auth.routes.ts, protected.routes.ts
        ├── middleware/                # auth.middleware.ts (autentikasiWajib & periksaRole)
        ├── controller/                # auth.controller.ts, protected.controller.ts
        └── service/                   # auth.service.ts, jwt.service.ts
```

Selain modul mandiri di atas, modul autentikasi JWT dan middleware otorisasi ini juga telah diintegrasikan secara penuh ke dalam mini project utama Sarah:
`Sarah-Azkiya-240160221057/Pertemuan-8/uts/240160221057-sarahazkiya/`

---

## 2. Rekapitulasi Komponen & Hasil Pengujian

| Komponen | Lokasi File | Status | Pengujian & Keterangan |
|---|---|---|---|
| **§18 Aktivitas Kelompok** | `Aktivitas-Kelompok/aktivitas-kelompok.md` | **SELESAI** | Matriks protected endpoints, evaluasi 401 vs 403, analisis risiko data sensitif pada JWT, diagram sequence Mermaid. |
| **§19 Latihan Individu** | `Latihan-Individu/` (`latihan.ts`, `test-runner.ts`, `README.md`) | **SELESAI** | Role ketiga `staf`, proteksi registrasi publik (role rejected with 400), endpoint khusus staf, pengujian token rusak/expired/valid, analisis exp dan 15m vs 24h. **12/12 tests passed (100%)**. |
| **§22 Tugas JWT & Authorization** | `Tugas/` & mini project utama | **SELESAI** | Modul `jwt.service.ts`, middleware `autentikasiWajib` & `periksaRole`, endpoint `/protected/me`, `/protected/peminjaman`, `/protected/pengguna`. **21/21 tests passed (100%)**. |
| **Integrasi Mini Project Utama** | `Pertemuan-8/uts/240160221057-sarahazkiya/` | **SELESAI** | Seluruh resource Buku, Anggota, Auth (scrypt), dan Protected JWT terintegrasi. **75/75 tests passed (100%)**, `tsc --noEmit` 0 error. |

---

## 3. Kepatuhan Batasan & Keamanan

1. **Secret Management:** `JWT_SECRET` dikelola via environment variable, tidak di-hardcode, dan divalidasi minimal 32 karakter saat inisialisasi.
2. **Access Token Lifespan:** Menggunakan masa berlaku pendek (`JWT_EXPIRES_IN=15m`) untuk meminimalisasi *window of abuse*.
3. **Payload Sanitization:** Payload JWT hanya memuat data publik (`sub`, `nama`, `nim`, `email`, `role`, `iat`, `exp`). Password dan `passwordHash` tidak pernah masuk ke payload JWT maupun response API.
4. **Pembedaan Kode Status:**
   - Masalah token (hilang, rusak, expired, salah format) -> **`401 Unauthorized`**.
   - Masalah hak akses (token valid namun role tidak sesuai) -> **`403 Forbidden`**.
5. **Proteksi Registrasi Publik:** Client dilarang mengirimkan field `role` pada `POST /auth/register` (ditolak `400 Bad Request`). Role default adalah `mahasiswa`. Akun staf hanya dapat dibuat melalui provisioning terpercaya pada database.
6. **Integritas Scope:** Hanya folder `Sarah-Azkiya-240160221057/` yang dikerjakan. Tidak ada file mahasiswa lain yang disentuh.
7. **Git Safety:** Tidak ada perintah `git add`, `git commit`, atau `git push` yang dijalankan.

