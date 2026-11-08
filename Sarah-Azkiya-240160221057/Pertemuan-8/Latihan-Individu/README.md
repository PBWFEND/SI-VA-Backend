# Latihan Individu — Pertemuan 8

**Mahasiswa:** Sarah Azkiya  
**NIM:** 240160221057  
**Mata Kuliah:** Pemrograman Berbasis Web Back End  
**Studi Kasus:** Sistem Informasi Perpustakaan (Resource Buku & Anggota)

---

## 1. Deskripsi Latihan Individu

Latihan Individu pada Pertemuan 8 berfokus pada pengujian unit mandiri dan audit integritas domain aplikasi backend:
1. **Validasi Input & Batasan Nilai (Boundary Testing):**
   - Validasi nilai teks kosong (`judul`, `penulis`, `nama`, `nim`, `jurusan`).
   - Validasi batasan tahun terbit buku (`1000 <= tahun <= 2100`).
   - Validasi stok non-negatif (`stok >= 0`).
2. **Pemetaan Kode Status HTTP & Domain Error:**
   - Penerapan `400 Bad Request` pada kegagalan validasi DTO.
   - Penerapan `404 Not Found` melalui lemparan `NotFoundError` saat data ID tidak ditemukan di SQLite.
   - Penerapan `409 Conflict` melalui lemparan `ConflictError` saat terjadi duplikasi NIM anggota unik.
3. **Pengujian Integrasi Database SQLite via Prisma ORM:**
   - Memastikan koneksi database dan query CRUD berjalan konsisten dan aman.

---

## 2. Struktur File Latihan Individu

```text
latihan-individu/
├── latihan.ts          # Modul validasi dan service wrapper mandiri
├── test-runner.ts      # Test suite otomatis (12 skenario pengujian)
└── README.md           # Dokumentasi latihan individu
```

---

## 3. Cara Menjalankan Pengujian

Jalankan perintah berikut di terminal:

```bash
cd Sarah-Azkiya-240160221057/Pertemuan-8/latihan-individu
node --experimental-strip-types test-runner.ts
```

---

## 4. Hasil Pengujian

Semua 12 skenario pengujian unit dan integrasi lolos 100%:
- Validasi field wajib dan tipe data
- Pembersihan whitespace (`.trim()`)
- Penanganan custom error `NotFoundError` (404) dan `ConflictError` (409)
- Eksekusi query SQLite via Prisma Client

