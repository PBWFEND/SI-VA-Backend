import express from "express";

const app = express();

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

// Data anggota sementara
const anggota = [
  {
    id_anggota: "AGT001",
    nama: "Ende",
    nim: "2601602210118",
    jabatan: "Ketua",
  },
  {
    id_anggota: "AGT002",
    nama: "Pingkan",
    nim: "260160221015",
    jabatan: "Wakil Ketua",
  },

  {
    id_anggota: "AGT003",
    nama: "Qeylla",
    nim: "260160221014",
    jabatan: "Sekretaris",
  },

  {
    id_anggota: "AGT004",
    nama: "Shifa",
    nim: "260160221014",
    jabatan: "Bendahara",
  },
];

// GET:
app.get("/anggota", (request, response) => {
  const { jabatan } = request.query;

  const data =
    jabatan === undefined
      ? anggota
      : anggota.filter(
          (item) =>
            item.jabatan.toLowerCase() ===
            jabatan.toLowerCase()
        );

  return response.status(200).json({
    success: true,
    total: data.length,
    data,
  });
});

// GET
app.get("/anggota/:id", (request, response) => {
  const item = anggota.find(
    (item) => item.id_anggota === request.params.id
  );

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

// POST
app.post("/anggota", (request, response) => {
  const { nama, nim, jabatan } = request.body ?? {};

  if (
    typeof nama !== "string" ||
    nama.trim() === "" ||
    typeof nim !== "string" ||
    nim.trim() === "" ||
    typeof jabatan !== "string" ||
    jabatan.trim() === ""
  ) {
    return response.status(400).json({
      success: false,
      message: "Field nama, nim, dan jabatan wajib diisi",
    });
  }

  const nomorBerikutnya =
    anggota.reduce((nomor, item) => {
      const angka = Number(item.id_anggota.slice(3));
      return Math.max(nomor, angka);
    }, 0) + 1;

  const idBaru = `AGT${String(nomorBerikutnya).padStart(3, "0")}`;

  const anggotaBaru = {
    id_anggota: idBaru,
    nama: nama.trim(),
    nim: nim.trim(),
    jabatan: jabatan.trim(),
  };

  anggota.push(anggotaBaru);

  return response.status(201).json({
    success: true,
    message: "Anggota berhasil ditambahkan",
    data: anggotaBaru,
  });
});

// PUT
app.put("/anggota/:id", (request, response) => {
  const item = anggota.find(
    (item) => item.id_anggota === request.params.id
  );

  if (!item) {
    return response.status(404).json({
      success: false,
      message: "Anggota tidak ditemukan",
    });
  }

  const { nama, nim, jabatan } = request.body ?? {};

  if (
    (nama !== undefined &&
      (typeof nama !== "string" || nama.trim() === "")) ||
    (nim !== undefined &&
      (typeof nim !== "string" || nim.trim() === "")) ||
    (jabatan !== undefined &&
      (typeof jabatan !== "string" || jabatan.trim() === ""))
  ) {
    return response.status(400).json({
      success: false,
      message: "Data anggota tidak valid",
    });
  }

  if (nama !== undefined) item.nama = nama.trim();
  if (nim !== undefined) item.nim = nim.trim();
  if (jabatan !== undefined) item.jabatan = jabatan.trim();

  return response.status(200).json({
    success: true,
    message: "Anggota berhasil diperbarui",
    data: item,
  });
});

// DELETE
app.delete("/anggota/:id", (request, response) => {
  const index = anggota.findIndex(
    (item) => item.id_anggota === request.params.id
  );

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

// Handler untuk endpoint yang tidak tersedia
app.use((request, response) => {
  response.status(404).json({
    success: false,
    message: "Endpoint tidak ditemukan",
  });
});

// Error middleware
app.use((error, request, response, next) => {
  console.error(error.stack);

  response.status(500).json({
    success: false,
    message: "Terjadi kesalahan pada server",
  });
});

export default app;