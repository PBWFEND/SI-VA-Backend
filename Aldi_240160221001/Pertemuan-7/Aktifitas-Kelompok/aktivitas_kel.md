# AKTIVITAS KELOMPOK – PERTEMUAN 7
## Refactoring REST API dengan Pola Layering

### Identitas Kelompok

- Mata Kuliah: Praktikum Back End
- Materi: Refactoring REST API dengan Pola Layering
- Studi Kasus: REST API Absensi Organisasi

Anggota kelompok
1. Aldi restu fauzi ( 240160221001 )
2. Resa Khoerunnisa ( 240160221038 )
3.  Khoirunnisa sholeha ( 240160221018 )

---

## 1. Analisis Endpoint Lama

Pada tahap ini, dilakukan analisis terhadap struktur kode REST API dari pertemuan sebelumnya. Tujuannya adalah mengetahui bagian kode yang perlu dipisahkan agar setiap bagian memiliki tanggung jawab masing-masing.

Pada pengembangan REST API Absensi Organisasi, pembagian tanggung jawab dilakukan sebagai berikut:

| Bagian Kode | Tanggung Jawab | Lapisan Tujuan |
|---|---|---|
| Pengaturan endpoint GET, POST, PATCH, dan DELETE | Mengatur alamat dan metode HTTP | Routes |
| Penerimaan request dan pengiriman response | Mengatur komunikasi dengan pengguna | Controller |
| Validasi input data absensi | Memastikan data sesuai ketentuan | Controller |
| Proses tambah data absensi | Menjalankan penyimpanan data | Service |
| Proses menampilkan data absensi | Mengambil data dari database | Service |
| Proses mengubah data absensi | Memperbarui data dalam database | Service |
| Proses menghapus data absensi | Menghapus data dari database | Service |

Dengan pembagian tersebut, kode yang sebelumnya dapat tercampur dalam satu bagian aplikasi dipisahkan berdasarkan tugas dan tanggung jawabnya.

## 2. Rencana Refactoring

Pada tahap ini, disusun rencana pemisahan kode dengan menggunakan tiga lapisan utama, yaitu Routes, Controller, dan Service.

### A. Struktur Folder

Struktur folder yang digunakan dalam project adalah:

```text
tugas-5/
├── prisma/
│   ├── generated/
│   ├── migrations/
│   └── schema.prisma
├── src/
│   ├── routes/
│   │   └── absensi.routes.js
│   ├── controller/
│   │   └── absensi.controller.js
│   └── service/
│       └── absensi.service.js
├── app.js
├── client.js
├── server.js
├── prisma.config.ts
├── package.json
├── .env
├── README.md
└── aktivitas_kel.md
```

### B. Pembagian Tugas Setiap Lapisan

**1. Routes (`absensi.routes.js`)**

Digunakan untuk mengatur endpoint API dan menghubungkan setiap request dengan controller yang sesuai.

Endpoint yang dikelola:
- GET `/absensi`
- GET `/absensi/:id`
- POST `/absensi`
- PATCH `/absensi/:id`
- DELETE `/absensi/:id`

**2. Controller (`absensi.controller.js`)**

Bertugas menerima request dari pengguna, melakukan validasi input, memanggil fungsi service, dan memberikan response sesuai hasil proses.

**3. Service (`absensi.service.js`)**

Bertugas menjalankan proses utama pengolahan data absensi menggunakan Prisma ORM yang terhubung dengan database SQLite.

Fungsi yang dibuat meliputi:
- `ambilSemuaAbsensi()`
- `ambilAbsensiById()`
- `buatAbsensi()`
- `ubahAbsensi()`
- `hapusAbsensi()`

## 3. Hasil Refactoring

Setelah rencana disusun, proses refactoring dilakukan dengan memisahkan kode REST API Absensi Organisasi ke dalam tiga lapisan.

Hasil pembagian kode adalah sebagai berikut:

| Lapisan | File | Hasil Pekerjaan |
|---|---|---|
| Routes | `absensi.routes.js` | Mengatur seluruh endpoint CRUD absensi |
| Controller | `absensi.controller.js` | Mengatur request, validasi, dan response |
| Service | `absensi.service.js` | Mengelola proses CRUD menggunakan Prisma |

### Alur Kerja Sistem

Ketika pengguna mengirimkan request untuk menambahkan data absensi, proses yang terjadi adalah:

1. Pengguna mengirimkan request melalui Postman.
2. Routes menerima request dan meneruskannya ke controller.
3. Controller memeriksa dan memvalidasi data yang dikirimkan.
4. Controller memanggil fungsi pada service.
5. Service menjalankan proses penyimpanan data menggunakan Prisma.
6. Database SQLite menyimpan data absensi.
7. Hasil proses dikembalikan melalui controller sebagai response kepada pengguna.

Gambaran alur sistem:

```text
Pengguna / Postman
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
    Prisma ORM
        |
        v
   Database SQLite
```

### Pengujian Endpoint

Setelah proses refactoring selesai, dilakukan pengujian menggunakan Postman untuk memastikan setiap endpoint dapat berjalan dengan baik.

| No. | Method | Endpoint | Fungsi | Hasil yang Diharapkan |
|---|---|---|---|---|
| 1 | GET | `/absensi` | Menampilkan semua data | 200 OK |
| 2 | POST | `/absensi` | Menambahkan data | 201 Created |
| 3 | GET | `/absensi/:id` | Menampilkan detail data | 200 OK |
| 4 | PATCH | `/absensi/:id` | Mengubah data | 200 OK |
| 5 | DELETE | `/absensi/:id` | Menghapus data | 204 No Content |

Selain pengujian CRUD, dilakukan juga pengujian validasi input dan penanganan kesalahan untuk memastikan API dapat memberikan response yang sesuai ketika terjadi kesalahan.

## 4. Presentasi dan Alasan Pemilihan Layering

Pada pengembangan REST API Absensi Organisasi, digunakan pola layering yang terdiri dari Routes, Controller, dan Service.

Alasan pemilihan pola tersebut adalah:

1. **Memudahkan pengelolaan kode.** Setiap file memiliki tugas yang berbeda sehingga kode lebih terstruktur.
2. **Mempermudah perbaikan.** Jika terdapat kesalahan pada proses tertentu, pengembang dapat memeriksa lapisan yang berkaitan tanpa harus mengubah seluruh kode.
3. **Memudahkan pengembangan sistem.** Penambahan fitur baru dapat dilakukan dengan lebih teratur.
4. **Memisahkan tanggung jawab.** Routes mengatur endpoint, Controller mengatur request dan response, sedangkan Service mengelola proses bisnis dan data.

Pemilihan nama file menggunakan kata `absensi` bertujuan agar setiap file mudah dikenali sebagai bagian dari pengelolaan data absensi organisasi.

## 5. Kesimpulan

Berdasarkan aktivitas yang telah dilakukan, refactoring REST API Absensi Organisasi menghasilkan struktur kode yang lebih terorganisasi dengan menggunakan pola layering.

Pemisahan Routes, Controller, dan Service membuat setiap bagian aplikasi memiliki tanggung jawab yang jelas. Selain itu, fitur CRUD dapat dijalankan melalui endpoint yang telah dibuat dan diuji menggunakan Postman.

Dengan menerapkan pola layering, REST API menjadi lebih mudah dipahami, dikembangkan, dan dipelihara.