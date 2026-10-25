/**
 * Pertemuan 5 — latihan desain RESTful API
 * Tujuan: menerapkan resource, filter query, status code, dan response JSON.
 * Jalankan: node latihan.js
 */

import express from "express";

const app = express();

app.disable("x-powered-by");

// Middleware untuk membaca JSON dari request
app.use(express.json());

// Middleware logger: mencatat method dan URL setiap request
app.use((request, response, next) => {
  console.log(`${request.method} ${request.originalUrl}`);
  next();
});

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


app.post("/mahasiswa", (request, response) => {
  const { nim, nama, prodi, angkatan } = request.body;

  // Validasi semua field wajib
  if (
    typeof nim !== "string" || !nim.trim() ||
    typeof nama !== "string" || !nama.trim() ||
    typeof prodi !== "string" || !prodi.trim() ||
    angkatan === undefined ||
    angkatan === null ||
    angkatan === "" ||
    !Number.isInteger(Number(angkatan)) ||
    Number(angkatan) <= 0
  ) {
    return response.status(400).json({
      success: false,
      message: "nim, nama, prodi, dan angkatan wajib diisi dengan format yang valid"
    });
  }

  // Mencegah NIM duplikat
  const nimBaru = nim.trim();

  const sudahAda = mahasiswa.some(
    (item) => item.nim === nimBaru
  );

  if (sudahAda) {
    return response.status(400).json({
      success: false,
      message: "NIM sudah terdaftar"
    });
  }

  const dataBaru = {
    nim: nimBaru,
    nama: nama.trim(),
    prodi: prodi.trim(),
    angkatan: Number(angkatan)
  };

  mahasiswa.push(dataBaru);

  return responseData(
    response,
    201,
    "Mahasiswa berhasil ditambahkan",
    dataBaru
  );
});

app.patch("/mahasiswa/:nim", (request, response) => {
  const item = mahasiswa.find(
    ({ nim }) => nim === request.params.nim
  );

  if (!item) {
    return response.status(404).json({
      success: false,
      message: "Mahasiswa tidak ditemukan"
    });
  }

  const { nama, prodi, angkatan } = request.body;

  // Pastikan minimal ada satu field yang ingin diperbarui
  const fields = ["nama", "prodi", "angkatan"];
  const adaField = fields.some(
    (field) => Object.hasOwn(request.body, field)
  );

  if (!adaField) {
    return response.status(400).json({
      success: false,
      message: "Minimal satu field harus diisi untuk diperbarui"
    });
  }

  // Validasi field yang dikirim
  if (
    (nama !== undefined &&
      (typeof nama !== "string" || !nama.trim())) ||
    (prodi !== undefined &&
      (typeof prodi !== "string" || !prodi.trim())) ||
    (angkatan !== undefined &&
      (angkatan === "" ||
       angkatan === null ||
       !Number.isInteger(Number(angkatan)) ||
       Number(angkatan) <= 0))
  ) {
    return response.status(400).json({
      success: false,
      message: "Data yang dikirim tidak valid"
    });
  }

  // Perbarui hanya field yang dikirim
  if (nama !== undefined) item.nama = nama.trim();
  if (prodi !== undefined) item.prodi = prodi.trim();
  if (angkatan !== undefined) item.angkatan = Number(angkatan);

  return responseData(
    response,
    200,
    "Data mahasiswa berhasil diperbarui",
    item
  );
});

app.listen(3007, () => {
  console.log("Latihan REST API berjalan di http://localhost:3007");
});