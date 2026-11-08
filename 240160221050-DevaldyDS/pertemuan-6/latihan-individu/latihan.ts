import "dotenv/config";
import express from "express";
import { prisma } from "./client.ts";

const app = express();

app.use(express.json());

const port = Number(process.env.PORT ?? 3008);

// GET: Menampilkan pengguna berdasarkan NIM
app.get("/pengguna/:nim", async (req, res) => {
  try {
    const nim = req.params.nim;

    const pengguna = await prisma.pengguna.findUnique({
      where: { nim },
    });

    if (!pengguna) {
      return res.status(404).json({
        message: "Pengguna tidak ditemukan",
      });
    }

    return res.status(200).json(pengguna);
  } catch (error) {
    return res.status(500).json({
      message: "Terjadi kesalahan pada server",
    });
  }
});

// POST: Menambahkan pengguna
app.post("/pengguna", async (req, res) => {
  try {
    const { nim, nama, email, role } = req.body;

    if (!nim || !nama || !email || !role) {
      return res.status(400).json({
        message: "NIM, nama, email, dan role wajib diisi",
      });
    }

    const pengguna = await prisma.pengguna.create({
      data: { nim, nama, email, role },
    });

    return res.status(201).json({
      message: "Pengguna berhasil ditambahkan",
      data: pengguna,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Terjadi kesalahan pada server",
    });
  }
});

// PATCH: Memperbarui data pengguna
app.patch("/pengguna/:nim", async (req, res) => {
  try {
    const nim = req.params.nim;
    const { nama, email, role } = req.body;

    if (!nama && !email && !role) {
      return res.status(400).json({
        message: "Minimal satu field harus diubah",
      });
    }

    const pengguna = await prisma.pengguna.findUnique({
      where: { nim },
    });

    if (!pengguna) {
      return res.status(404).json({
        message: "Pengguna tidak ditemukan",
      });
    }

    const diperbarui = await prisma.pengguna.update({
      where: { nim },
      data: { nama, email, role },
    });

    return res.status(200).json({
      message: "Pengguna berhasil diperbarui",
      data: diperbarui,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Terjadi kesalahan pada server",
    });
  }
});

// DELETE: Menghapus pengguna berdasarkan NIM
app.delete("/pengguna/:nim", async (req, res) => {
  try {
    const nim = req.params.nim;

    const pengguna = await prisma.pengguna.findUnique({
      where: { nim },
    });

    if (!pengguna) {
      return res.status(404).json({
        message: "Pengguna tidak ditemukan",
      });
    }

    await prisma.pengguna.delete({
      where: { nim },
    });

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({
      message: "Terjadi kesalahan pada server",
    });
  }
});

app.listen(port, () => {
  console.log(`API Pengguna berjalan di http://localhost:${port}`);
});
