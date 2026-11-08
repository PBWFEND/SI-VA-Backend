import express from "express";

const app = express();

app.use(express.json());

// Middleware untuk mencatat setiap request
app.use((req, res, next) => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`
  );
  next();
});

// Data buku sementara (in-memory)
let buku = [
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

// Data anggota sementara (in-memory)
let anggota = [
  {
    id: 1,
    nama: "Alya Ayu Meysha",
    nim: "240160221003",
    jurusan: "Sistem Informasi",
  },
  {
    id: 2,
    nama: "Nadya Zahra Aulia",
    nim: "240160221033",
    jurusan: "Sistem Informasi",
  },
];

// Format respons JSON yang konsisten
const sukses = (res, status, message, data) => {
  return res.status(status).json({
    success: true,
    message,
    data,
  });
};

const gagal = (res, status, message) => {
  return res.status(status).json({
    success: false,
    message,
  });
};

// Field yang wajib diisi untuk buku
const fieldBuku = ["judul", "penulis", "tahun", "stok"];

// Field yang wajib diisi untuk anggota
const fieldAnggota = ["nama", "nim", "jurusan"];

// Validasi data buku
function validasiBuku(data, partial = false) {
  if (
    !data ||
    typeof data !== "object" ||
    Array.isArray(data)
  ) {
    return "Body harus berupa objek JSON.";
  }

  const fieldDikirim = Object.keys(data);

  if (fieldDikirim.length === 0) {
    return "Data tidak boleh kosong.";
  }

  const fieldTidakDikenal = fieldDikirim.find(
    (field) => !fieldBuku.includes(field)
  );

  if (fieldTidakDikenal) {
    return `Field '${fieldTidakDikenal}' tidak diizinkan.`;
  }

  for (const field of fieldDikirim) {
    if (field === "tahun" || field === "stok") {
      if (!Number.isInteger(data[field])) {
        return `Field '${field}' harus berupa bilangan bulat.`;
      }

      if (field === "tahun" && data[field] <= 0) {
        return "Tahun harus lebih besar dari 0.";
      }

      if (field === "stok" && data[field] < 0) {
        return "Stok tidak boleh kurang dari 0.";
      }
    } else if (
      typeof data[field] !== "string" ||
      data[field].trim() === ""
    ) {
      return `Field '${field}' harus berupa teks dan tidak boleh kosong.`;
    }
  }

  if (!partial) {
    const fieldKosong = fieldBuku.find(
      (field) =>
        data[field] === undefined ||
        data[field] === null ||
        (typeof data[field] === "string" &&
          data[field].trim() === "")
    );

    if (fieldKosong) {
      return `Field '${fieldKosong}' wajib diisi.`;
    }
  }

  return null;
}

// Validasi data anggota
function validasiAnggota(data, partial = false) {
  if (
    !data ||
    typeof data !== "object" ||
    Array.isArray(data)
  ) {
    return "Body harus berupa objek JSON.";
  }

  const fieldDikirim = Object.keys(data);

  if (fieldDikirim.length === 0) {
    return "Data tidak boleh kosong.";
  }

  const fieldTidakDikenal = fieldDikirim.find(
    (field) => !fieldAnggota.includes(field)
  );

  if (fieldTidakDikenal) {
    return `Field '${fieldTidakDikenal}' tidak diizinkan.`;
  }

  for (const field of fieldDikirim) {
    if (
      typeof data[field] !== "string" ||
      data[field].trim() === ""
    ) {
      return `Field '${field}' harus berupa teks dan tidak boleh kosong.`;
    }
  }

  if (!partial) {
    const fieldKosong = fieldAnggota.find(
      (field) =>
        typeof data[field] !== "string" ||
        data[field].trim() === ""
    );

    if (fieldKosong) {
      return `Field '${fieldKosong}' wajib diisi.`;
    }
  }

  return null;
}

// ============================
// RESOURCE BUKU
// ============================

// GET /buku
// Mendukung filter judul dan penulis
app.get("/buku", (req, res) => {
  const { judul, penulis } = req.query;

  if (
    judul !== undefined &&
    (typeof judul !== "string" || judul.trim() === "")
  ) {
    return gagal(res, 400, "Filter judul tidak boleh kosong.");
  }

  if (
    penulis !== undefined &&
    (typeof penulis !== "string" || penulis.trim() === "")
  ) {
    return gagal(res, 400, "Filter penulis tidak boleh kosong.");
  }

  let hasil = [...buku];

  if (judul) {
    hasil = hasil.filter((item) =>
      item.judul.toLowerCase().includes(judul.trim().toLowerCase())
    );
  }

  if (penulis) {
    hasil = hasil.filter((item) =>
      item.penulis.toLowerCase().includes(penulis.trim().toLowerCase())
    );
  }

  return sukses(res, 200, "Data buku berhasil diambil.", hasil);
});

// GET /buku/:id
app.get("/buku/:id", (req, res) => {
  const data = buku.find(
    (item) => item.id === Number(req.params.id)
  );

  if (!data) {
    return gagal(res, 404, "Data buku tidak ditemukan.");
  }

  return sukses(res, 200, "Detail buku berhasil diambil.", data);
});

// POST /buku
app.post("/buku", (req, res) => {
  const error = validasiBuku(req.body);

  if (error) {
    return gagal(res, 400, error);
  }

  const idBaru =
    buku.reduce((terbesar, item) => Math.max(terbesar, item.id), 0) + 1;

  const dataBaru = {
    id: idBaru,
    judul: req.body.judul.trim(),
    penulis: req.body.penulis.trim(),
    tahun: req.body.tahun,
    stok: req.body.stok,
  };

  buku.push(dataBaru);

  return sukses(res, 201, "Data buku berhasil ditambahkan.", dataBaru);
});

// PUT /buku/:id
// Mengganti seluruh field data buku
app.put("/buku/:id", (req, res) => {
  const index = buku.findIndex(
    (item) => item.id === Number(req.params.id)
  );

  if (index === -1) {
    return gagal(res, 404, "Data buku tidak ditemukan.");
  }

  const error = validasiBuku(req.body);

  if (error) {
    return gagal(res, 400, error);
  }

  buku[index] = {
    id: buku[index].id,
    judul: req.body.judul.trim(),
    penulis: req.body.penulis.trim(),
    tahun: req.body.tahun,
    stok: req.body.stok,
  };

  return sukses(res, 200, "Data buku berhasil diganti.", buku[index]);
});

// PATCH /buku/:id
// Mengubah sebagian field data buku
app.patch("/buku/:id", (req, res) => {
  const index = buku.findIndex(
    (item) => item.id === Number(req.params.id)
  );

  if (index === -1) {
    return gagal(res, 404, "Data buku tidak ditemukan.");
  }

  const error = validasiBuku(req.body, true);

  if (error) {
    return gagal(res, 400, error);
  }

  buku[index] = {
    ...buku[index],
    ...Object.fromEntries(
      Object.entries(req.body).map(([key, value]) => [
        key,
        typeof value === "string" ? value.trim() : value,
      ])
    ),
  };

  return sukses(res, 200, "Data buku berhasil diperbarui.", buku[index]);
});

// DELETE /buku/:id
app.delete("/buku/:id", (req, res) => {
  const index = buku.findIndex(
    (item) => item.id === Number(req.params.id)
  );

  if (index === -1) {
    return gagal(res, 404, "Data buku tidak ditemukan.");
  }

  buku.splice(index, 1);

  return res.status(204).end();
});

// ============================
// RESOURCE ANGGOTA
// ============================

// GET /anggota
app.get("/anggota", (req, res) => {
  return sukses(res, 200, "Data anggota berhasil diambil.", anggota);
});

// GET /anggota/:id
app.get("/anggota/:id", (req, res) => {
  const data = anggota.find(
    (item) => item.id === Number(req.params.id)
  );

  if (!data) {
    return gagal(res, 404, "Data anggota tidak ditemukan.");
  }

  return sukses(res, 200, "Detail anggota berhasil diambil.", data);
});

// POST /anggota
app.post("/anggota", (req, res) => {
  const error = validasiAnggota(req.body);

  if (error) {
    return gagal(res, 400, error);
  }

  const idBaru =
    anggota.reduce((terbesar, item) => Math.max(terbesar, item.id), 0) + 1;

  const dataBaru = {
    id: idBaru,
    nama: req.body.nama.trim(),
    nim: req.body.nim.trim(),
    jurusan: req.body.jurusan.trim(),
  };

  anggota.push(dataBaru);

  return sukses(
    res,
    201,
    "Data anggota berhasil ditambahkan.",
    dataBaru
  );
});

// PUT /anggota/:id
// Mengganti seluruh field data anggota
app.put("/anggota/:id", (req, res) => {
  const index = anggota.findIndex(
    (item) => item.id === Number(req.params.id)
  );

  if (index === -1) {
    return gagal(res, 404, "Data anggota tidak ditemukan.");
  }

  const error = validasiAnggota(req.body);

  if (error) {
    return gagal(res, 400, error);
  }

  anggota[index] = {
    id: anggota[index].id,
    nama: req.body.nama.trim(),
    nim: req.body.nim.trim(),
    jurusan: req.body.jurusan.trim(),
  };

  return sukses(
    res,
    200,
    "Data anggota berhasil diganti.",
    anggota[index]
  );
});

// PATCH /anggota/:id
// Mengubah sebagian field data anggota
app.patch("/anggota/:id", (req, res) => {
  const index = anggota.findIndex(
    (item) => item.id === Number(req.params.id)
  );

  if (index === -1) {
    return gagal(res, 404, "Data anggota tidak ditemukan.");
  }

  const error = validasiAnggota(req.body, true);

  if (error) {
    return gagal(res, 400, error);
  }

  anggota[index] = {
    ...anggota[index],
    ...Object.fromEntries(
      Object.entries(req.body).map(([key, value]) => [
        key,
        value.trim(),
      ])
    ),
  };

  return sukses(
    res,
    200,
    "Data anggota berhasil diperbarui.",
    anggota[index]
  );
});

// DELETE /anggota/:id
app.delete("/anggota/:id", (req, res) => {
  const index = anggota.findIndex(
    (item) => item.id === Number(req.params.id)
  );

  if (index === -1) {
    return gagal(res, 404, "Data anggota tidak ditemukan.");
  }

  anggota.splice(index, 1);

  return res.status(204).end();
});

// Endpoint yang tidak ditemukan
app.use((req, res) => {
  return gagal(res, 404, "Endpoint tidak ditemukan.");
});

// Menangani JSON yang tidak valid dan error server
app.use((err, req, res, next) => {
  if (
    err instanceof SyntaxError &&
    err.status === 400 &&
    "body" in err
  ) {
    return gagal(res, 400, "Format JSON tidak valid.");
  }

  console.error(err);
  return gagal(res, 500, "Terjadi kesalahan pada server.");
});

export default app;