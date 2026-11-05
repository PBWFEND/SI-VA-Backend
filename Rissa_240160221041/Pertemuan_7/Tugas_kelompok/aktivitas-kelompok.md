# Aktivitas Kelompok — Pertemuan 7

## Identitas Kelompok

**Kelompok:**

**Anggota Kelompok:**
1. Muhammad Mulky
2. Rissa Srihandita

Dokumen ini berisi hasil analisis, rancangan arsitektur, kode hasil *refactoring*, serta bahan presentasi kelompok untuk mengubah aplikasi REST API `buku` dari pola monolitik (`app.ts`) menjadi *Layered Architecture* (Routes-Controller-Service).

---

## Analisis Endpoint Lama 

Berdasarkan kode `app.ts` monolitik dari Pertemuan 6, dilakukan pemisahan tanggung jawab (*Separation of Concerns*) ke dalam 3 lapisan:

* **Route Layer (`routes`)**: Pendaftaran endpoint (`/buku`, `/buku/:id`) dan pemetaan metode HTTP (`GET`, `POST`, `PATCH`, `DELETE`).
* **Controller Layer (`controllers`)**: Parsing parameter/body (`req.params.id`, `req.body`), validasi ketersediaan input (`if (!judul...)`), pemanggilan Service, serta penentuan HTTP Status Code (`200`, `201`, `204`, `400`, `404`, `500`).
* **Service Layer (`services`)**: Eksekusi murni query Prisma ORM (`prisma.buku.findMany()`, `prisma.buku.findUnique()`, `prisma.buku.create()`, `prisma.buku.update()`, `prisma.buku.delete()`).

---

## Susun Rencana Refactoring 

### Struktur Folder Target (`pertemuan-07/src`)
```text
pertemuan-07/src/
├── config/
│   └── client.ts            --> Inisialisasi PrismaClient
├── services/
│   └── buku.service.ts      --> Logika bisnis & query Prisma
├── controllers/
│   └── buku.controller.ts   --> Validasi input & HTTP Response
├── routes/
│   └── buku.route.ts        --> Mapping endpoint & metode HTTP
└── app.ts                   --> Entry point aplikasi Express
```

---

## Hasil Refactoring Kode 

### A. Inisialisasi Client (`src/config/client.ts`)
```typescript
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();
```

---

### B. Service Layer (`src/services/buku.service.ts`)
```typescript
import { prisma } from "../config/client.js";

export const getAllBuku = async () => {
  return await prisma.buku.findMany();
};

export const getBukuById = async (id: number) => {
  return await prisma.buku.findUnique({ where: { id } });
};

export const createBuku = async (data: {
  judul: string;
  penulis: string;
  kategori: string;
  tersedia?: boolean;
  tahunTerbit: number;
}) => {
  return await prisma.buku.create({
    data: {
      judul: data.judul,
      penulis: data.penulis,
      kategori: data.kategori,
      tersedia: data.tersedia ?? true,
      tahunTerbit: Number(data.tahunTerbit)
    }
  });
};

export const updateBuku = async (
  id: number,
  data: {
    judul?: string;
    penulis?: string;
    kategori?: string;
    tersedia?: boolean;
    tahunTerbit?: number;
  }
) => {
  return await prisma.buku.update({
    where: { id },
    data: {
      ...(data.judul && { judul: data.judul }),
      ...(data.penulis && { penulis: data.penulis }),
      ...(data.kategori && { kategori: data.kategori }),
      ...(data.tersedia !== undefined && { tersedia: data.tersedia }),
      ...(data.tahunTerbit && { tahunTerbit: Number(data.tahunTerbit) })
    }
  });
};

export const deleteBuku = async (id: number) => {
  return await prisma.buku.delete({ where: { id } });
};
```

---

