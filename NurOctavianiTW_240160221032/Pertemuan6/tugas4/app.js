import "dotenv/config";
import express from "express";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "./prisma/generated/client.ts";

const app = express();

app.use(express.json());
app.disable("x-powered-by");

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

// Middleware untuk mencatat request
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidBook(data, partial = false) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return "Body harus berupa objek JSON.";
  }

  const allowedFields = ["judul", "penulis", "tahun", "stok"];
  const fields = Object.keys(data);

  if (fields.length === 0) {
    return "Data tidak boleh kosong.";
  }

  const unknown = fields.find((field) => !allowedFields.includes(field));

  if (unknown) {
    return `Field '${unknown}' tidak diizinkan.`;
  }

  for (const field of fields) {
    const value = data[field];

    if (field === "tahun" || field === "stok") {
      if (!Number.isInteger(value)) {
        return `Field '${field}' harus berupa bilangan bulat.`;
      }

      if (field === "tahun" && value <= 0) {
        return "Tahun harus lebih besar dari 0.";
      }

      if (field === "stok" && value < 0) {
        return "Stok tidak boleh kurang dari 0.";
      }
    } else if (!isNonEmptyString(value)) {
      return `Field '${field}' harus berupa teks dan tidak boleh kosong.`;
    }
  }

  if (!partial) {
    const missing = allowedFields.find(
      (field) => data[field] === undefined
    );

    if (missing) {
      return `Field '${missing}' wajib diisi.`;
    }
  }

  return null;
}

function isValidMember(data, partial = false) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return "Body harus berupa objek JSON.";
  }

  const allowedFields = ["nama", "nim", "jurusan"];
  const fields = Object.keys(data);

  if (fields.length === 0) {
    return "Data tidak boleh kosong.";
  }

  const unknown = fields.find((field) => !allowedFields.includes(field));

  if (unknown) {
    return `Field '${unknown}' tidak diizinkan.`;
  }

  for (const field of fields) {
    if (!isNonEmptyString(data[field])) {
      return `Field '${field}' harus berupa teks dan tidak boleh kosong.`;
    }
  }

  if (!partial) {
    const missing = allowedFields.find(
      (field) => !isNonEmptyString(data[field])
    );

    if (missing) {
      return `Field '${missing}' wajib diisi.`;
    }
  }

  return null;
}

function cleanStrings(data) {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [
      key,
      typeof value === "string" ? value.trim() : value,
    ])
  );
}

// ==================== BUKU ====================

// GET semua buku, dengan filter opsional
app.get("/buku", async (req, res, next) => {
  try {
    const where = {};

    if (req.query.judul) {
      where.judul = {
        contains: String(req.query.judul),
      };
    }

    if (req.query.penulis) {
      where.penulis = {
        contains: String(req.query.penulis),
      };
    }

    const data = await prisma.buku.findMany({ where });

    res.json({
      success: true,
      total: data.length,
      data,
    });
  } catch (error) {
    next(error);
  }
});

// GET buku berdasarkan ID
app.get("/buku/:id", async (req, res, next) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      message: "ID buku harus berupa bilangan bulat positif.",
    });
  }

  try {
    const data = await prisma.buku.findUnique({
      where: { id },
    });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Buku tidak ditemukan.",
      });
    }

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// POST buku
app.post("/buku", async (req, res, next) => {
  const error = isValidBook(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      message: error,
    });
  }

  try {
    const data = await prisma.buku.create({
      data: cleanStrings(req.body),
    });

    res.status(201).json({
      success: true,
      message: "Buku berhasil ditambahkan.",
      data,
    });
  } catch (error) {
    next(error);
  }
});

// PUT buku: mengganti seluruh data
app.put("/buku/:id", async (req, res, next) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      message: "ID buku harus berupa bilangan bulat positif.",
    });
  }

  const error = isValidBook(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      message: error,
    });
  }

  try {
    const data = await prisma.buku.update({
      where: { id },
      data: cleanStrings(req.body),
    });

    res.json({
      success: true,
      message: "Data buku berhasil diganti.",
      data,
    });
  } catch (error) {
    next(error);
  }
});

