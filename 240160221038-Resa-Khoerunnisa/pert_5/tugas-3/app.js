
/**
 * Tugas 3 — RESTful API Absensi Organisasi
 * Tujuan: menyediakan endpoint CRUD untuk resource absensi.
 * Digunakan oleh: server.js
 */

import express from "express";

const app = express();
app.disable("x-powered-by");
app.use(express.json());

// Data awal absensi
let absensi = [
  {
    id: 1,
    nama: "Andi",
    jabatan: "Ketua",
    tanggal: "2026-09-28",
    status: "Hadir",
  },
  {
    id: 2,
    nama: "Siti",
    jabatan: "Sekretaris",
    tanggal: "2026-09-28",
    status: "Izin",
  },
  {
    id: 3,
    nama: "Rina",
    jabatan: "Bendahara",
    tanggal: "2026-09-28",
    status: "Hadir",
  },
];

let nextId = 4;

// Format response berhasil
const sendSuccess = (response, statusCode, message, data) => {
  return response.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

// Format response error
const sendError = (response, statusCode, message, details = undefined) => {
  return response.status(statusCode).json({
    success: false,
    message,
    ...(details && { details }),
  });
};

// Middleware logger
app.use((request, response, next) => {
  console.log(
    `[${new Date().toISOString()}] ${request.method} ${request.originalUrl}`
  );
  next();
});

// Halaman utama API
app.get("/", (request, response) => {
  return sendSuccess(response, 200, "REST API Absensi Organisasi", {
    resource: "absensi",
    endpoints: [
      "GET /absensi",
      "GET /absensi/:id",
      "POST /absensi",
      "PUT /absensi/:id",
      "PATCH /absensi/:id",
      "DELETE /absensi/:id",
    ],
  });
});

// Mengecek kondisi API
app.get("/health", (request, response) => {
  return sendSuccess(response, 200, "API berjalan", {
    status: "up",
  });
});

// GET /absensi
// Filter berdasarkan status, jabatan, dan tanggal
app.get("/absensi", (request, response) => {
  const { status, jabatan, tanggal } = request.query;

  const data = absensi.filter((item) => {
    const cocokStatus =
      status === undefined ||
      item.status.toLowerCase() === String(status).toLowerCase();

    const cocokJabatan =
      jabatan === undefined ||
      item.jabatan.toLowerCase() === String(jabatan).toLowerCase();

    const cocokTanggal =
      tanggal === undefined || item.tanggal === tanggal;

    return cocokStatus && cocokJabatan && cocokTanggal;
  });

  return sendSuccess(response, 200, "Daftar absensi berhasil diambil", {
    total: data.length,
    data,
  });
});

// GET /absensi/:id
app.get("/absensi/:id", (request, response) => {
  const item = absensi.find(
    ({ id }) => id === Number(request.params.id)
  );

  if (!item) {
    return sendError(response, 404, "Data absensi tidak ditemukan");
  }

  return sendSuccess(response, 200, "Detail absensi berhasil diambil", item);
});

// Validasi data absensi
const validateAbsensi = (payload, partial = false) => {
  const errors = [];
  const requiredFields = ["nama", "jabatan", "tanggal", "status"];
  const allowedStatuses = ["Hadir", "Izin", "Sakit"];

  if (!partial) {
    for (const field of requiredFields) {
      if (payload[field] === undefined) {
        errors.push(`Field ${field} wajib diisi`);
      }
    }
  }

  if (
    payload.nama !== undefined &&
    (typeof payload.nama !== "string" || !payload.nama.trim())
  ) {
    errors.push("Nama harus berupa teks dan tidak boleh kosong");
  }

  if (
    payload.jabatan !== undefined &&
    (typeof payload.jabatan !== "string" || !payload.jabatan.trim())
  ) {
    errors.push("Jabatan harus berupa teks dan tidak boleh kosong");
  }

  if (payload.tanggal !== undefined) {
    const tanggalValid =
      typeof payload.tanggal === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(payload.tanggal) &&
      !Number.isNaN(Date.parse(payload.tanggal)) &&
      new Date(payload.tanggal).toISOString().slice(0, 10) === payload.tanggal;

    if (!tanggalValid) {
      errors.push("Tanggal harus menggunakan format YYYY-MM-DD yang valid");
    }
  }

  if (
    payload.status !== undefined &&
    (typeof payload.status !== "string" ||
      !allowedStatuses.includes(payload.status))
  ) {
    errors.push("Status harus Hadir, Izin, atau Sakit");
  }

  return errors;
};

// POST /absensi
app.post("/absensi", (request, response) => {
  const errors = validateAbsensi(request.body);

  if (errors.length > 0) {
    return sendError(response, 400, "Data absensi tidak valid", errors);
  }

  const baru = {
    id: nextId++,
    ...request.body,
  };

  absensi.push(baru);

  return sendSuccess(response, 201, "Data absensi berhasil dibuat", baru);
});

// PUT /absensi/:id
// Mengganti seluruh data absensi
app.put("/absensi/:id", (request, response) => {
  const index = absensi.findIndex(
    ({ id }) => id === Number(request.params.id)
  );

  if (index === -1) {
    return sendError(response, 404, "Data absensi tidak ditemukan");
  }

  const errors = validateAbsensi(request.body);

  if (errors.length > 0) {
    return sendError(response, 400, "Data absensi tidak valid", errors);
  }

  absensi[index] = {
    id: absensi[index].id,
    ...request.body,
  };

  return sendSuccess(response, 200, "Data absensi berhasil diganti", absensi[index]);
});

// PATCH /absensi/:id
// Mengubah sebagian data absensi
app.patch("/absensi/:id", (request, response) => {
  const item = absensi.find(
    ({ id }) => id === Number(request.params.id)
  );

  if (!item) {
    return sendError(response, 404, "Data absensi tidak ditemukan");
  }

  const fieldDiizinkan = ["nama", "jabatan", "tanggal", "status"];
  const fieldDikirim = Object.keys(request.body);

  if (
    fieldDikirim.length === 0 ||
    fieldDikirim.some((field) => !fieldDiizinkan.includes(field))
  ) {
    return sendError(
      response,
      400,
      "Data perubahan kosong atau terdapat field yang tidak diizinkan"
    );
  }

  const errors = validateAbsensi(request.body, true);

  if (errors.length > 0) {
    return sendError(response, 400, "Data perubahan tidak valid", errors);
  }

  Object.assign(item, request.body);

  return sendSuccess(response, 200, "Data absensi berhasil diperbarui", item);
});

// DELETE /absensi/:id
app.delete("/absensi/:id", (request, response) => {
  const index = absensi.findIndex(
    ({ id }) => id === Number(request.params.id)
  );

  if (index === -1) {
    return sendError(response, 404, "Data absensi tidak ditemukan");
  }

  absensi.splice(index, 1);

  return response.status(204).send();
});

// Menangani endpoint yang tidak ditemukan
app.use((request, response) => {
  return sendError(response, 404, "Endpoint tidak ditemukan");
});

// Menangani kesalahan aplikasi
app.use((error, request, response, next) => {
  console.error("Kesalahan aplikasi:", error.message);
  return sendError(response, 500, "Terjadi kesalahan pada server");
});

export default app;
