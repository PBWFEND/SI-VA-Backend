/**
 * Pertemuan 5 — Latihan Desain RESTful API
 * Resource: Mahasiswa
 * Jalankan: node latihan.js
 */

import express from "express";

const app = express();
app.disable("x-powered-by");
app.use(express.json());

// 1. Middleware Logger Sederhana
app.use((request, response, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${request.method} ${request.url}`);
  next();
});

let mahasiswa = [
  { nim: "240160221047", nama: "Winda Nurhidayah", prodi: "Sistem Informasi", angkatan: 2024 },
  { nim: "230160221011", nama: "Djanuar", prodi: "Sistem Informasi", angkatan: 2023 },
];

const responseData = (response, statusCode, message, data) => response.status(statusCode).json({
  success: true,
  message,
  data,
});

// GET: Koleksi dengan query filter (prodi & angkatan)
app.get("/mahasiswa", (request, response) => {
  const { prodi, angkatan } = request.query;
  const data = mahasiswa.filter((item) => {
    const cocokProdi = prodi === undefined || item.prodi.toLowerCase() === String(prodi).toLowerCase();
    const cocokAngkatan = angkatan === undefined || item.angkatan === Number(angkatan);
    return cocokProdi && cocokAngkatan;
  });

  return responseData(response, 200, "Data mahasiswa berhasil diambil", data);
});

// GET: Detail mahasiswa berdasarkan NIM
app.get("/mahasiswa/:nim", (request, response) => {
  const item = mahasiswa.find(({ nim }) => nim === request.params.nim);
  if (!item) {
    return response.status(404).json({ success: false, message: "Mahasiswa tidak ditemukan" });
  }
  return responseData(response, 200, "Detail mahasiswa berhasil diambil", item);
});

// POST: Menambah mahasiswa baru dengan validasi input (Status 201 / 400)
app.post("/mahasiswa", (request, response) => {
  const { nim, nama, prodi, angkatan } = request.body;
  const errors = [];

  if (!nim) errors.push("NIM wajib diisi");
  if (!nama) errors.push("Nama wajib diisi");
  if (!prodi) errors.push("Prodi wajib diisi");
  if (!angkatan || !Number.isInteger(angkatan)) errors.push("Angkatan wajib diisi dan berupa angka");

  // Periksa apakah NIM sudah terdaftar
  if (nim && mahasiswa.some((m) => m.nim === nim)) {
    errors.push("NIM sudah terdaftar");
  }

  if (errors.length > 0) {
    return response.status(400).json({
      success: false,
      message: "Data mahasiswa tidak valid",
      details: errors,
    });
  }

  const mahasiswaBaru = { nim, nama, prodi, angkatan };
  mahasiswa.push(mahasiswaBaru);

  return responseData(response, 201, "Mahasiswa berhasil ditambahkan", mahasiswaBaru);
});

// PATCH: Mengubah sebagian data mahasiswa berdasarkan NIM (Status 200 / 400 / 404)
app.patch("/mahasiswa/:nim", (request, response) => {
  const index = mahasiswa.findIndex(({ nim }) => nim === request.params.nim);
  if (index === -1) {
    return response.status(404).json({ success: false, message: "Mahasiswa tidak ditemukan" });
  }

  const { nama, prodi, angkatan } = request.body;
  
  if (angkatan !== undefined && !Number.isInteger(angkatan)) {
    return response.status(400).json({
      success: false,
      message: "Data tidak valid",
      details: ["Angkatan harus berupa bilangan bulat"],
    });
  }

  // Update field yang dikirim saja (Partial Update)
  if (nama !== undefined) mahasiswa[index].nama = nama;
  if (prodi !== undefined) mahasiswa[index].prodi = prodi;
  if (angkatan !== undefined) mahasiswa[index].angkatan = angkatan;

  return responseData(response, 200, "Data mahasiswa berhasil diperbarui", mahasiswa[index]);
});

// DELETE: Menghapus mahasiswa berdasarkan NIM (Status 204 / 404)
app.delete("/mahasiswa/:nim", (request, response) => {
  const index = mahasiswa.findIndex(({ nim }) => nim === request.params.nim);
  if (index === -1) {
    return response.status(404).json({ success: false, message: "Mahasiswa tidak ditemukan" });
  }

  mahasiswa.splice(index, 1);
  return response.status(204).send();
});

app.listen(3007, () => {
  console.log("Latihan REST API berjalan di http://localhost:3007");
});