/**
 * Pertemuan 7 — Latihan: Rework Resource Pengguna dengan Pola Lapis
 * Tujuan: memindahkan resource pengguna ke pola service/controller/routes
 *          seperti resource buku pada pertemuan ini.
 *
 * Jalankan:
 *    npx prisma migrate dev --name pengguna
 *    node --experimental-strip-types latihan.ts
 */

import express, { type Request, type Response } from "express";
import { prisma } from "./client.ts";

// ------------------------------------------------------------------
// SERVICE — operasi data pengguna. Kumpulkan seluruh query Prisma di sini.
// ------------------------------------------------------------------

/**
 * Mengambil daftar pengguna dengan filter nim.
 * TODO 1: implementasi menggunakan prisma.pengguna.findMany.
 */
export const ambilDaftarPengguna = async (nim?: string) => {
  return prisma.pengguna.findMany({
    where: nim ? { nim } : undefined,
  });
};

/**
 * Mengambil detail pengguna berdasarkan NIM.
 * Helper service untuk pengecekan keberadaan data (seperti pada DELETE).
 */
export const ambilPenggunaByNim = async (nim: string) => {
  return prisma.pengguna.findUnique({
    where: { nim },
  });
};

/**
 * Membuat pengguna baru.
 * TODO 2: implementasi menggunakan prisma.pengguna.create.
 */
export const buatPengguna = async (data: {
  nim: string;
  nama: string;
  email: string;
  role?: string;
}) => {
  return prisma.pengguna.create({
    data: {
      nim: data.nim,
      nama: data.nama,
      email: data.email,
      role: data.role ?? "MAHASISWA", // default role jika tidak diisi
    },
  });
};

/**
 * Menghapus pengguna berdasarkan NIM.
 * Helper service untuk TODO 4.
 */
export const hapusPengguna = async (nim: string) => {
  return prisma.pengguna.delete({
    where: { nim },
  });
};

// ------------------------------------------------------------------
// ROUTE — kelompokkan endpoint pengguna dalam satu router.
// ------------------------------------------------------------------

const penggunaRoutes = express.Router();

// 1. GET /pengguna (dengan query parameter nim)
penggunaRoutes.get("/", async (request: Request, response: Response) => {
  try {
    const nimRaw = request.query.nim;
    const nimFilter = typeof nimRaw === "string" ? nimRaw : undefined;
    
    // TODO 1: ganti pemanggilan langsung prisma di service agar controller tidak menyentuh Prisma Client.
    const data = await ambilDaftarPengguna(nimFilter);
    return response.status(200).json({ success: true, message: "Daftar pengguna", data });
  } catch (error) {
    return response.status(500).json({ success: false, message: "Gagal mengambil data pengguna", details: error });
  }
});

// 2. POST /pengguna (TODO 3: tambahkan endpoint POST /pengguna)
penggunaRoutes.post("/", async (request: Request, response: Response) => {
  try {
    const { nim, nama, email, role } = request.body;

    // Validasi input (memisahkan validasi di layer controller sebelum memanggil service)
    if (!nim || !nama || !email) {
      return response.status(400).json({
        success: false,
        message: "Field 'nim', 'nama', dan 'email' wajib diisi",
      });
    }

    // Cek apakah NIM sudah terdaftar
    const penggunaEksis = await ambilPenggunaByNim(nim);
    if (penggunaEksis) {
      return response.status(400).json({
        success: false,
        message: "NIM sudah terdaftar",
      });
    }

    const penggunaBaru = await buatPengguna({ nim, nama, email, role });
    return response.status(201).json({
      success: true,
      message: "Pengguna berhasil ditambahkan",
      data: penggunaBaru,
    });
  } catch (error) {
    return response.status(500).json({
      success: false,
      message: "Gagal menambahkan pengguna",
      details: error,
    });
  }
});

// 3. DELETE /pengguna/:nim (TODO 4: tambahkan endpoint DELETE /pengguna/:nim)
penggunaRoutes.delete("/:nim", async (request: Request, response: Response) => {
  try {
    const nim = request.params.nim as string;

    // Cek ketersediaan data pengguna
    const pengguna = await ambilPenggunaByNim(nim);
    if (!pengguna) {
      return response.status(404).json({
        success: false,
        message: "Pengguna tidak ditemukan",
      });
    }

    await hapusPengguna(nim);
    // Return 204 No Content bila sukses
    return response.status(204).send();
  } catch (error) {
    return response.status(500).json({
      success: false,
      message: "Gagal menghapus pengguna",
      details: error,
    });
  }
});

// ------------------------------------------------------------------
// APP — susun semuanya.
// ------------------------------------------------------------------

const app = express();
app.disable("x-powered-by");
app.use(express.json());

app.get("/", (_request: Request, response: Response) => {
  response.status(200).json({
    success: true,
    message: "API Latihan Pengguna — Pertemuan 7",
    data: { resource: "pengguna" },
  });
});

app.use("/pengguna", penggunaRoutes);

const port = Number(process.env.PORT_LATIHAN ?? 3009);

const shutdown = async () => {
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

app.listen(port, () => {
  console.log(`API Latihan Pengguna berjalan di http://localhost:${port}`);
});