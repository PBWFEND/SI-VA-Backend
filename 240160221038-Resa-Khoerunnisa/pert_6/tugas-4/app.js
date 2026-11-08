
import express from "express";
import { prisma } from "./client.js";

const app = express();

app.disable("x-powered-by");
app.use(express.json());

// Format response berhasil
const sendSuccess = (response, statusCode, message, data) => {
  return response.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

// Format response error
const sendError = (response, statusCode, message, details) => {
  return response.status(statusCode).json({
    success: false,
    message,
    ...(details !== undefined ? { details } : {}),
  });
};

// Format tanggal menjadi YYYY-MM-DD
const formatAbsensi = (item) => ({
  ...item,
  tanggal: item.tanggal.toISOString().slice(0, 10),
});

// Validasi tanggal
const parseTanggal = (tanggal) => {
  if (
    typeof tanggal !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(tanggal)
  ) {
    return null;
  }

  const date = new Date(`${tanggal}T00:00:00.000Z`);

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== tanggal
  ) {
    return null;
  }

  return date;
};

// Validasi data absensi
const validateAbsensi = (payload, partial = false) => {
  const errors = [];
  const requiredFields = ["nama", "jabatan", "tanggal", "status"];
  const allowedStatuses = ["Hadir", "Izin", "Sakit"];

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return ["Body harus berupa object JSON"];
  }

  if (!partial) {
    for (const field of requiredFields) {
      if (payload[field] === undefined) {
        errors.push(`Field ${field} wajib diisi`);
      }
    }
  }

  for (const field of ["nama", "jabatan"]) {
    if (
      payload[field] !== undefined &&
      (typeof payload[field] !== "string" || !payload[field].trim())
    ) {
      errors.push(`${field} harus berupa teks dan tidak boleh kosong`);
    }
  }

  if (payload.tanggal !== undefined && !parseTanggal(payload.tanggal)) {
    errors.push("Tanggal harus menggunakan format YYYY-MM-DD yang valid");
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

// Middleware logger
app.use((request, response, next) => {
  console.log(
    `[${new Date().toISOString()}] ${request.method} ${request.originalUrl}`
  );
  next();
});

// Halaman utama API
app.get("/", (_request, response) => {
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
app.get("/health", (_request, response) => {
  return sendSuccess(response, 200, "API berjalan", {
    status: "up",
  });
});

// GET semua absensi dan filter
app.get("/absensi", async (request, response) => {
  try {
    const { status, jabatan, tanggal } = request.query;

    const where = {};

    if (status !== undefined) {
      if (typeof status !== "string") {
        return sendError(response, 400, "Filter status tidak valid");
      }
      where.status = {
        equals: status,
        mode: "insensitive",
      };
    }

    if (jabatan !== undefined) {
      if (typeof jabatan !== "string") {
        return sendError(response, 400, "Filter jabatan tidak valid");
      }
      where.jabatan = {
        equals: jabatan,
        mode: "insensitive",
      };
    }

    if (tanggal !== undefined) {
      const date = parseTanggal(tanggal);

      if (!date) {
        return sendError(response, 400, "Format tanggal harus YYYY-MM-DD");
      }

      const nextDay = new Date(date);
      nextDay.setUTCDate(nextDay.getUTCDate() + 1);

      where.tanggal = {
        gte: date,
        lt: nextDay,
      };
    }

    const data = await prisma.absensi.findMany({
      where,
      orderBy: { id: "asc" },
    });

    return sendSuccess(response, 200, "Daftar absensi berhasil diambil", {
      total: data.length,
      data: data.map(formatAbsensi),
    });
  } catch (error) {
    console.error(error);
    return sendError(response, 500, "Gagal mengambil daftar absensi");
  }
});

// GET detail absensi
app.get("/absensi/:id", async (request, response) => {
  try {
    const id = Number(request.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return sendError(response, 400, "ID absensi tidak valid");
    }

    const item = await prisma.absensi.findUnique({
      where: { id },
    });

    if (!item) {
      return sendError(response, 404, "Data absensi tidak ditemukan");
    }

    return sendSuccess(
      response,
      200,
      "Detail absensi berhasil diambil",
      formatAbsensi(item)
    );
  } catch (error) {
    console.error(error);
    return sendError(response, 500, "Gagal mengambil detail absensi");
  }
});

// POST membuat absensi
app.post("/absensi", async (request, response) => {
  try {
    const errors = validateAbsensi(request.body);

    if (errors.length > 0) {
      return sendError(response, 400, "Data absensi tidak valid", errors);
    }

    const { nama, jabatan, tanggal, status } = request.body;

    const data = await prisma.absensi.create({
      data: {
        nama: nama.trim(),
        jabatan: jabatan.trim(),
        tanggal: parseTanggal(tanggal),
        status,
      },
    });

    return sendSuccess(
      response,
      201,
      "Data absensi berhasil dibuat",
      formatAbsensi(data)
    );
  } catch (error) {
    console.error(error);
    return sendError(response, 500, "Gagal membuat data absensi");
  }
});

// PUT mengganti seluruh data absensi
app.put("/absensi/:id", async (request, response) => {
  try {
    const id = Number(request.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return sendError(response, 400, "ID absensi tidak valid");
    }

    const errors = validateAbsensi(request.body);

    if (errors.length > 0) {
      return sendError(response, 400, "Data absensi tidak valid", errors);
    }

    const existing = await prisma.absensi.findUnique({
      where: { id },
    });

    if (!existing) {
      return sendError(response, 404, "Data absensi tidak ditemukan");
    }

    const { nama, jabatan, tanggal, status } = request.body;

    const data = await prisma.absensi.update({
      where: { id },
      data: {
        nama: nama.trim(),
        jabatan: jabatan.trim(),
        tanggal: parseTanggal(tanggal),
        status,
      },
    });

    return sendSuccess(
      response,
      200,
      "Data absensi berhasil diganti",
      formatAbsensi(data)
    );
  } catch (error) {
    console.error(error);
    return sendError(response, 500, "Gagal mengganti data absensi");
  }
});

// PATCH mengubah sebagian data absensi
app.patch("/absensi/:id", async (request, response) => {
  try {
    const id = Number(request.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return sendError(response, 400, "ID absensi tidak valid");
    }

    const fieldDiizinkan = ["nama", "jabatan", "tanggal", "status"];
    const fieldDikirim = Object.keys(request.body ?? {});

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

    const existing = await prisma.absensi.findUnique({
      where: { id },
    });

    if (!existing) {
      return sendError(response, 404, "Data absensi tidak ditemukan");
    }

    const dataUpdate = {};

    if (request.body.nama !== undefined) {
      dataUpdate.nama = request.body.nama.trim();
    }

    if (request.body.jabatan !== undefined) {
      dataUpdate.jabatan = request.body.jabatan.trim();
    }

    if (request.body.tanggal !== undefined) {
      dataUpdate.tanggal = parseTanggal(request.body.tanggal);
    }

    if (request.body.status !== undefined) {
      dataUpdate.status = request.body.status;
    }

    const data = await prisma.absensi.update({
      where: { id },
      data: dataUpdate,
    });

    return sendSuccess(
      response,
      200,
      "Data absensi berhasil diperbarui",
      formatAbsensi(data)
    );
  } catch (error) {
    console.error(error);
    return sendError(response, 500, "Gagal memperbarui data absensi");
  }
});

// DELETE menghapus absensi
app.delete("/absensi/:id", async (request, response) => {
  try {
    const id = Number(request.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return sendError(response, 400, "ID absensi tidak valid");
    }

    const existing = await prisma.absensi.findUnique({
      where: { id },
    });

    if (!existing) {
      return sendError(response, 404, "Data absensi tidak ditemukan");
    }

    await prisma.absensi.delete({
      where: { id },
    });

    return response.status(204).send();
  } catch (error) {
    console.error(error);
    return sendError(response, 500, "Gagal menghapus data absensi");
  }
});

// Endpoint tidak ditemukan
app.use((_request, response) => {
  return sendError(response, 404, "Endpoint tidak ditemukan");
});

// Menangani kesalahan aplikasi
app.use((error, _request, response, _next) => {
  console.error("Kesalahan aplikasi:", error.message);
  return sendError(response, 500, "Terjadi kesalahan pada server");
});

export default app;
