# Aktivitas Kelompok — Pertemuan 7
## Refactoring REST API dengan Pola Arsitektur Berlapis

**Kelompok: 2**

### Anggota Kelompok

| No. | Nama |
|---:|---|
| 1 | Muhammad Zaky |
| 2 | Alya Ayu Meysha |
| 3 | Sandika Yusuf Permana |
| 4 | Imam Abdillah Aulia |

---

## 1. Deskripsi Aktivitas

Aktivitas kelompok Pertemuan 7 membahas proses refactoring REST API dari struktur sebelumnya menjadi struktur arsitektur berlapis (*Layered Architecture*).

Kegiatan ini bertujuan agar kode program lebih terorganisasi dengan memisahkan tanggung jawab setiap bagian aplikasi ke dalam tiga lapisan utama, yaitu:

1. **Routes** — Mengatur endpoint dan menghubungkan permintaan HTTP dengan controller.
2. **Controller** — Menangani request dan response HTTP serta validasi input.
3. **Service** — Menangani logika bisnis dan operasi database.

Refactoring dilakukan dengan mengacu pada implementasi `app.ts` dari Pertemuan 6 dan kerangka proyek Pertemuan 7.

## 2. Tujuan Kegiatan

- Memahami struktur REST API sebelum dan sesudah refactoring.
- Mengidentifikasi bagian kode yang perlu dipindahkan ke routes, controller, dan service.
- Menyusun struktur folder dan pembagian tanggung jawab setiap lapisan.
- Menerapkan pola arsitektur berlapis pada endpoint REST API.
- Memahami manfaat pemisahan tanggung jawab dalam pengembangan aplikasi backend.

## 3. Tahapan Pengerjaan

### Tahap 1 — Analisis Endpoint Lama

Melakukan pengamatan terhadap file `app.ts` dari Pertemuan 6.

Bagian kode dianalisis berdasarkan tanggung jawabnya untuk menentukan apakah perlu dipindahkan ke:

- **Routes:** Definisi endpoint dan HTTP method.
- **Controller:** Pengolahan request, validasi input, serta response.
- **Service:** Logika bisnis dan operasi database.

### Tahap 2 — Penyusunan Rencana Refactoring

Menyusun struktur direktori dan menentukan nama file serta fungsi yang akan digunakan pada setiap lapisan.

Rencana struktur direktori:

```text
src/
├── routes/
│   └── resource.routes.ts
├── controller/
│   └── resource.controller.ts
└── service/
    └── resource.service.ts

app.ts
server.ts
```

Keterangan:
- `routes/` berisi konfigurasi endpoint aplikasi.
- `controller/` berisi handler request dan response HTTP.
- `service/` berisi logika bisnis dan komunikasi dengan database.
- `app.ts` digunakan untuk konfigurasi middleware dan pendaftaran routes.
- `server.ts` digunakan untuk menjalankan server aplikasi.

### Tahap 3 — Pelaksanaan Refactoring

Melakukan refactoring berdasarkan struktur yang telah direncanakan dengan mengacu pada kerangka proyek Pertemuan 7.

Proses refactoring dilakukan dengan memisahkan kode berdasarkan tanggung jawab masing-masing lapisan agar tidak seluruh proses aplikasi berada dalam satu file.

### Tahap 4 — Presentasi

Mempresentasikan hasil analisis dan rencana refactoring kepada kelas.

Materi presentasi mencakup:
- Struktur kode sebelum dan sesudah refactoring.
- Pembagian tanggung jawab routes, controller, dan service.
- Alur request dari client hingga database.
- Alasan teknis penggunaan arsitektur berlapis.

## 4. Alur Arsitektur Berlapis

Alur komunikasi aplikasi setelah menggunakan pola arsitektur berlapis:

```text
Client
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
Database
```

Setiap lapisan memiliki tanggung jawab tersendiri sehingga proses penerimaan request, pengolahan data, dan akses database tidak tercampur.

## 5. Pembagian Tanggung Jawab Lapisan

| Lapisan | Tanggung Jawab |
|---|---|
| Routes | Mendefinisikan endpoint dan mengarahkan request ke controller. |
| Controller | Mengelola request, validasi input, dan response HTTP. |
| Service | Menangani logika bisnis dan operasi database. |
| Prisma Client | Menjadi penghubung antara service dan database. |

## 6. Alasan Menggunakan Layered Architecture

Pola arsitektur berlapis digunakan karena memberikan beberapa keuntungan:

1. **Pemisahan tanggung jawab:** Setiap file memiliki fungsi yang lebih spesifik.
2. **Kemudahan pemeliharaan:** Perubahan pada satu bagian tidak harus mengubah seluruh aplikasi.
3. **Kemudahan pengujian:** Routes, controller, dan service dapat diperiksa berdasarkan tanggung jawabnya.
4. **Penggunaan ulang kode:** Fungsi service dapat digunakan oleh lebih dari satu controller jika diperlukan.
5. **Struktur lebih terorganisasi:** Kode lebih mudah dibaca dan dikembangkan bersama anggota kelompok.

## 7. Kesimpulan

Melalui Aktivitas Kelompok Pertemuan 7, kelompok mempelajari proses refactoring REST API menggunakan pola arsitektur berlapis.

Pemisahan routes, controller, dan service membantu membangun struktur aplikasi backend yang lebih terorganisasi, mudah dipahami, serta lebih mudah dikembangkan dan dipelihara.

Dengan penerapan pola ini, setiap bagian aplikasi memiliki tanggung jawab yang jelas sehingga pengelolaan kode menjadi lebih terstruktur.