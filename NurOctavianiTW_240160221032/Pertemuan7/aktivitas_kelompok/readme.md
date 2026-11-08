# Aktivitas Kelompok — Pertemuan 7
## Refactoring REST API dengan Pola Arsitektur Berlapis

**Kelompok: 3**

### Anggota Kelompok

| No. | Nama |
|---:|---|
| 1 | Nur OctavianiT.W |
| 2 | Muhammad Khotim |
| 3 | Winda |

---

## 1. Deskripsi Aktivitas

Aktivitas kelompok Pertemuan 7 membahas proses refactoring REST API dari struktur sebelumnya menjadi struktur arsitektur berlapis (*Layered Architecture*) dengan menggunakan studi kasus **Sistem Informasi Perpustakaan**.

Kegiatan ini bertujuan agar kode program lebih terorganisasi dengan memisahkan tanggung jawab setiap bagian aplikasi ke dalam tiga lapisan utama, yaitu:

1. **Routes** — Mengatur endpoint dan menghubungkan permintaan HTTP dengan controller.
2. **Controller** — Menangani request dan response HTTP serta validasi input.
3. **Service** — Menangani logika bisnis dan operasi database.

Refactoring diterapkan pada REST API Sistem Informasi Perpustakaan yang digunakan untuk mengelola data buku dan anggota perpustakaan dengan bantuan Prisma ORM dan database SQLite.

## 2. Tujuan Kegiatan

- Memahami struktur REST API sebelum dan sesudah refactoring.
- Mengidentifikasi bagian kode yang perlu dipindahkan ke routes, controller, dan service.
- Menyusun struktur folder dan pembagian tanggung jawab setiap lapisan.
- Menerapkan pola arsitektur berlapis pada endpoint REST API perpustakaan.
- Memahami manfaat pemisahan tanggung jawab dalam pengembangan aplikasi backend.
- Mengelola data buku dan anggota menggunakan Prisma ORM.

## 3. Tahapan Pengerjaan

### Tahap 1 — Analisis Endpoint Lama

Melakukan pengamatan terhadap struktur REST API dari pertemuan sebelumnya.

Bagian kode dianalisis berdasarkan tanggung jawabnya untuk menentukan apakah perlu dipindahkan ke:

- **Routes:** Definisi endpoint untuk data buku dan anggota.
- **Controller:** Pengolahan request, validasi input, serta response.
- **Service:** Logika bisnis dan operasi database menggunakan Prisma.

### Tahap 2 — Penyusunan Rencana Refactoring

Menyusun struktur direktori dan menentukan nama file serta fungsi yang akan digunakan pada setiap lapisan.

Rencana struktur direktori:

```text
src/
├── routes/
│   ├── buku.routes.ts
│   └── anggota.routes.ts
├── controller/
│   ├── buku.controller.ts
│   └── anggota.controller.ts
└── service/
    ├── buku.service.ts
    └── anggota.service.ts

client.ts
app.ts
server.ts
```

Keterangan:
- `routes/` berisi konfigurasi endpoint buku dan anggota.
- `controller/` berisi handler request dan response HTTP.
- `service/` berisi logika bisnis dan komunikasi dengan database.
- `client.ts` digunakan untuk menginisialisasi PrismaClient.
- `app.ts` digunakan untuk konfigurasi middleware dan pendaftaran routes.
- `server.ts` digunakan untuk menjalankan server aplikasi.

### Tahap 3 — Pelaksanaan Refactoring

Melakukan refactoring berdasarkan struktur yang telah direncanakan dengan menggunakan kerangka proyek Pertemuan 7.

Proses refactoring dilakukan dengan memisahkan kode berdasarkan tanggung jawab masing-masing lapisan.

Pada Sistem Informasi Perpustakaan, pemisahan dilakukan untuk pengelolaan data buku dan anggota. Proses pengolahan data database dilakukan melalui service menggunakan Prisma ORM, sedangkan controller menangani request, validasi, dan response HTTP.

### Tahap 4 — Presentasi

Mempresentasikan hasil analisis dan rencana refactoring kepada kelas.

Materi presentasi mencakup:
- Struktur kode sebelum dan sesudah refactoring.
- Pembagian tanggung jawab routes, controller, dan service.
- Alur request dari client hingga database.
- Penerapan arsitektur berlapis pada REST API perpustakaan.
- Alasan teknis penggunaan arsitektur berlapis.

## 4. Alur Arsitektur Berlapis

Alur komunikasi aplikasi setelah menggunakan pola arsitektur berlapis:

```text
Client / Postman
       |
       v
    app.ts
       |
       v
    Routes
       |
       v
  Controller
       |
       v
   Service
       |
       v
 Prisma Client
       |
       v
SQLite Database
```

Setiap lapisan memiliki tanggung jawab tersendiri sehingga proses penerimaan request, pengolahan data, dan akses database tidak tercampur.

## 5. Pembagian Tanggung Jawab Lapisan

| Lapisan | Tanggung Jawab |
|---|---|
| Routes | Mendefinisikan endpoint buku dan anggota serta mengarahkan request ke controller. |
| Controller | Mengelola request, validasi input, dan response HTTP. |
| Service | Menangani logika bisnis dan operasi database menggunakan Prisma. |
| Prisma Client | Menjadi penghubung antara service dan database SQLite. |

## 6. Alasan Menggunakan Layered Architecture

Pola arsitektur berlapis digunakan karena memberikan beberapa keuntungan:

1. **Pemisahan tanggung jawab:** Setiap file memiliki fungsi yang lebih spesifik.
2. **Kemudahan pemeliharaan:** Perubahan pada satu bagian tidak harus mengubah seluruh aplikasi.
3. **Kemudahan pengujian:** Routes, controller, dan service dapat diperiksa berdasarkan tanggung jawabnya.
4. **Penggunaan ulang kode:** Fungsi service dapat digunakan kembali jika diperlukan.
5. **Struktur lebih terorganisasi:** Kode lebih mudah dibaca dan dikembangkan bersama anggota kelompok.
6. **Pengelolaan database lebih terstruktur:** Prisma membantu proses pengambilan, penambahan, perubahan, dan penghapusan data buku maupun anggota.

## 7. Kesimpulan

Melalui Aktivitas Kelompok Pertemuan 7, kelompok mempelajari proses refactoring REST API menggunakan pola arsitektur berlapis dengan studi kasus Sistem Informasi Perpustakaan.

Pemisahan routes, controller, dan service membantu membangun struktur aplikasi backend yang lebih terorganisasi. Pada project ini, pola tersebut diterapkan untuk mengelola data buku dan anggota perpustakaan dengan menggunakan Prisma ORM dan SQLite.

Dengan penerapan pola ini, setiap bagian aplikasi memiliki tanggung jawab yang jelas sehingga kode program lebih mudah dipahami, diuji, dikembangkan, dan dipelihara.