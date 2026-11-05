
import express from "express";

const app = express();

app.disable("x-powered-by");

// Middleware untuk membaca request JSON
app.use(express.json());

// Middleware logger
app.use((request, response, next) => {
  const waktu = new Date().toLocaleString("id-ID");

  console.log(
    `[${waktu}] ${request.method} ${request.originalUrl}`
  );

  next();
});

// ==================== DATA BUKU ====================

const buku = [
  {
    id: 1,
    judul: "Belajar Node.js",
    penulis: "Andi",
    tahun: 2024,
    stok: 5,
  },
  {
    id: 2,
    judul: "Pemrograman Web",
    penulis: "Budi",
    tahun: 2023,
    stok: 3,
  },
];

// ==================== DATA ANGGOTA ====================

const anggota = [
  {
    id: 1,
    nama: "Nur Octaviani Tri Wulandari",
    nim: "240160221032",
    jurusan: "Sistem Informasi",
  },
  {
    id: 2,
    nama: "Nadya Zahra Aulia",
    nim: "240160221030",
    jurusan: "Sistem Informasi",
  },
  {
    id: 3,
    nama: "Alya Ayu Mesyha",
    nim: "240160221003",
    jurusan: "Sistem Informasi",
  },
];

// ==================== HALAMAN UTAMA ====================

app.get("/", (request, response) => {
  return response.status(200).json({
    success: true,
    message: "API Sistem Informasi Perpustakaan",
    endpoints: [
      "GET /",
      "GET /buku",
      "GET /buku/:id",
      "POST /buku",
      "PUT /buku/:id",
      "DELETE /buku/:id",
      "GET /anggota",
      "GET /anggota/:id",
      "POST /anggota",
      "PUT /anggota/:id",
      "DELETE /anggota/:id",
    ],
  });
});

// ==================== RESOURCE BUKU ====================

// GET semua buku
app.get("/buku", (request, response) => {
  return response.status(200).json({
    success: true,
    total: buku.length,
    data: buku,
  });
});

// GET buku berdasarkan ID
app.get("/buku/:id", (request, response) => {
  const id = Number(request.params.id);
  const item = buku.find((item) => item.id === id);

  if (!item) {
    return response.status(404).json({
      success: false,
      message: "Buku tidak ditemukan",
    });
  }

  return response.status(200).json({
    success: true,
    data: item,
  });
});

// POST menambahkan buku
app.post("/buku", (request, response) => {
  const { judul, penulis, tahun, stok } = request.body ?? {};

  if (
    typeof judul !== "string" ||
    judul.trim() === "" ||
    typeof penulis !== "string" ||
    penulis.trim() === "" ||
    !Number.isInteger(tahun) ||
    !Number.isInteger(stok) ||
    stok < 0
  ) {
    return response.status(400).json({
      success: false,
      message:
        "Field judul, penulis, tahun, dan stok wajib diisi dengan format yang benar",
    });
  }

  const idBaru =
    buku.length > 0
      ? Math.max(...buku.map((item) => item.id)) + 1
      : 1;

  const bukuBaru = {
    id: idBaru,
    judul: judul.trim(),
    penulis: penulis.trim(),
    tahun,
    stok,
  };

  buku.push(bukuBaru);

  return response.status(201).json({
    success: true,
    message: "Buku berhasil ditambahkan",
    data: bukuBaru,
  });
});

// PUT memperbarui buku
app.put("/buku/:id", (request, response) => {
  const id = Number(request.params.id);
  const item = buku.find((item) => item.id === id);

  if (!item) {
    return response.status(404).json({
      success: false,
      message: "Buku tidak ditemukan",
    });
  }

  const { judul, penulis, tahun, stok } = request.body ?? {};

  if (
    (judul !== undefined &&
      (typeof judul !== "string" || judul.trim() === "")) ||
    (penulis !== undefined &&
      (typeof penulis !== "string" || penulis.trim() === "")) ||
    (tahun !== undefined && !Number.isInteger(tahun)) ||
    (stok !== undefined &&
      (!Number.isInteger(stok) || stok < 0))
  ) {
    return response.status(400).json({
      success: false,
      message: "Data buku tidak valid",
    });
  }

  if (judul !== undefined) item.judul = judul.trim();
  if (penulis !== undefined) item.penulis = penulis.trim();
  if (tahun !== undefined) item.tahun = tahun;
  if (stok !== undefined) item.stok = stok;

  return response.status(200).json({
    success: true,
    message: "Buku berhasil diperbarui",
    data: item,
  });
});

