/**
 * Pertemuan 5 — latihan desain RESTful API
 * Tujuan: menerapkan resource, filter query, status code, dan response JSON.
 * Jalankan: node latihan.js
 */

import express from "express";

const app = express();
app.disable("x-powered-by");
app.use(express.json());

const mahasiswa = [
  { nim: "F1D022001", nama: "Jhon Doe", prodi: "Sistem Informasi", angkatan: 2024 },
  { nim: "F1D022002", nama: "Ani Lestari", prodi: "Sistem Informasi", angkatan: 2023 },
];

const responseData = (response, statusCode, message, data) => response.status(statusCode).json({
  success: true,
  message,
  data,
});

app.get("/mahasiswa", (request, response) => {
  const { prodi, angkatan } = request.query;
  const data = mahasiswa.filter((item) => {
    const cocokProdi = prodi === undefined || item.prodi.toLowerCase() === String(prodi).toLowerCase();
    const cocokAngkatan = angkatan === undefined || item.angkatan === Number(angkatan);
    return cocokProdi && cocokAngkatan;
  });

  return responseData(response, 200, "Data mahasiswa berhasil diambil", data);
});

app.get("/mahasiswa/:nim", (request, response) => {
  const item = mahasiswa.find(({ nim }) => nim === request.params.nim);
  if (!item) return response.status(404).json({ success: false, message: "Mahasiswa tidak ditemukan" });
  return responseData(response, 200, "Detail mahasiswa berhasil diambil", item);
});

app.listen(3007, () => {
  console.log("Latihan REST API berjalan di http://localhost:3007");
});