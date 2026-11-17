import "dotenv/config";
import express from "express";
import { PrismaClient } from "./prisma/generated/client.ts";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const app = express();

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});

const prisma = new PrismaClient({ adapter });

app.use(express.json());

// 1. GET Collection - Mengambil Semua Buku
app.get("/buku", async (req, res) => {
  try {
    const semuaBuku = await prisma.buku.findMany({
      orderBy: { id: "asc" },
    });

    res.json({
      status: "success",
      data: semuaBuku,
    });
  } catch (error) {
    console.error("ERROR GET BUKU:", error);

    res.status(500).json({
      status: "error",
      message: "Gagal mengambil data buku",
    });
  }
});

// 2. GET Detail - Mengambil Buku Berdasarkan ID
app.get("/buku/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({
      status: "error",
      message: "ID harus berupa angka",
    });
  }

  try {
    const buku = await prisma.buku.findFirst({
      where: { id },
    });

    if (!buku) {
      return res.status(404).json({
        status: "error",
        message: "Buku tidak ditemukan",
      });
    }

    res.json({
      status: "success",
      data: buku,
    });
  } catch (error) {
    console.error("ERROR DETAIL BUKU:", error);

    res.status(500).json({
      status: "error",
      message: "Gagal mengambil detail buku",
    });
  }
});

// 3. POST - Menambahkan Buku Baru
app.post("/buku", async (req, res) => {
  const { judul, penulis, tahun, stok } = req.body;

  if (!judul || !penulis || typeof tahun !== "number") {
    return res.status(400).json({
      status: "error",
      message: "Field judul, penulis, dan tahun (angka) wajib diisi",
    });
  }

  try {
    const bukuBaru = await prisma.buku.create({
      data: {
        judul,
        penulis,
        tahun,
        stok: typeof stok === "number" ? stok : 0,
      },
    });

    res.status(201).json({
      status: "success",
      data: bukuBaru,
    });
  } catch (error) {
    console.error("ERROR TAMBAH BUKU:", error);

    res.status(500).json({
      status: "error",
      message: "Gagal menambahkan buku",
    });
  }
});

// 4. PATCH - Memperbarui Data Buku
app.patch("/buku/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({
      status: "error",
      message: "ID harus berupa angka",
    });
  }

  try {
    const adaBuku = await prisma.buku.findFirst({
      where: { id },
    });

    if (!adaBuku) {
      return res.status(404).json({
        status: "error",
        message: "Buku tidak ditemukan",
      });
    }

    const { judul, penulis, tahun, stok } = req.body;

    const bukuDiperbarui = await prisma.buku.update({
      where: { id },
      data: {
        ...(judul !== undefined && { judul }),
        ...(penulis !== undefined && { penulis }),
        ...(tahun !== undefined && { tahun }),
        ...(stok !== undefined && { stok }),
      },
    });

    res.json({
      status: "success",
      data: bukuDiperbarui,
    });
  } catch (error) {
    console.error("ERROR UPDATE BUKU:", error);

    res.status(500).json({
      status: "error",
      message: "Gagal memperbarui buku",
    });
  }
});

// 5. DELETE - Menghapus Buku
app.delete("/buku/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({
      status: "error",
      message: "ID harus berupa angka",
    });
  }

  try {
    const adaBuku = await prisma.buku.findFirst({
      where: { id },
    });

    if (!adaBuku) {
      return res.status(404).json({
        status: "error",
        message: "Buku tidak ditemukan",
      });
    }

    await prisma.buku.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error("ERROR DELETE BUKU:", error);

    res.status(500).json({
      status: "error",
      message: "Gagal menghapus buku",
    });
  }
});

// Menjalankan Server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});

export default app;
