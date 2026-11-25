import { Router } from "express";

import {
  getBuku,
  getBukuDetail,
  tambahBuku,
  ubahBuku,
  hapusBuku,
} from "../controller/buku.controller.js";

import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/auth.middleware.js";

import {
  validateBukuId,
  validateCreateBuku,
  validateUpdateBuku,
  handleValidationErrors,
} from "../middleware/validation.middleware.js";

import { postBukuLimiter } from "../middleware/rate-limit.middleware.js";

const router = Router();

/**
 * Semua endpoint buku wajib login.
 */
router.use(authenticateToken);

/**
 * GET /buku
 * Mengambil seluruh data buku.
 */
router.get("/", getBuku);

/**
 * GET /buku/:id
 * Mengambil detail buku berdasarkan ID.
 */
router.get("/:id", validateBukuId, handleValidationErrors, getBukuDetail);

/**
 * POST /buku
 * Menambahkan buku baru.
 * Khusus admin.
 * Maksimal 3 request dalam 10 detik.
 */
router.post(
  "/",
  authorizeRoles("admin"),
  postBukuLimiter,
  validateCreateBuku,
  handleValidationErrors,
  tambahBuku,
);

/**
 * PATCH /buku/:id
 * Mengubah data buku.
 * Khusus admin.
 */
router.patch(
  "/:id",
  authorizeRoles("admin"),
  validateBukuId,
  validateUpdateBuku,
  handleValidationErrors,
  ubahBuku,
);

/**
 * DELETE /buku/:id
 * Menghapus data buku.
 * Khusus admin.
 */
router.delete(
  "/:id",
  authorizeRoles("admin"),
  validateBukuId,
  handleValidationErrors,
  hapusBuku,
);

export default router;