// PATCH buku: mengubah sebagian data
app.patch("/buku/:id", async (req, res, next) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      message: "ID buku harus berupa bilangan bulat positif.",
    });
  }

  const error = isValidBook(req.body, true);

  if (error) {
    return res.status(400).json({
      success: false,
      message: error,
    });
  }

  try {
    const data = await prisma.buku.update({
      where: { id },
      data: cleanStrings(req.body),
    });

    res.json({
      success: true,
      message: "Data buku berhasil diperbarui.",
      data,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE buku
app.delete("/buku/:id", async (req, res, next) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      message: "ID buku harus berupa bilangan bulat positif.",
    });
  }

  try {
    await prisma.buku.delete({ where: { id } });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

// ==================== ANGGOTA ====================

// GET semua anggota
app.get("/anggota", async (req, res, next) => {
  try {
    const data = await prisma.anggota.findMany();

    res.json({
      success: true,
      total: data.length,
      data,
    });
  } catch (error) {
    next(error);
  }
});

// GET anggota berdasarkan ID
app.get("/anggota/:id", async (req, res, next) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      message: "ID anggota harus berupa bilangan bulat positif.",
    });
  }

  try {
    const data = await prisma.anggota.findUnique({
      where: { id },
    });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Anggota tidak ditemukan.",
      });
    }

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// POST anggota
app.post("/anggota", async (req, res, next) => {
  const error = isValidMember(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      message: error,
    });
  }

  try {
    const data = await prisma.anggota.create({
      data: cleanStrings(req.body),
    });

    res.status(201).json({
      success: true,
      message: "Anggota berhasil ditambahkan.",
      data,
    });
  } catch (error) {
    next(error);
  }
});

// PUT anggota: mengganti seluruh data
app.put("/anggota/:id", async (req, res, next) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      message: "ID anggota harus berupa bilangan bulat positif.",
    });
  }

  const error = isValidMember(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      message: error,
    });
  }

  try {
    const data = await prisma.anggota.update({
      where: { id },
      data: cleanStrings(req.body),
    });

    res.json({
      success: true,
      message: "Data anggota berhasil diganti.",
      data,
    });
  } catch (error) {
    next(error);
  }
});

// PATCH anggota: mengubah sebagian data
app.patch("/anggota/:id", async (req, res, next) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      message: "ID anggota harus berupa bilangan bulat positif.",
    });
  }

  const error = isValidMember(req.body, true);

  if (error) {
    return res.status(400).json({
      success: false,
      message: error,
    });
  }

  try {
    const data = await prisma.anggota.update({
      where: { id },
      data: cleanStrings(req.body),
    });

    res.json({
      success: true,
      message: "Data anggota berhasil diperbarui.",
      data,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE anggota
app.delete("/anggota/:id", async (req, res, next) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      message: "ID anggota harus berupa bilangan bulat positif.",
    });
  }

  try {
    await prisma.anggota.delete({ where: { id } });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

// 404 untuk endpoint yang tidak tersedia
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint tidak ditemukan.",
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
      message: "Data duplikat. NIM atau data unik lainnya sudah digunakan.",
    });
  }

  if (error.code === "P2003") {
    return res.status(400).json({
      success: false,
      message: "Data masih memiliki relasi yang digunakan.",
    });
  }

  if (error.code === "P2025") {
    return res.status(404).json({
      success: false,
      message: "Data tidak ditemukan.",
    });
  }

  if (
    error instanceof SyntaxError &&
    error.status === 400 &&
    "body" in error
  ) {
    return res.status(400).json({
      success: false,
      message: "Format JSON tidak valid.",
    });
  }

  console.error(error);

  res.status(500).json({
    success: false,
    message: "Terjadi kesalahan pada server.",
  });
});

export default app;