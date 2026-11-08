
/**
 * Pertemuan 5 — Latihan RESTful API
 * Tujuan: menerapkan resource, filter query, status code, dan response JSON.
 * Jalankan: node latihan.js
 */

import express from "express";

const app = express();

app.disable("x-powered-by");
app.use(express.json());

// 1. Middleware logger
app.use((request, response, next) => {
  console.log(`${request.method} ${request.url}`);
  next();
});

// Data awal mahasiswa
const mahasiswa = [
  {
    nim: "240160221038",
    nama: "Resa Khoerunnisa",
    prodi: "Sistem Informasi",
    angkatan: 2024,
  },
  {
    nim: "240160221040",
    nama: "Rissa Srihandita",
    prodi: "Sistem Informasi",
    angkatan: 2023,
  },
];

// Format response berhasil
const responseData = (response, statusCode, message, data) =>
  response.status(statusCode).json({
    success: true,
    message,
    data,
  });

// 2. GET /mahasiswa dan filter berdasarkan prodi/angkatan
app.get("/mahasiswa", (request, response) => {
  const { prodi, angkatan } = request.query;

  const data = mahasiswa.filter((item) => {
    const cocokProdi =
      prodi === undefined ||
      item.prodi.toLowerCase() === String(prodi).toLowerCase();

    const cocokAngkatan =
      angkatan === undefined ||
      item.angkatan === Number(angkatan);

    return cocokProdi && cocokAngkatan;
  });

  return responseData(
    response,
    200,
    "Data mahasiswa berhasil diambil",
    data
  );
});

// 3. GET /mahasiswa/:nim
app.get("/mahasiswa/:nim", (request, response) => {
  const item = mahasiswa.find(
    ({ nim }) => nim === request.params.nim
  );

  if (!item) {
    return response.status(404).json({
      success: false,
      message: "Mahasiswa tidak ditemukan",
    });
  }

  return responseData(
    response,
    200,
    "Detail mahasiswa berhasil diambil",
    item
  );
});

// 4. POST /mahasiswa
app.post("/mahasiswa", (request, response) => {
  const { nim, nama, prodi, angkatan } = request.body;

  // Validasi data wajib
  if (
    typeof nim !== "string" || !nim.trim() ||
    typeof nama !== "string" || !nama.trim() ||
    typeof prodi !== "string" || !prodi.trim() ||
    !Number.isInteger(angkatan) || angkatan <= 0
  ) {
    return response.status(400).json({
      success: false,
      message: "NIM, nama, prodi, dan angkatan wajib diisi dengan format yang benar",
    });
  }

  // Cek NIM agar tidak duplikat
  const sudahAda = mahasiswa.some(
    (item) => item.nim === nim.trim()
  );

  if (sudahAda) {
    return response.status(400).json({
      success: false,
      message: "NIM sudah terdaftar",
    });
  }

  const dataBaru = {
    nim: nim.trim(),
    nama: nama.trim(),
    prodi: prodi.trim(),
    angkatan,
  };

  mahasiswa.push(dataBaru);

  return responseData(
    response,
    201,
    "Mahasiswa berhasil ditambahkan",
    dataBaru
  );
});

// 5. PATCH /mahasiswa/:nim
app.patch("/mahasiswa/:nim", (request, response) => {
  const item = mahasiswa.find(
    ({ nim }) => nim === request.params.nim
  );

  if (!item) {
    return response.status(404).json({
      success: false,
      message: "Mahasiswa tidak ditemukan",
    });
  }

  const dataUpdate = request.body;
  const fieldDiizinkan = ["nama", "prodi", "angkatan"];
  const fieldDikirim = Object.keys(dataUpdate);

  if (
    fieldDikirim.length === 0 ||
    fieldDikirim.some((field) => !fieldDiizinkan.includes(field))
  ) {
    return response.status(400).json({
      success: false,
      message: "Data update kosong atau terdapat field yang tidak diizinkan",
    });
  }

  if (
    ("nama" in dataUpdate &&
      (typeof dataUpdate.nama !== "string" || !dataUpdate.nama.trim())) ||
    ("prodi" in dataUpdate &&
      (typeof dataUpdate.prodi !== "string" || !dataUpdate.prodi.trim())) ||
    ("angkatan" in dataUpdate &&
      (!Number.isInteger(dataUpdate.angkatan) || dataUpdate.angkatan <= 0))
  ) {
    return response.status(400).json({
      success: false,
      message: "Format data yang diubah tidak valid",
    });
  }

  Object.assign(item, dataUpdate);

  // PATCH berhasil menggunakan status 204 (tanpa response body)
  return response.status(204).send();
});

// Menjalankan server
app.listen(3007, () => {
  console.log("Latihan REST API berjalan di http://localhost:3007");
});
