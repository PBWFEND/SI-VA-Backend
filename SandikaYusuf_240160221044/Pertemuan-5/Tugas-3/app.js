import express from "express";

const app = express();

app.use(express.json());

// Data anggota sementara
const anggota = [
  {
    id: 1,
    nama: "Sandika Yusuf Permana",
    divisi: "Humas",
    status: "Aktif",
  },
  {
    id: 2,
    nama: "Muhamad Zaky",
    divisi: "Acara",
    status: "Aktif",
  },
  {
    id: 3,
    nama: "Bang Ocep",
    divisi: "Humas",
    status: "Tidak Aktif",
  },
];

// Data absensi sementara
const absensi = [
  {
    id: 1,
    anggotaId: 1,
    tanggal: "2026-10-06",
    status: "Hadir",
  },
  {
    id: 2,
    anggotaId: 2,
    tanggal: "2026-10-06",
    status: "Izin",
  },
];

// =========================
// GET SEMUA ANGGOTA
// =========================
app.get("/anggota", (req, res) => {
  const { divisi, status } = req.query;

  let data = anggota;

  if (divisi) {
    data = data.filter(
      (item) => item.divisi.toLowerCase() === divisi.toLowerCase()
    );
  }

  if (status) {
    data = data.filter(
      (item) => item.status.toLowerCase() === status.toLowerCase()
    );
  }

  res.status(200).json({
    success: true,
    message: "Data anggota berhasil diambil",
    data,
  });
});

// =========================
// GET DETAIL ANGGOTA
// =========================
app.get("/anggota/:id", (req, res) => {
  const id = Number(req.params.id);

  const data = anggota.find((item) => item.id === id);

  if (!data) {
    return res.status(404).json({
      success: false,
      message: "Anggota tidak ditemukan",
    });
  }

  res.status(200).json({
    success: true,
    message: "Detail anggota berhasil diambil",
    data,
  });
});

// =========================
// POST ANGGOTA
// =========================
app.post("/anggota", (req, res) => {
  const { nama, divisi, status } = req.body;

  const errors = [];

  if (!nama || typeof nama !== "string") {
    errors.push("Nama wajib diisi");
  }

  if (!divisi || typeof divisi !== "string") {
    errors.push("Divisi wajib diisi");
  }

  if (!status || typeof status !== "string") {
    errors.push("Status wajib diisi");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Data tidak valid",
      details: errors,
    });
  }

  const newAnggota = {
    id: anggota.length + 1,
    nama,
    divisi,
    status,
  };

  anggota.push(newAnggota);

  res.status(201).json({
    success: true,
    message: "Anggota berhasil ditambahkan",
    data: newAnggota,
  });
});

// =========================
// PUT ANGGOTA
// =========================
app.put("/anggota/:id", (req, res) => {
  const id = Number(req.params.id);

  const data = anggota.find((item) => item.id === id);

  if (!data) {
    return res.status(404).json({
      success: false,
      message: "Anggota tidak ditemukan",
    });
  }

  const { nama, divisi, status } = req.body;

  if (
    !nama ||
    typeof nama !== "string" ||
    !divisi ||
    typeof divisi !== "string" ||
    !status ||
    typeof status !== "string"
  ) {
    return res.status(400).json({
      success: false,
      message: "Nama, divisi, dan status wajib diisi",
    });
  }

  data.nama = nama;
  data.divisi = divisi;
  data.status = status;

  res.status(200).json({
    success: true,
    message: "Data anggota berhasil diperbarui",
    data,
  });
});

// =========================
// PATCH ANGGOTA
// =========================
app.patch("/anggota/:id", (req, res) => {
  const id = Number(req.params.id);

  const data = anggota.find((item) => item.id === id);

  if (!data) {
    return res.status(404).json({
      success: false,
      message: "Anggota tidak ditemukan",
    });
  }

  const { nama, divisi, status } = req.body;

  if (nama !== undefined) {
    if (typeof nama !== "string" || nama.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Nama harus berupa teks",
      });
    }

    data.nama = nama;
  }

  if (divisi !== undefined) {
    if (typeof divisi !== "string" || divisi.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Divisi harus berupa teks",
      });
    }

    data.divisi = divisi;
  }

  if (status !== undefined) {
    if (typeof status !== "string" || status.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Status harus berupa teks",
      });
    }

    data.status = status;
  }

  res.status(200).json({
    success: true,
    message: "Data anggota berhasil diperbarui sebagian",
    data,
  });
});

// =========================
// DELETE ANGGOTA
// =========================
app.delete("/anggota/:id", (req, res) => {
  const id = Number(req.params.id);

  const index = anggota.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: "Anggota tidak ditemukan",
    });
  }

  anggota.splice(index, 1);

  res.status(204).send();
});

// =========================
// GET SEMUA ABSENSI
// =========================
app.get("/absensi", (req, res) => {
  const { tanggal, status } = req.query;

  let data = absensi;

  if (tanggal) {
    data = data.filter((item) => item.tanggal === tanggal);
  }

  if (status) {
    data = data.filter(
      (item) => item.status.toLowerCase() === status.toLowerCase()
    );
  }

  res.status(200).json({
    success: true,
    message: "Data absensi berhasil diambil",
    data,
  });
});

// =========================
// POST ABSENSI
// =========================
app.post("/absensi", (req, res) => {
  const { anggotaId, tanggal, status } = req.body;

  if (!anggotaId || !tanggal || !status) {
    return res.status(400).json({
      success: false,
      message: "anggotaId, tanggal, dan status wajib diisi",
    });
  }

  const anggotaData = anggota.find(
    (item) => item.id === Number(anggotaId)
  );

  if (!anggotaData) {
    return res.status(404).json({
      success: false,
      message: "Anggota tidak ditemukan",
    });
  }

  const newAbsensi = {
    id: absensi.length + 1,
    anggotaId: Number(anggotaId),
    tanggal,
    status,
  };

  absensi.push(newAbsensi);

  res.status(201).json({
    success: true,
    message: "Data absensi berhasil ditambahkan",
    data: newAbsensi,
  });
});

// =========================
// ROUTE TIDAK DITEMUKAN
// =========================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint tidak ditemukan",
  });
});

export default app;