// DELETE menghapus buku
app.delete("/buku/:id", (request, response) => {
  const id = Number(request.params.id);
  const index = buku.findIndex((item) => item.id === id);

  if (index === -1) {
    return response.status(404).json({
      success: false,
      message: "Buku tidak ditemukan",
    });
  }

  const bukuDihapus = buku.splice(index, 1)[0];

  return response.status(200).json({
    success: true,
    message: "Buku berhasil dihapus",
    data: bukuDihapus,
  });
});

// ==================== RESOURCE ANGGOTA ====================

// GET semua anggota
app.get("/anggota", (request, response) => {
  return response.status(200).json({
    success: true,
    total: anggota.length,
    data: anggota,
  });
});

// GET anggota berdasarkan ID
app.get("/anggota/:id", (request, response) => {
  const id = Number(request.params.id);
  const item = anggota.find((item) => item.id === id);

  if (!item) {
    return response.status(404).json({
      success: false,
      message: "Anggota tidak ditemukan",
    });
  }

  return response.status(200).json({
    success: true,
    data: item,
  });
});

// POST menambahkan anggota
app.post("/anggota", (request, response) => {
  const { nama, nim, jurusan } = request.body ?? {};

  if (
    typeof nama !== "string" ||
    nama.trim() === "" ||
    typeof nim !== "string" ||
    nim.trim() === "" ||
    typeof jurusan !== "string" ||
    jurusan.trim() === ""
  ) {
    return response.status(400).json({
      success: false,
      message: "Field nama, nim, dan jurusan wajib diisi",
    });
  }

  const idBaru =
    anggota.length > 0
      ? Math.max(...anggota.map((item) => item.id)) + 1
      : 1;

  const anggotaBaru = {
    id: idBaru,
    nama: nama.trim(),
    nim: nim.trim(),
    jurusan: jurusan.trim(),
  };

  anggota.push(anggotaBaru);

  return response.status(201).json({
    success: true,
    message: "Anggota berhasil ditambahkan",
    data: anggotaBaru,
  });
});

// PUT memperbarui anggota
app.put("/anggota/:id", (request, response) => {
  const id = Number(request.params.id);
  const item = anggota.find((item) => item.id === id);

  if (!item) {
    return response.status(404).json({
      success: false,
      message: "Anggota tidak ditemukan",
    });
  }

  const { nama, nim, jurusan } = request.body ?? {};

  if (
    (nama !== undefined &&
      (typeof nama !== "string" || nama.trim() === "")) ||
    (nim !== undefined &&
      (typeof nim !== "string" || nim.trim() === "")) ||
    (jurusan !== undefined &&
      (typeof jurusan !== "string" || jurusan.trim() === ""))
  ) {
    return response.status(400).json({
      success: false,
      message: "Data anggota tidak valid",
    });
  }

  if (nama !== undefined) item.nama = nama.trim();
  if (nim !== undefined) item.nim = nim.trim();
  if (jurusan !== undefined) item.jurusan = jurusan.trim();

  return response.status(200).json({
    success: true,
    message: "Anggota berhasil diperbarui",
    data: item,
  });
});

// DELETE menghapus anggota
app.delete("/anggota/:id", (request, response) => {
  const id = Number(request.params.id);
  const index = anggota.findIndex((item) => item.id === id);

  if (index === -1) {
    return response.status(404).json({
      success: false,
      message: "Anggota tidak ditemukan",
    });
  }

  const anggotaDihapus = anggota.splice(index, 1)[0];

  return response.status(200).json({
    success: true,
    message: "Anggota berhasil dihapus",
    data: anggotaDihapus,
  });
});

// ==================== HANDLER 404 ====================

app.use((request, response) => {
  return response.status(404).json({
    success: false,
    message: `Endpoint ${request.method} ${request.originalUrl} tidak ditemukan`,
  });
});

// ==================== ERROR MIDDLEWARE ====================

app.use((error, request, response, next) => {
  console.error("Kesalahan aplikasi:", error.message);

  return response.status(500).json({
    success: false,
    message: "Terjadi kesalahan pada server",
  });
});

export default app;
