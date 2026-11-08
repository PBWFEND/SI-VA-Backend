/**
 * Pertemuan 5 — latihan desain RESTful API (Mahasiswa)
 * Jalankan: node latihan.js
 */

import express from "express";

const app = express();
app.disable("x-powered-by");
app.use(express.json());

// 1. Middleware Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Data Sementara (In-Memory Data)
let mahasiswa = [
  { nim: "240160221041", nama: "Rissa", prodi: "Sistem Informasi", angkatan: 2024 },
  { nim: "230160221067", nama: "Dita", prodi: "Sistem Informasi", angkatan: 2023 },
];

// Helper Response Berhasil
const responseData = (response, statusCode, message, data) => 
  response.status(statusCode).json({
    success: true,
    message,
    data,
  });

// 3. GET /mahasiswa (Termasuk Filter Query ?prodi=... & ?angkatan=...)
app.get("/mahasiswa", (request, response) => {
  const { prodi, angkatan } = request.query;
  const data = mahasiswa.filter((item) => {
    const cocokProdi = prodi === undefined || item.prodi.toLowerCase() === String(prodi).toLowerCase();
    const cocokAngkatan = angkatan === undefined || item.angkatan === Number(angkatan);
    return cocokProdi && cocokAngkatan;
  });

  return responseData(response, 200, "Data mahasiswa berhasil diambil", data);
});

// 2. GET /mahasiswa/:nim (Detail dengan Response 404 jika tidak ditemukan)
app.get("/mahasiswa/:nim", (request, response) => {
  const item = mahasiswa.find(({ nim }) => nim === request.params.nim);
  if (!item) {
    return response.status(404).json({ success: false, message: "Mahasiswa tidak ditemukan" });
  }
  return responseData(response, 200, "Detail mahasiswa berhasil diambil", item);
});

// 4. POST /mahasiswa (Tambah Mahasiswa + Validasi Input 400 & Response 201)
app.post("/mahasiswa", (request, response) => {
  const { nim, nama, prodi, angkatan } = request.body;

  // Validasi Kelengkapan Field
  if (!nim || !nama || !prodi || !angkatan) {
    return response.status(400).json({ 
      success: false, 
      message: "Atribut nim, nama, prodi, dan angkatan wajib diisi" 
    });
  }

  // Cek jika NIM Sudah Terdaftar
  const mhsAda = mahasiswa.some((m) => m.nim === nim);
  if (mhsAda) {
    return response.status(400).json({ 
      success: false, 
      message: "Mahasiswa dengan NIM tersebut sudah ada" 
    });
  }

  const mhsBaru = { nim, nama, prodi, angkatan: Number(angkatan) };
  mahasiswa.push(mhsBaru);

  return responseData(response, 201, "Mahasiswa berhasil ditambahkan", mhsBaru);
});

// 5. PATCH /mahasiswa/:nim (Ubah Sebagian Data Mahasiswa)
app.patch("/mahasiswa/:nim", (request, response) => {
  const { nim } = request.params;
  const index = mahasiswa.findIndex((m) => m.nim === nim);

  if (index === -1) {
    return response.status(404).json({ success: false, message: "Mahasiswa tidak ditemukan" });
  }

  const { nama, prodi, angkatan } = request.body;

  // Update atribut yang dikirimkan saja
  if (nama !== undefined) mahasiswa[index].nama = nama;
  if (prodi !== undefined) mahasiswa[index].prodi = prodi;
  if (angkatan !== undefined) mahasiswa[index].angkatan = Number(angkatan);

  return responseData(response, 200, "Data mahasiswa berhasil diperbarui", mahasiswa[index]);
});

// 6. DELETE /mahasiswa/:nim (Pengujian Response Status 204 No Content)
app.delete("/mahasiswa/:nim", (request, response) => {
  const { nim } = request.params;
  const index = mahasiswa.findIndex((m) => m.nim === nim);

  if (index === -1) {
    return response.status(404).json({ success: false, message: "Mahasiswa tidak ditemukan" });
  }

  mahasiswa.splice(index, 1);
  return response.status(204).send();
});

// Handler 404 Route Tidak Ditemukan
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Endpoint tidak ditemukan" });
});

app.listen(3007, () => {
  console.log("Latihan REST API berjalan di http://localhost:3007");
});