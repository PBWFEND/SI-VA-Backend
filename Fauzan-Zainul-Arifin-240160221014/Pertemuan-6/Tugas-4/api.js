
import express from "express";
import { prisma } from "./client.js";

const app = express();
const PORT = process.env.PORT || 3008;

app.use(express.json());

// Endpoint utama
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API Mahasiswa dengan Express dan Prisma berjalan",
  });
});

// Pemeriksaan koneksi database
app.get("/api/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      success: true,
      message: "API dan database terhubung",
    });
  } catch (error) {
    console.error("Database health check gagal:", error);

    res.status(500).json({
      success: false,
      message: "Koneksi database gagal",
    });
  }
});

// GET semua mahasiswa, dengan filter opsional
app.get("/mahasiswa", async (req, res) => {
  try {
    const { prodi, angkatan } = req.query;
    const where = {};

    if (prodi !== undefined) {
      if (typeof prodi !== "string" || !prodi.trim()) {
        return res.status(400).json({
          success: false,
          message: "Parameter prodi harus berupa teks yang tidak kosong",
        });
      }

      where.prodi = prodi.trim();
    }

    if (angkatan !== undefined) {
      if (
        typeof angkatan !== "string" ||
        !/^\d{4}$/.test(angkatan)
      ) {
        return res.status(400).json({
          success: false,
          message: "Parameter angkatan harus berupa tahun, misalnya 2024",
        });
      }

      where.angkatan = Number(angkatan);
    }

    const mahasiswa = await prisma.mahasiswa.findMany({
      where,
      orderBy: { nim: "asc" },
    });

    return res.status(200).json({
      success: true,
      total: mahasiswa.length,
      data: mahasiswa,
    });
  } catch (error) {
    console.error("Gagal mengambil daftar mahasiswa:", error);

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
});

// GET mahasiswa berdasarkan NIM
app.get("/mahasiswa/:nim", async (req, res) => {
  try {
    const { nim } = req.params;

    const mahasiswa = await prisma.mahasiswa.findUnique({
      where: { nim },
    });

    if (!mahasiswa) {
      return res.status(404).json({
        success: false,
        message: "Mahasiswa tidak ditemukan",
      });
    }

    return res.status(200).json({
      success: true,
      data: mahasiswa,
    });
  } catch (error) {
    console.error("Gagal mengambil detail mahasiswa:", error);

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
});


app.post("/mahasiswa", async (req, res) => {
  try {
    const { nim, nama, prodi, angkatan } = req.body;

    // Validasi field wajib
    if (
      typeof nim !== "string" ||
      !nim.trim() ||
      typeof nama !== "string" ||
      !nama.trim() ||
      typeof prodi !== "string" ||
      !prodi.trim() ||
      angkatan === undefined ||
      angkatan === null ||
      angkatan === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "nim, nama, prodi, dan angkatan wajib diisi",
      });
    }

    // Validasi angkatan
    const tahun = Number(angkatan);

    if (
      !Number.isInteger(tahun) ||
      tahun < 2000 ||
      tahun > new Date().getFullYear()
    ) {
      return res.status(400).json({
        success: false,
        message: "angkatan harus berupa tahun yang valid",
      });
    }

    // Simpan mahasiswa ke database
    const mahasiswa = await prisma.mahasiswa.create({
      data: {
        nim: nim.trim(),
        nama: nama.trim(),
        prodi: prodi.trim(),
        angkatan: tahun,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Mahasiswa berhasil ditambahkan",
      data: mahasiswa,
    });
  } catch (error) {
    // NIM harus unik sesuai schema Prisma
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "NIM sudah terdaftar",
      });
    }

    console.error("Gagal menambahkan mahasiswa:", error);

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
});


app.patch("/mahasiswa/:nim", async (req, res) => {
  try {
    const { nim } = req.params;
    const { nama, prodi, angkatan } = req.body;

    // Pastikan ada minimal satu field yang ingin diperbarui
    const fields = ["nama", "prodi", "angkatan"];
    const providedFields = fields.filter((field) =>
      Object.prototype.hasOwnProperty.call(req.body, field)
    );

    if (providedFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Isi minimal satu field yang ingin diperbarui",
      });
    }

    const data = {};

    if (Object.prototype.hasOwnProperty.call(req.body, "nama")) {
      if (typeof nama !== "string" || !nama.trim()) {
        return res.status(400).json({
          success: false,
          message: "nama harus berupa teks yang tidak kosong",
        });
      }

      data.nama = nama.trim();
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "prodi")) {
      if (typeof prodi !== "string" || !prodi.trim()) {
        return res.status(400).json({
          success: false,
          message: "prodi harus berupa teks yang tidak kosong",
        });
      }

      data.prodi = prodi.trim();
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "angkatan")) {
      const tahun = Number(angkatan);

      if (
        angkatan === null ||
        angkatan === "" ||
        !Number.isInteger(tahun) ||
        tahun < 2000 ||
        tahun > new Date().getFullYear()
      ) {
        return res.status(400).json({
          success: false,
          message: "angkatan harus berupa tahun yang valid",
        });
      }

      data.angkatan = tahun;
    }

    const existing = await prisma.mahasiswa.findUnique({
      where: { nim },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Mahasiswa tidak ditemukan",
      });
    }

    const mahasiswa = await prisma.mahasiswa.update({
      where: { nim },
      data,
    });

    return res.status(200).json({
      success: true,
      message: "Data mahasiswa berhasil diperbarui",
      data: mahasiswa,
    });
  } catch (error) {
    console.error("Gagal memperbarui mahasiswa:", error);

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
});


app.delete("/mahasiswa/:nim", async (req, res) => {
  try {
    const { nim } = req.params;

    const existing = await prisma.mahasiswa.findUnique({
      where: { nim },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Mahasiswa tidak ditemukan",
      });
    }

    await prisma.mahasiswa.delete({
      where: { nim },
    });

    return res.status(200).json({
      success: true,
      message: "Mahasiswa berhasil dihapus",
      data: existing,
    });
  } catch (error) {
    console.error("Gagal menghapus mahasiswa:", error);

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
});


app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
