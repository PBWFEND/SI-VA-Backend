import express from 'express';
import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3009;

app.disable('x-powered-by');
app.use(express.json());

// Helper Response
const sendSuccess = (res: Response, statusCode: number, message: string, data?: unknown) => {
  return res.status(statusCode).json({ success: true, message, data });
};

const sendError = (res: Response, statusCode: number, message: string, details?: unknown) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(details !== undefined ? { details } : {})
  });
};

// 1. GET ALL
app.get('/buku', async (_req: Request, res: Response) => {
  try {
    const data = await prisma.buku.findMany();
    return sendSuccess(res, 200, "Berhasil mengambil semua data buku", data);
  } catch (error) {
    return sendError(res, 500, "Gagal mengambil data buku", error);
  }
});

// 2. GET DETAIL BY ID
app.get('/buku/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const buku = await prisma.buku.findUnique({ where: { id } });

    if (!buku) {
      return sendError(res, 404, "Buku tidak ditemukan");
    }

    return sendSuccess(res, 200, "Berhasil mengambil detail buku", buku);
  } catch (error) {
    return sendError(res, 500, "Gagal mengambil detail buku", error);
  }
});

// 3. POST (CREATE BUKU)
app.post('/buku', async (req: Request, res: Response) => {
  try {
    const { judul, penulis, kategori, tersedia, tahunTerbit } = req.body;

    if (!judul || !penulis || !kategori || tahunTerbit === undefined) {
      return sendError(res, 400, "Field judul, penulis, kategori, dan tahunTerbit wajib diisi");
    }

    const bukuBaru = await prisma.buku.create({
      data: {
        judul,
        penulis,
        kategori,
        tersedia: tersedia ?? true,
        tahunTerbit: Number(tahunTerbit)
      }
    });

    return sendSuccess(res, 201, "Buku berhasil ditambahkan", bukuBaru);
  } catch (error) {
    return sendError(res, 500, "Gagal menambahkan buku", error);
  }
});

// 4. PATCH (UPDATE BUKU)
app.patch('/buku/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { judul, penulis, kategori, tersedia, tahunTerbit } = req.body;

    const buku = await prisma.buku.findUnique({ where: { id } });
    if (!buku) {
      return sendError(res, 404, "Buku tidak ditemukan");
    }

    const bukuUpdated = await prisma.buku.update({
      where: { id },
      data: {
        ...(judul && { judul }),
        ...(penulis && { penulis }),
        ...(kategori && { kategori }),
        ...(tersedia !== undefined && { tersedia }),
        ...(tahunTerbit && { tahunTerbit: Number(tahunTerbit) })
      }
    });

    return sendSuccess(res, 200, "Buku berhasil diperbarui", bukuUpdated);
  } catch (error) {
    return sendError(res, 500, "Gagal memperbarui buku", error);
  }
});

// 5. DELETE BUKU
app.delete('/buku/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    const buku = await prisma.buku.findUnique({ where: { id } });
    if (!buku) {
      return sendError(res, 404, "Buku tidak ditemukan");
    }

    await prisma.buku.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    return sendError(res, 500, "Gagal menghapus buku", error);
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});