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

// Data absensi sementara (in-memory)
let absensi = [
 {
    id_absensi: "ABS001",
    id_anggota: "AGT001",
    nama: "Ende",
    nim: "2601602210118",
    jabatan: "Ketua",
    kegiatan: "Rapat UKM",
    tanggal: "2026-08-18",
    status: "Hadir",
  },
  {
    id_absensi: "ABS001",
    id_anggota: "AGT002",
    nama: "Pingkan",
    nim: "260160221015",
    jabatan: "Wakil Ketua",
    kegiatan: "Rapat UKM",
    tanggal: "2026-08-18",
    status: "Hadir",
  },
  {
    id_absensi: "ABS002",
    id_anggota: "AGT003",
    nama: "Qeylla",
    nim: "260160221014",
    jabatan: "Sekretaris",
    kegiatan: "Rapat Evaluasi",
    tanggal: "2026-08-03",
    status: "Izin",
  },
  {
    id_absensi: "ABS002",
    id_anggota: "AGT004",
    nama: "Shifa",
    nim: "260160221014",
    jabatan: "Bendahara",
    kegiatan: "Rapat Evaluasi",
    tanggal: "2026-08-03",
    status: "Hadir",
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

const fieldWajib = [
  "id_anggota",
  "nama",
  "nim",
  "kegiatan",
  "tanggal",
  "status",
];

const statusValid = ["Hadir", "Izin", "Sakit"];

// Validasi data absensi
function validasiAbsensi(data, partial = false) {
  if (
    !data ||
    typeof data !== "object" ||
    Array.isArray(data)
  ) {
    return "Body harus berupa objek JSON.";
  }

  const fieldDiizinkan = [...fieldWajib];
  const fieldDikirim = Object.keys(data);

  if (fieldDikirim.length === 0) {
    return "Data tidak boleh kosong.";
  }

  const fieldTidakDikenal = fieldDikirim.find(
    (field) => !fieldDiizinkan.includes(field)
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
    const fieldKosong = fieldWajib.find(
      (field) =>
        typeof data[field] !== "string" ||
        data[field].trim() === ""
    );

    if (fieldKosong) {
      return `Field '${fieldKosong}' wajib diisi.`;
    }
  }

  if (data.status && !statusValid.includes(data.status)) {
    return "Status harus Hadir, Izin, atau Sakit.";
  }

  if (data.tanggal) {
    const polaTanggal = /^\d{4}-\d{2}-\d{2}$/;
    const tanggal = new Date(`${data.tanggal}T00:00:00.000Z`);

    if (
      !polaTanggal.test(data.tanggal) ||
      Number.isNaN(tanggal.getTime()) ||
      tanggal.toISOString().slice(0, 10) !== data.tanggal
    ) {
      return "Tanggal harus menggunakan format YYYY-MM-DD yang valid.";
    }
  }

  return null;
}

// GET /absensi
// Mendukung filter status dan kegiatan
app.get("/absensi", (req, res) => {
  const { status, kegiatan } = req.query;

  if (status && !statusValid.includes(status)) {
    return gagal(
      res,
      400,
      "Filter status harus Hadir, Izin, atau Sakit."
    );
  }

  if (
    kegiatan !== undefined &&
    (typeof kegiatan !== "string" || kegiatan.trim() === "")
  ) {
    return gagal(res, 400, "Filter kegiatan tidak boleh kosong.");
  }

  let hasil = [...absensi];

  if (status) {
    hasil = hasil.filter((item) => item.status === status);
  }

  if (kegiatan) {
    hasil = hasil.filter(
      (item) =>
        item.kegiatan.toLowerCase() === kegiatan.trim().toLowerCase()
    );
  }

  return sukses(
    res,
    200,
    "Data absensi berhasil diambil.",
    hasil
  );
});

// GET /absensi/:id
app.get("/absensi/:id", (req, res) => {
  const data = absensi.find(
    (item) => item.id_absensi === req.params.id
  );

  if (!data) {
    return gagal(res, 404, "Data absensi tidak ditemukan.");
  }

  return sukses(res, 200, "Detail absensi berhasil diambil.", data);
});

// POST /absensi
app.post("/absensi", (req, res) => {
  const error = validasiAbsensi(req.body);

  if (error) {
    return gagal(res, 400, error);
  }

  const nomorTerbesar = absensi.reduce((terbesar, item) => {
    const nomor = Number(item.id_absensi.replace("ABS", ""));
    return Math.max(terbesar, nomor);
  }, 0);

  const dataBaru = {
    id_absensi: `ABS${String(nomorTerbesar + 1).padStart(3, "0")}`,
    ...Object.fromEntries(
      fieldWajib.map((field) => [
        field,
        req.body[field].trim(),
      ])
    ),
  };

  absensi.push(dataBaru);

  return sukses(res, 201, "Data absensi berhasil ditambahkan.", dataBaru);
});

// PUT /absensi/:id
// Mengganti seluruh field data absensi
app.put("/absensi/:id", (req, res) => {
  const index = absensi.findIndex(
    (item) => item.id_absensi === req.params.id
  );

  if (index === -1) {
    return gagal(res, 404, "Data absensi tidak ditemukan.");
  }

  const error = validasiAbsensi(req.body);

  if (error) {
    return gagal(res, 400, error);
  }

  absensi[index] = {
    id_absensi: absensi[index].id_absensi,
    ...Object.fromEntries(
      fieldWajib.map((field) => [
        field,
        req.body[field].trim(),
      ])
    ),
  };

  return sukses(
    res,
    200,
    "Data absensi berhasil diganti.",
    absensi[index]
  );
});

// PATCH /absensi/:id
// Mengubah sebagian field data absensi
app.patch("/absensi/:id", (req, res) => {
  const index = absensi.findIndex(
    (item) => item.id_absensi === req.params.id
  );

  if (index === -1) {
    return gagal(res, 404, "Data absensi tidak ditemukan.");
  }

  const error = validasiAbsensi(req.body, true);

  if (error) {
    return gagal(res, 400, error);
  }

  absensi[index] = {
    ...absensi[index],
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
    "Data absensi berhasil diperbarui.",
    absensi[index]
  );
});

// DELETE /absensi/:id
app.delete("/absensi/:id", (req, res) => {
  const index = absensi.findIndex(
    (item) => item.id_absensi === req.params.id
  );

  if (index === -1) {
    return gagal(res, 404, "Data absensi tidak ditemukan.");
  }

  absensi.splice(index, 1);

  // Status 204 tidak mengirim body
  return res.status(204).end();
});

// Endpoint yang tidak ditemukan
app.use((req, res) => {
  return gagal(res, 404, "Endpoint tidak ditemukan.");
});

// Menangani JSON yang tidak valid
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return gagal(res, 400, "Format JSON tidak valid.");
  }

  console.error(err);
  return gagal(res, 500, "Terjadi kesalahan pada server.");
});

export default app;