### C. Controller Layer (`src/controllers/buku.controller.ts`)
```typescript
import type { Request, Response } from "express";
import * as bukuService from "../services/buku.service.js";

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

export const handleGetAllBuku = async (_req: Request, res: Response) => {
  try {
    const data = await bukuService.getAllBuku();
    return sendSuccess(res, 200, "Berhasil mengambil semua data buku", data);
  } catch (error) {
    return sendError(res, 500, "Gagal mengambil data buku", error);
  }
};

export const handleGetBukuById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const buku = await bukuService.getBukuById(id);

    if (!buku) {
      return sendError(res, 404, "Buku tidak ditemukan");
    }

    return sendSuccess(res, 200, "Berhasil mengambil detail buku", buku);
  } catch (error) {
    return sendError(res, 500, "Gagal mengambil detail buku", error);
  }
};

export const handleCreateBuku = async (req: Request, res: Response) => {
  try {
    const { judul, penulis, kategori, tersedia, tahunTerbit } = req.body;

    if (!judul || !penulis || !kategori || tahunTerbit === undefined) {
      return sendError(res, 400, "Field judul, penulis, kategori, dan tahunTerbit wajib diisi");
    }

    const bukuBaru = await bukuService.createBuku({
      judul,
      penulis,
      kategori,
      tersedia,
      tahunTerbit
    });

    return sendSuccess(res, 201, "Buku berhasil ditambahkan", bukuBaru);
  } catch (error) {
    return sendError(res, 500, "Gagal menambahkan buku", error);
  }
};

export const handleUpdateBuku = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { judul, penulis, kategori, tersedia, tahunTerbit } = req.body;

    const bukuExisting = await bukuService.getBukuById(id);
    if (!bukuExisting) {
      return sendError(res, 404, "Buku tidak ditemukan");
    }

    const bukuUpdated = await bukuService.updateBuku(id, {
      judul,
      penulis,
      kategori,
      tersedia,
      tahunTerbit
    });

    return sendSuccess(res, 200, "Buku berhasil diperbarui", bukuUpdated);
  } catch (error) {
    return sendError(res, 500, "Gagal memperbarui buku", error);
  }
};

export const handleDeleteBuku = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    const bukuExisting = await bukuService.getBukuById(id);
    if (!bukuExisting) {
      return sendError(res, 404, "Buku tidak ditemukan");
    }

    await bukuService.deleteBuku(id);
    return res.status(204).send();
  } catch (error) {
    return sendError(res, 500, "Gagal menghapus buku", error);
  }
};
```

---

### D. Route Layer (`src/routes/buku.route.ts`)
```typescript
import { Router } from "express";
import {
  handleGetAllBuku,
  handleGetBukuById,
  handleCreateBuku,
  handleUpdateBuku,
  handleDeleteBuku
} from "../controllers/buku.controller.js";

const router = Router();

router.get("/", handleGetAllBuku);
router.get("/:id", handleGetBukuById);
router.post("/", handleCreateBuku);
router.patch("/:id", handleUpdateBuku);
router.delete("/:id", handleDeleteBuku);

export default router;
```

---

### E. App Entry Point (`src/app.ts`)
```typescript
import express from "express";
import bukuRouter from "./routes/buku.route.js";

const app = express();
const PORT = process.env.PORT || 3009;

app.disable("x-powered-by");
app.use(express.json());

// Mount Route
app.use("/buku", bukuRouter);

// 404 Handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Resource Endpoint tidak ditemukan" });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
```

---

## Alasan Teknis Refactoring ke Layered Architecture
1. **Separation of Concerns (SoC)**: Memisahkan secara tegas antara penanganan request HTTP (Controller) dan interaksi database Prisma (Service).
2. **Maintainability & Testability**: Memudahkan pengujian (*unit testing*) pada logika bisnis di Service tanpa harus menjalankan server HTTP Express.
3. **Reusability**: Logika bisnis pada `buku.service.ts` dapat dipanggil oleh controller lain, background job, atau CLI tanpa ada dependensi terhadap objek `req` dan `res`.

## Penamaan File
* **`buku.route.ts`**: Menangani routing modul `buku` secara independen.
* **`buku.controller.ts`**: Menerima input client, memvalidasi payload, mengembalikan format respons terstandar (`sendSuccess`/`sendError`), dan menentukan HTTP Status Code.
* **`buku.service.ts`**: Menjalankan query Prisma ORM secara aman dan terisolasi.

---

## Kesimpulan

1. **Kode Lebih Clean & Modular**: Proses refactoring dari monolitik `app.ts` ke pola 3 lapis (Routes-Controller-Service) membuat struktur proyek jauh lebih teratur dan mudah dipahami.
2. **Skalabilitas Aplikasi Terjaga**: Penambahan fitur baru di kemudian hari dapat dilakukan dengan menambah modul pada folder masing-masing tanpa mengganggu alur utama aplikasi pada `app.ts`.
3. **Standarisasi Handler & HTTP Status Code**: Pemisahan controller mempermudah pengelolaan penanganan error global serta pemetaan HTTP Status Code (`200`, `201`, `204`, `400`, `404`, `500`) yang konsisten.