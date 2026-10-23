/**
 * Tugas 2 — REST Endpoint dengan Express.js
 * Resource: Anggota
 */

import express from "express";

const app = express();

app.disable("x-powered-by");

// Middleware JSON
app.use(express.json());

// Middleware logger
app.use((request, response, next) => {
  const waktu = new Date().toLocaleString("id-ID");

  console.log(
    `[${waktu}] ${request.method} ${request.originalUrl}`
  );

  next();
});

// Data anggota
const anggota = [
  {
    id: 1,
    nama: "Della Kartika",
    nim: "240160221008",
    jabatan: "Ketua",
  },
  {
    id: 2,
    nama: "Faishal Rizky F",
    nim: "240160221012",
    jabatan: "Sekretaris",
  },
  {
    id: 3,
    nama: "Fauzan Zainul Arifin",
    nim: "240160221014",
    jabatan: "Bendahara",
  },
];

// GET /
app.get("/", (request, response) => {
  response.status(200).json({
    success: true,
    message: "REST API Anggota",
  });
});

// GET /health
app.get("/health", (request, response) => {
  response.status(200).json({
    success: true,
    message: "API berjalan dengan baik",
  });
});

// GET /anggota
// Query parameter: ?jabatan=Ketua
app.get("/anggota", (request, response) => {
  const { jabatan } = request.query;

  const data =
    jabatan === undefined
      ? anggota
      : anggota.filter(
          (item) =>
            item.jabatan.toLowerCase() === jabatan.toLowerCase()
        );

  response.status(200).json({
    success: true,
    total: data.length,
    data,
  });
});

// GET /anggota/:id
app.get("/anggota/:id", (request, response) => {
  const id = Number(request.params.id);

  const item = anggota.find((item) => item.id === id);

  if (!item) {
    return response.status(404).json({
      success: false,
      message: "Anggota tidak ditemukan",
    });
  }

  response.status(200).json({
    success: true,
    data: item,
  });
});

// POST /anggota
app.post("/anggota", (request, response) => {
  const { nama, nim, jabatan } = request.body;

  // Validasi data
  if (!nama || !nim || !jabatan) {
    return response.status(400).json({
      success: false,
      message: "nama, nim, dan jabatan wajib diisi",
    });
  }

  const idBaru =
    anggota.length > 0
      ? Math.max(...anggota.map((item) => item.id)) + 1
      : 1;

  const anggotaBaru = {
    id: idBaru,
    nama,
    nim,
    jabatan,
  };

  anggota.push(anggotaBaru);

  response.status(201).json({
    success: true,
    message: "Anggota berhasil ditambahkan",
    data: anggotaBaru,
  });
});

// Handler 404
app.use((request, response) => {
  response.status(404).json({
    success: false,
    message: "Endpoint tidak ditemukan",
  });
});

// Error middleware
app.use((error, request, response, next) => {
  console.error(error);

  response.status(500).json({
    success: false,
    message: "Terjadi kesalahan pada server",
  });
});

export default app;