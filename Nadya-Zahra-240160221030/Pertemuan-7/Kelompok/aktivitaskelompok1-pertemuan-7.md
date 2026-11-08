# AKTIVITAS KELOMPOK 1
# Pertemuan 7 — Refactoring REST API dengan Layering

**Mata Kuliah:** Pemrograman Berbasis Web Back End  
**Domain Sistem Informasi:** Absensi Organisasi

**Anggota Kelompok:**
1. Della Kartika
2. Nadya Zahra Aulia
3. Rico Muhammad F
4. Nabila Natasya Putri

## 1. Analisis Endpoint Lama

Analisis dilakukan terhadap kode `app.ts` dari Pertemuan 6 untuk mengidentifikasi bagian yang perlu dipisahkan ke dalam lapisan Routes, Controllers, dan Services.

Sistem Informasi Absensi Organisasi memiliki dua resource utama, yaitu Anggota dan Absensi. Analisis diarahkan pada bagian kode yang menangani endpoint, request, response, logika pengolahan data, dan akses database.

| Bagian Kode | Fungsi | Rencana Pemindahan |
|---|---|---|
| Definisi endpoint menggunakan metode HTTP | Menentukan URL dan metode request API | Routes |
| Pembacaan parameter URL dan body request | Mengambil data yang dikirim client | Controllers |
| Validasi input Anggota dan Absensi | Memeriksa data sebelum diproses | Controllers atau Services, sesuai jenis validasi |
| Logika pengolahan data Anggota | Memproses operasi data Anggota | Services |
| Logika pengolahan data Absensi | Memproses operasi data Absensi | Services |
| Pemanggilan Prisma Client | Melakukan operasi database | Services |
| Pengiriman response HTTP dan JSON | Mengembalikan hasil proses kepada client | Controllers |
| Inisialisasi Express dan pemasangan middleware | Menyiapkan aplikasi dan menghubungkan routes | `app.ts` |

## 2. Rencana Refactoring

### Struktur Folder

Struktur folder yang direncanakan untuk memisahkan tanggung jawab kode adalah:

```text
src/
├── app.ts
├── client.ts
├── routes/
│   ├── anggota.routes.ts
│   └── absensi.routes.ts
├── controllers/
│   ├── anggota.controller.ts
│   └── absensi.controller.ts
└── services/
    ├── anggota.service.ts
    └── absensi.service.ts
```

Struktur tersebut merupakan rancangan awal dan perlu disesuaikan dengan kerangka `code/pertemuan-06` yang diberikan dosen.

### Fungsi Setiap Layer

**a. Routes**

Mengatur endpoint, URL, dan metode HTTP untuk resource Anggota dan Absensi, kemudian menghubungkannya dengan controller.

**b. Controllers**

Menangani request dari client, mengambil parameter atau body yang diperlukan, memanggil service, dan mengirimkan response HTTP.

**c. Services**

Menangani logika pengolahan data Anggota dan Absensi serta operasi database menggunakan Prisma Client.

**d. App**

Menginisialisasi aplikasi Express, memasang middleware, dan mendaftarkan routes.

### Alasan Penamaan File

Nama file menggunakan nama resource agar tanggung jawab setiap file mudah dikenali. File `anggota.routes.ts` dan `absensi.routes.ts` berisi definisi endpoint masing-masing resource. File `anggota.controller.ts` dan `absensi.controller.ts` menangani request dan response, sedangkan file service menangani logika pengolahan datanya.

## 3. Rencana Refactor Bersama

Tahapan refactoring yang direncanakan berdasarkan instruksi Pertemuan 7 adalah:

1. Menyalin kerangka proyek dari folder `code/pertemuan-07`.
2. Memeriksa struktur folder dan menyesuaikannya dengan proyek Sistem Informasi Absensi Organisasi.
3. Memindahkan definisi endpoint Anggota dan Absensi ke file routes.
4. Memindahkan penanganan request dan response ke file controllers.
5. Memindahkan logika pengolahan data dan akses database ke file services.
6. Menyesuaikan `app.ts` agar menghubungkan routes dan middleware.
7. Memeriksa kembali hubungan antar-file dan import yang digunakan.

Tahapan tersebut merupakan rencana pelaksanaan. Hasil implementasi disesuaikan setelah proses refactoring dilakukan pada kode proyek.


## Kesimpulan

Kegiatan Pertemuan 7 berfokus pada analisis endpoint lama, penyusunan rencana refactoring, pemindahan endpoint ke pola layering menggunakan kerangka yang disediakan dosen, dan presentasi alasan teknis pembagian layer.

Rancangan ini ditujukan untuk Sistem Informasi Absensi Organisasi dengan resource Anggota dan Absensi. Penandaan baris kode dan hasil refactoring akhir harus disesuaikan dengan kode proyek yang benar-benar digunakan.