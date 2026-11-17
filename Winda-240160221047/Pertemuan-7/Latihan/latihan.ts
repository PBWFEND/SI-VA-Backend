
/**
 * Pertemuan 7 — Latihan Individu: Resource Pengguna
 * CRUD REST API menggunakan Express dan Prisma.
 */

import express, {
  type Request,
  type Response,
  type NextFunction
} from "express";

import { prisma } from "./client.ts";

// ==================================================
// SERVICE — Operasi database pengguna
// ==================================================

/**
 * TODO 1: Mengambil daftar pengguna berdasarkan NIM.
 */
export const ambilDaftarPengguna = async (nim?: string) => {
  return prisma.pengguna.findMany({
    where: nim ? { nim } : undefined
  });
};

/**
 * TODO 2: Membuat pengguna baru.
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
      role: data.role
    }
  });
};

/**
 * Operasi menghapus pengguna berdasarkan NIM.
 */
export const hapusPengguna = async (nim: string) => {
  return prisma.pengguna.deleteMany({
    where: { nim }
  });
};

// ==================================================
// ROUTE — Endpoint pengguna
// ==================================================

const penggunaRoutes = express.Router();

// GET /pengguna
// GET /pengguna?nim=12345
penggunaRoutes.get("/", async (request: Request, response: Response) => {
  const nimRaw = request.query.nim;
  const nimFilter = typeof nimRaw === "string" ? nimRaw : undefined;

  const data = await ambilDaftarPengguna(nimFilter);

  return response.status(200).json({
    success: true,
    message: "Daftar pengguna",
    data
  });
});

// TODO 3: POST /pengguna
penggunaRoutes.post("/", async (request: Request, response: Response) => {
  const { nim, nama, email, role } = request.body ?? {};

  // Validasi input
  if (
    typeof nim !== "string" || !nim.trim() ||
    typeof nama !== "string" || !nama.trim() ||
    typeof email !== "string" || !email.trim()
  ) {
    return response.status(400).json({
      success: false,
      message: "NIM, nama, dan email wajib diisi"
    });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return response.status(400).json({
      success: false,
      message: "Format email tidak valid"
    });
  }

  if (
    role !== undefined &&
    (typeof role !== "string" || !role.trim())
  ) {
    return response.status(400).json({
      success: false,
      message: "Role harus berupa teks yang tidak kosong"
    });
  }

  const data = await buatPengguna({
    nim: nim.trim(),
    nama: nama.trim(),
    email: email.trim(),
    ...(role !== undefined ? { role: role.trim() } : {})
  });

  return response.status(201).json({
    success: true,
    message: "Pengguna berhasil ditambahkan",
    data
  });
});

// TODO 4: DELETE /pengguna/:nim
penggunaRoutes.delete("/:nim", async (request: Request, response: Response) => {
  const nimRaw = request.params.nim;
const nim = typeof nimRaw === "string" ? nimRaw : nimRaw[0];

if (!nim) {
  return response.status(400).json({
    success: false,
    message: "NIM tidak valid"
  });
}

const hasil = await hapusPengguna(nim);

  if (hasil.count === 0) {
    return response.status(404).json({
      success: false,
      message: "Pengguna tidak ditemukan"
    });
  }

  return response.status(204).send();
});

// ==================================================
// APP — Menyusun aplikasi Express
// ==================================================

const app = express();

app.disable("x-powered-by");
app.use(express.json());

// Halaman informasi API
app.get("/", (_request: Request, response: Response) => {
  return response.status(200).json({
    success: true,
    message: "API Latihan Pengguna — Pertemuan 7",
    data: {
      resource: "pengguna",
      endpoints: [
        "GET /pengguna",
        "GET /pengguna?nim=12345",
        "POST /pengguna",
        "DELETE /pengguna/:nim"
      ]
    }
  });
});

// Memasang route pengguna
app.use("/pengguna", penggunaRoutes);

// Endpoint tidak ditemukan
app.use((_request: Request, response: Response) => {
  return response.status(404).json({
    success: false,
    message: "Endpoint tidak ditemukan"
  });
});

// Penanganan error
app.use((
  error: Error,
  _request: Request,
  response: Response,
  _next: NextFunction
) => {
  console.error("Kesalahan aplikasi:", error.message);

  return response.status(500).json({
    success: false,
    message: "Terjadi kesalahan pada server"
  });
});

// ==================================================
// SERVER
// ==================================================

const port = Number(process.env.PORT_LATIHAN ?? 3009);

const shutdown = async () => {
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

app.listen(port, () => {
  console.log(
    `API Latihan Pengguna berjalan di http://localhost:${port}`
  );
});
