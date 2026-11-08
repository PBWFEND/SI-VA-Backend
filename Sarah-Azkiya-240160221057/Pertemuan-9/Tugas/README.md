# Dokumentasi Praktikum Pertemuan 9 — Authentication Backend

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

## 1. Ringkasan Pelaksanaan Pertemuan 9

Pada Pertemuan 9, topik pembelajaran berfokus pada **Authentication: Register, Login, dan Password Hashing**. Seluruh instruksi resmi telah diselesaikan secara lengkap:

```text
Pertemuan-9/
├── README.md                      # Dokumentasi ringkasan induk Pertemuan 9
├── node_modules/                  # Dependensi modul (diabaikan git)
├── tugas-kelompok/
│   └── aktivitas-kelompok.md      # §18 Aktivitas Kelompok (Desain & Security Review)
├── aktivitas-kelompok/
│   └── aktivitas-kelompok.md      # Tautan cepat aktivitas kelompok
├── latihan-individu/              # §19 Latihan Individu
│   ├── .env                       # Environment database SQLite
│   ├── .env.example               # Template environment
│   ├── latihan.ts                 # Modul latihan autentikasi mandiri (NIM unik, scrypt)
│   ├── test-runner.ts             # Test runner otomatis 12 skenario pengujian
│   └── README.md                  # Dokumentasi penjelasan hash & Mermaid sequence diagram
└── tugas-authentication/          # §22 Output Pembelajaran — Tugas Authentication
    ├── .env                       # Environment koneksi SQLite
    ├── .env.example               # Template environment
    ├── .gitignore                 # Konfigurasi file yang diabaikan Git
    ├── package.json               # Konfigurasi paket & skrip
    ├── tsconfig.json              # Konfigurasi TypeScript
    ├── app.ts                     # Inisialisasi Express & error handler terpusat
    ├── server.ts                  # Entry point server HTTP
    ├── client.ts                  # Inisialisasi Prisma Client SQLite
    ├── test-runner.ts             # Test suite otomatis (26 skenario)
    ├── README.md                  # Dokumentasi teknis endpoint & cURL
    └── src/
        ├── routes/
        │   └── auth.routes.ts     # Pemetaan POST /register & POST /login
        ├── controller/
        │   └── auth.controller.ts # Validasi input request & HTTP status
        └── service/
            └── auth.service.ts    # Hashing scrypt, timing-safe & Prisma query
```

Selain modul mandiri di atas, modul autentikasi ini juga telah diintegrasikan secara penuh ke dalam mini project Pertemuan 8:
`Sarah-Azkiya-240160221057/Pertemuan-8/uts/240160221057-sarahazkiya/`

---

## 2. Rekapitulasi Komponen & Hasil Pengujian

| Komponen | Lokasi File | Status | Pengujian & Keterangan |
|---|---|---|---|
| **§18 Aktivitas Kelompok** | `tugas-kelompok/aktivitas-kelompok.md` & `aktivitas-kelompok/aktivitas-kelompok.md` | **SELESAI** | Tabel register, login, security review (bahaya plaintext, unique constraint, generic error message, perbedaan authn vs authz). |
| **§19 Latihan Individu** | `latihan-individu/` (`latihan.ts`, `test-runner.ts`, `README.md`) | **SELESAI** | Validasi NIM unik (8-15 digit), penolakan duplikasi, penjelasan larangan passwordHash pada response, sequence diagram Mermaid. **12/12 tests passed (100%)**. |
| **§22 Tugas Authentication** | `tugas-authentication/` & mini project P8 | **SELESAI** | Implementasi endpoint `POST /auth/register` dan `POST /auth/login` dengan hashing `scrypt`, timing-safe verification, sanitasi response. **26/26 tests passed (100%)**. |
| **Integrasi Mini Project P8** | `Pertemuan-8/uts/240160221057-sarahazkiya/` | **SELESAI** | Seluruh resource Buku, Anggota, dan Auth terintegrasi. **56/56 tests passed (100%)**, `tsc --noEmit` 0 error. |

---

## 3. Kepatuhan Batasan & Keamanan

1. **Password Hashing:** Menggunakan fungsi KDF `scrypt` dari `node:crypto` dengan format `scrypt$<salt-hex>$<derived-key-hex>`. Plaintext password tidak pernah tersimpan di database SQLite.
2. **Timing Attack Protection:** Verifikasi membandingkan derived key menggunakan `crypto.timingSafeEqual` setelah memastikan kesamaan panjang buffer.
3. **Information Disclosure Prevention:** Kegagalan login karena email tidak ditemukan dan password salah mengembalikan pesan generik yang sama (`"Email atau password salah"`) dengan status `401 Unauthorized`.
4. **No JWT / Authorization:** Sesuai instruksi resmi materi Pertemuan 9, token JWT dan middleware role tidak diterapkan (materi Pertemuan 10).
5. **Integritas Scope:** Hanya folder `Sarah-Azkiya-240160221057/` yang dikerjakan. Tidak ada file mahasiswa lain yang disentuh.
6. **Git Safety:** Tidak ada operasi `git add`, `git commit`, atau `git push` yang dijalankan.

