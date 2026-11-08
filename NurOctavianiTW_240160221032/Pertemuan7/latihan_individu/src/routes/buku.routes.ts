/**
 * Pertemuan 7 — CRUD REST API: Route Resource
 * Tujuan: mengumpulkan seluruh endpoint resource buku dalam satu router,
 *         memudahkan pemeliharaan dan perpindahan path resource.
 *
 * Cara memakai di app.ts:
 *   app.use("/buku", bukuRoutes);
 *
 * Jalankan (melalui server.ts):
 *   node --experimental-strip-types server.ts
 */

import { Router } from "express";
import {
  handlerDaftarBuku,
  handlerDetailBuku,
  handlerCreateBuku,
  handlerPatchBuku,
  handlerDeleteBuku,
} from "../controller/buku.controller.ts";

const bukuRoutes = Router();

// Collection: semua buku
bukuRoutes.get("/", handlerDaftarBuku);

// Item: satu buku berdasarkan id
bukuRoutes.get("/:id", handlerDetailBuku);

// Create: membuat buku
bukuRoutes.post("/", handlerCreateBuku);

// Update sebagian: mengubah field tertentu
bukuRoutes.patch("/:id", handlerPatchBuku);

// Delete: hapus buku
bukuRoutes.delete("/:id", handlerDeleteBuku);

export { bukuRoutes };