# Dokumentasi Praktikum Pertemuan 8 — Backend Web Development

## Identitas Mahasiswa
- **Nama:** Sarah Azkiya
- **NIM:** 240160221057
- **Kelas / Angkatan:** SI-VA / 2024
- **Mata Kuliah:** Pemrograman Berbasis Web Back End
- **Studi Kasus:** Sistem Informasi Perpustakaan (Katalog Buku & Keanggotaan Anggota)
- **Kelompok:** Kelompok 6
  1. Raihan Anugrah Pratama (240160221036)
  2. Yosep Adipura Herdi (240160221048)
  3. Sarah Azkiya (240160221057)

---

## Ringkasan Struktur Pertemuan 8

Seluruh komponen tugas pada Pertemuan 8 telah diselesaikan secara lengkap:

```text
Pertemuan-8/
├── README.md                           # Dokumentasi ringkasan Pertemuan 8
├── aktivitas-kelompok.md               # Tautan dokumen aktivitas kelompok
├── aktivitas-kelompok/
│   └── aktivitas-kelompok.md           # §9 Aktivitas Kelompok (Evaluasi Arsitektur Kelompok 6)
├── latihan-individu/
│   ├── .env                            # Environment latihan individu
│   ├── .env.example                    # Template environment
│   ├── latihan.ts                      # §10 Latihan Individu (Validasi domain & boundary check)
│   ├── test-runner.ts                  # Test runner otomatis latihan individu (12 tests)
│   └── README.md                       # Dokumentasi latihan individu
└── uts/
    └── 240160221057-sarahazkiya/       # §13 Output Pembelajaran — UTS Mini Project
        ├── app.ts                      # Express app & centralized error handler
        ├── server.ts                   # Entry point server
        ├── client.ts                   # Inisialisasi Prisma Client & SQLite adapter
        ├── package.json                # Dependensi proyek
        ├── tsconfig.json               # Konfigurasi TypeScript
        ├── test-runner.ts              # Test suite otomatis UTS (33 tests)
        ├── README.md                   # Dokumentasi teknis UTS Mini Project
        ├── ss/                         # Bukti screenshot pengujian API
        ├── prisma/
        │   ├── schema.prisma           # Skema model Buku & Anggota
        │   ├── dev.db                  # Database SQLite
        │   └── migrations/             # Migration SQL database
        └── src/
            ├── routes/                 # buku.routes.ts, anggota.routes.ts
            ├── controller/             # buku.controller.ts, anggota.controller.ts
            └── service/                # buku.service.ts, anggota.service.ts
```

---

## Rekapitulasi Pengujian

1. **§9 Aktivitas Kelompok:**
   - Evaluasi menyeluruh arsitektur 3-tier, integrasi resource Buku & Anggota, audit RESTful API, dan pembagian peran Kelompok 6.
2. **§10 Latihan Individu:**
   - Pengujian 12 skenario validasi data, pembersihan string, batasan tahun/stok, dan error handling `NotFoundError` / `ConflictError`.
   - **Hasil: 12 lolos, 0 gagal (100% Pass).**
3. **§13 UTS Mini Project:**
   - Pengujian 33 skenario end-to-end endpoint API root, health check, CRUD resource Buku, dan CRUD resource Anggota.
   - **Hasil: 33 lolos, 0 gagal (100% Pass).**
   - **TypeScript Typecheck (`tsc --noEmit`): 0 error.**

