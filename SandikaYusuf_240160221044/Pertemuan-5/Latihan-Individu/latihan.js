import express from "express";

const app = express();

app.disable("x-powered-by");
app.use(express.json());

// Logger
app.use((request, response, next) => {
  console.log(`${request.method} ${request.url}`);
  next();
});

// Data mahasiswa
const mahasiswa = [
  {
    nim: "240160221044",
    nama: "Sandika Yusuf Permana",
    prodi: "Sistem Informasi",
    angkatan: 2024,
  },
  {
    nim: "240160221028",
    nama: "Muhamad Zaky",
    prodi: "Sistem Informasi",
    angkatan: 2023,
  },
];

// Response JSON
const responseData = (response, statusCode, message, data) => {
  return response.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

// GET semua mahasiswa + filter
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

// GET mahasiswa berdasarkan NIM
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

// POST mahasiswa
app.post("/mahasiswa", (request, response) => {
  const { nim, nama, prodi, angkatan } = request.body;

  const errors = [];

  if (!nim || typeof nim !== "string") {
    errors.push("NIM wajib diisi");
  }

  if (!nama || typeof nama !== "string") {
    errors.push("Nama wajib diisi");
  }

  if (!prodi || typeof prodi !== "string") {
    errors.push("Prodi wajib diisi");
  }

  if (
    angkatan === undefined ||
    !Number.isInteger(angkatan) ||
    angkatan < 2000
  ) {
    errors.push("Angkatan harus berupa angka yang valid");
  }

  if (errors.length > 0) {
    return response.status(400).json({
      success: false,
      message: "Data mahasiswa tidak valid",
      details: errors,
    });
  }

  const existingMahasiswa = mahasiswa.find(
    (item) => item.nim === nim
  );

  if (existingMahasiswa) {
    return response.status(400).json({
      success: false,
      message: "NIM sudah terdaftar",
    });
  }

  const newMahasiswa = {
    nim,
    nama,
    prodi,
    angkatan,
  };

  mahasiswa.push(newMahasiswa);

  return responseData(
    response,
    201,
    "Mahasiswa berhasil ditambahkan",
    newMahasiswa
  );
});

// PATCH mahasiswa
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

  const { nama, prodi, angkatan } = request.body;

  if (
    nama !== undefined &&
    typeof nama !== "string"
  ) {
    return response.status(400).json({
      success: false,
      message: "Nama harus berupa string",
    });
  }

  if (
    prodi !== undefined &&
    typeof prodi !== "string"
  ) {
    return response.status(400).json({
      success: false,
      message: "Prodi harus berupa string",
    });
  }

  if (
    angkatan !== undefined &&
    (!Number.isInteger(angkatan) || angkatan < 2000)
  ) {
    return response.status(400).json({
      success: false,
      message: "Angkatan harus berupa angka yang valid",
    });
  }

  if (nama !== undefined) item.nama = nama;
  if (prodi !== undefined) item.prodi = prodi;
  if (angkatan !== undefined) item.angkatan = angkatan;

  return responseData(
    response,
    200,
    "Data mahasiswa berhasil diperbarui",
    item
  );
});

// DELETE mahasiswa
app.delete("/mahasiswa/:nim", (request, response) => {
  const index = mahasiswa.findIndex(
    ({ nim }) => nim === request.params.nim
  );

  if (index === -1) {
    return response.status(404).json({
      success: false,
      message: "Mahasiswa tidak ditemukan",
    });
  }

  mahasiswa.splice(index, 1);

  return response.status(204).send();
});

// Jalankan server
app.listen(3007, () => {
  console.log(
    "Latihan REST API berjalan di http://localhost:3007"
  );
});