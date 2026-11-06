/**
 * Pertemuan 5 — Latihan Individu RESTful API
 * Resource: mahasiswa
 * Jalankan: node latihan.js
 */

import express from "express";

const app = express();
app.disable("x-powered-by");
app.use(express.json());

const mahasiswa = [
  {
    nim: "240160221029",
    nama: "Nabilla Natasya Putri",
    prodi: "Sistem Informasi",
    angkatan: 2024,
  },
  {
    nim: "240160221030",
    nama: "Nadya Zahra Aulia",
    prodi: "Sistem Informasi",
    angkatan: 2024,
  },
];

// Logger: mencatat method dan URL setiap request
app.use((request, response, next) => {
  console.log(`${request.method} ${request.originalUrl}`);
  next();
});

// Format response sukses
const responseData = (response, statusCode, message, data) => {
  return response.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

// Format response error
const responseError = (response, statusCode, message) => {
  return response.status(statusCode).json({
    success: false,
    message,
  });
};

// Validasi data mahasiswa
const validateMahasiswa = (data, partial = false) => {
  const allowedFields = ["nim", "nama", "prodi", "angkatan"];
  const requiredFields = ["nim", "nama", "prodi", "angkatan"];

  if (
    data === null ||
    typeof data !== "object" ||
    Array.isArray(data)
  ) {
    return "Body harus berupa objek JSON.";
  }

  const fields = Object.keys(data);

  if (fields.length === 0) {
    return "Data mahasiswa tidak boleh kosong.";
  }

  if (fields.some((field) => !allowedFields.includes(field))) {
    return "Terdapat field yang tidak diperbolehkan.";
  }

  if (!partial) {
    const missing = requiredFields.filter(
      (field) =>
        data[field] === undefined ||
        data[field] === null ||
        data[field] === ""
    );

    if (missing.length > 0) {
      return `Field wajib diisi: ${missing.join(", ")}.`;
    }
  }

  for (const field of fields) {
    if (
      typeof data[field] === "string" &&
      data[field].trim() === ""
    ) {
      return `Field ${field} tidak boleh kosong.`;
    }
  }

  if (
    data.nim !== undefined &&
    typeof data.nim !== "string"
  ) {
    return "NIM harus berupa teks.";
  }

  if (
    data.nama !== undefined &&
    typeof data.nama !== "string"
  ) {
    return "Nama harus berupa teks.";
  }

  if (
    data.prodi !== undefined &&
    typeof data.prodi !== "string"
  ) {
    return "Prodi harus berupa teks.";
  }

  if (
    data.angkatan !== undefined &&
    (!Number.isInteger(data.angkatan) ||
      data.angkatan < 1900)
  ) {
    return "Angkatan harus berupa bilangan bulat yang valid.";
  }

  return null;
};

// GET / — informasi API
app.get("/", (request, response) => {
  return responseData(
    response,
    200,
    "API Mahasiswa berjalan",
    null
  );
});

// GET /mahasiswa — semua data dan filter
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

// GET /mahasiswa/:nim — detail berdasarkan NIM
app.get("/mahasiswa/:nim", (request, response) => {
  const item = mahasiswa.find(
    ({ nim }) => nim === request.params.nim
  );

  if (!item) {
    return responseError(
      response,
      404,
      "Mahasiswa tidak ditemukan"
    );
  }

  return responseData(
    response,
    200,
    "Detail mahasiswa berhasil diambil",
    item
  );
});

// POST /mahasiswa — menambahkan mahasiswa
app.post("/mahasiswa", (request, response) => {
  const error = validateMahasiswa(request.body);

  if (error) {
    return responseError(response, 400, error);
  }

  const { nim, nama, prodi, angkatan } = request.body;

  const sudahAda = mahasiswa.some(
    (item) => item.nim === nim
  );

  if (sudahAda) {
    return responseError(
      response,
      400,
      "NIM sudah terdaftar"
    );
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

// PATCH /mahasiswa/:nim — mengubah sebagian data
app.patch("/mahasiswa/:nim", (request, response) => {
  const item = mahasiswa.find(
    ({ nim }) => nim === request.params.nim
  );

  if (!item) {
    return responseError(
      response,
      404,
      "Mahasiswa tidak ditemukan"
    );
  }

  const error = validateMahasiswa(request.body, true);

  if (error) {
    return responseError(response, 400, error);
  }

  // NIM tidak dapat diubah melalui PATCH
  if (request.body.nim !== undefined) {
    return responseError(
      response,
      400,
      "NIM tidak dapat diubah"
    );
  }

  Object.assign(item, request.body);

  // Rapikan spasi untuk field teks yang dikirim
  for (const field of ["nama", "prodi"]) {
    if (request.body[field] !== undefined) {
      item[field] = request.body[field].trim();
    }
  }

  return responseData(
    response,
    200,
    "Data mahasiswa berhasil diperbarui",
    item
  );
});

// DELETE /mahasiswa/:nim — tambahan untuk menguji status 204
app.delete("/mahasiswa/:nim", (request, response) => {
  const index = mahasiswa.findIndex(
    ({ nim }) => nim === request.params.nim
  );

  if (index === -1) {
    return responseError(
      response,
      404,
      "Mahasiswa tidak ditemukan"
    );
  }

  mahasiswa.splice(index, 1);

  // Status 204 tidak mengirim response body
  return response.status(204).end();
});

// Handler untuk endpoint yang tidak ditemukan
app.use((request, response) => {
  return responseError(
    response,
    404,
    "Endpoint tidak ditemukan"
  );
});

// Menangani JSON yang tidak valid
app.use((error, request, response, next) => {
  if (error instanceof SyntaxError && error.status === 400) {
    return responseError(
      response,
      400,
      "Format JSON tidak valid"
    );
  }

  console.error(error);
  return responseError(
    response,
    500,
    "Terjadi kesalahan pada server"
  );
});

app.listen(3007, () => {
  console.log(
    "Latihan REST API berjalan di http://localhost:3007"
  );
});