
import "dotenv/config";
import express from "express";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "./prisma/generated/client.ts";

const app = express();

app.use(express.json());
app.disable("x-powered-by");

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL
});

const prisma = new PrismaClient({ adapter });

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidStatus(value) {
  return ["Hadir", "Izin", "Sakit"].includes(value);
}

// ==================== ANGGOTA ====================

// GET semua anggota
app.get("/anggota", async (req, res, next) => {
  try {
    const data = await prisma.anggota.findMany({
      include: { absensi: true }
    });

    res.json({
      success: true,
      total: data.length,
      data
    });
  } catch (error) {
    next(error);
  }
});

// GET anggota berdasarkan ID
app.get("/anggota/:id", async (req, res, next) => {
  try {
    const data = await prisma.anggota.findUnique({
      where: { id_anggota: req.params.id },
      include: { absensi: true }
    });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Anggota tidak ditemukan"
      });
    }

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// POST anggota
app.post("/anggota", async (req, res, next) => {
  const { id_anggota, nama, nim, jabatan } = req.body;

  if (![id_anggota, nama, nim, jabatan].every(isNonEmptyString)) {
    return res.status(400).json({
      success: false,
      message: "Field id_anggota, nama, nim, dan jabatan wajib diisi"
    });
  }

  try {
    const data = await prisma.anggota.create({
      data: {
        id_anggota: id_anggota.trim(),
        nama: nama.trim(),
        nim: nim.trim(),
        jabatan: jabatan.trim()
      }
    });

    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// ==================== ABSENSI ====================

// GET semua absensi, dengan filter opsional
app.get("/absensi", async (req, res, next) => {
  try {
    const where = {};

    if (req.query.status) {
      where.status = String(req.query.status);
    }

    if (req.query.kegiatan) {
      where.kegiatan = {
        contains: String(req.query.kegiatan)
      };
    }

    const data = await prisma.absensi.findMany({
      where,
      include: { anggota: true }
    });

    res.json({
      success: true,
      total: data.length,
      data
    });
  } catch (error) {
    next(error);
  }
});

// GET absensi berdasarkan ID
app.get("/absensi/:id", async (req, res, next) => {
  try {
    const data = await prisma.absensi.findUnique({
      where: { id_absensi: req.params.id },
      include: { anggota: true }
    });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Absensi tidak ditemukan"
      });
    }

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// POST absensi
app.post("/absensi", async (req, res, next) => {
  const { id_absensi, id_anggota, kegiatan, tanggal, status } = req.body;

  if (
    ![id_absensi, id_anggota, kegiatan, tanggal, status]
      .every(isNonEmptyString)
  ) {
    return res.status(400).json({
      success: false,
      message: "Semua field absensi wajib diisi"
    });
  }

  if (!isValidStatus(status)) {
    return res.status(400).json({
      success: false,
      message: "Status harus Hadir, Izin, atau Sakit"
    });
  }

  try {
    const data = await prisma.absensi.create({
      data: {
        id_absensi: id_absensi.trim(),
        id_anggota: id_anggota.trim(),
        kegiatan: kegiatan.trim(),
        tanggal: tanggal.trim(),
        status
      },
      include: { anggota: true }
    });

    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// PATCH status absensi
app.patch("/absensi/:id", async (req, res, next) => {
  const { status } = req.body;

  if (!isNonEmptyString(status) || !isValidStatus(status)) {
    return res.status(400).json({
      success: false,
      message: "Status harus Hadir, Izin, atau Sakit"
    });
  }

  try {
    const data = await prisma.absensi.update({
      where: { id_absensi: req.params.id },
      data: { status },
      include: { anggota: true }
    });

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// DELETE absensi
app.delete("/absensi/:id", async (req, res, next) => {
  try {
    await prisma.absensi.delete({
      where: { id_absensi: req.params.id }
    });

    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

// 404 untuk endpoint yang tidak tersedia
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint tidak ditemukan"
  });
});

// Penanganan error Prisma dan error lainnya
app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error.code === "P2002") {
    return res.status(409).json({
      success: false,
      message: "ID anggota, NIM, atau ID absensi sudah digunakan"
    });
  }

  if (error.code === "P2003") {
    return res.status(400).json({
      success: false,
      message: "ID anggota tidak ditemukan"
    });
  }

  if (error.code === "P2025") {
    return res.status(404).json({
      success: false,
      message: "Data tidak ditemukan"
    });
  }

  console.error(error);

  res.status(500).json({
    success: false,
    message: "Terjadi kesalahan pada server"
  });
});

export default app;
