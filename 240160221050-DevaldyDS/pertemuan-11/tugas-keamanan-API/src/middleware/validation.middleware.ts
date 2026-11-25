import { body, param, validationResult } from "express-validator";
import type { Request, Response, NextFunction } from "express";

/**
 * MIDDLEWARE PEMERIKSA HASIL VALIDASI
 *
 * Menghentikan request apabila terdapat input
 * yang tidak sesuai dengan aturan validasi.
 */
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validasi input gagal",
      errors: errors.array().map((error) => ({
        field: error.type === "field" ? error.path : "body",
        message: error.msg,
      })),
    });
  }

  next();
};

/**
 * VALIDASI ID BUKU
 * ID harus berupa bilangan bulat positif.
 */
export const validateBukuId = [
  param("id")
    .matches(/^[1-9]\d*$/)
    .withMessage("ID harus berupa bilangan bulat positif"),
];

/**
 * VALIDASI TAMBAH BUKU (POST)
 *
 * judul   : string, 3-150 karakter
 * penulis : string, 3-100 karakter
 * tahun   : integer, 1000-2100
 * stok    : integer, minimal 0 (opsional)
 */
export const validateCreateBuku = [
  body().custom((value) => {
    if (value === null || typeof value !== "object" || Array.isArray(value)) {
      throw new Error("Body harus berupa object JSON");
    }

    const allowedFields = ["judul", "penulis", "tahun", "stok"];
    const unknownFields = Object.keys(value).filter(
      (key) => !allowedFields.includes(key),
    );

    if (unknownFields.length > 0) {
      throw new Error(`Field tidak diizinkan: ${unknownFields.join(", ")}`);
    }

    return true;
  }),

  body("judul")
    .isString()
    .withMessage("Judul harus berupa teks")
    .bail()
    .trim()
    .isLength({ min: 3, max: 150 })
    .withMessage("Judul harus terdiri dari 3-150 karakter"),

  body("penulis")
    .isString()
    .withMessage("Penulis harus berupa teks")
    .bail()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Penulis harus terdiri dari 3-100 karakter"),

  body("tahun").custom((value) => {
    if (
      typeof value !== "number" ||
      !Number.isInteger(value) ||
      value < 1000 ||
      value > 2100
    ) {
      throw new Error("Tahun harus berupa integer antara 1000-2100");
    }

    return true;
  }),

  body("stok")
    .optional({ values: "undefined" })
    .custom((value) => {
      if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
        throw new Error("Stok harus berupa integer minimal 0");
      }

      return true;
    }),
];

/**
 * VALIDASI UPDATE BUKU (PATCH)
 *
 * Minimal satu field harus dikirim.
 * Hanya field yang diizinkan yang dapat diubah.
 */
export const validateUpdateBuku = [
  body().custom((value) => {
    if (value === null || typeof value !== "object" || Array.isArray(value)) {
      throw new Error("Body harus berupa object JSON");
    }

    const allowedFields = ["judul", "penulis", "tahun", "stok"];
    const keys = Object.keys(value);

    if (keys.length === 0) {
      throw new Error("Minimal satu field harus dikirim");
    }

    const unknownFields = keys.filter((key) => !allowedFields.includes(key));

    if (unknownFields.length > 0) {
      throw new Error(`Field tidak diizinkan: ${unknownFields.join(", ")}`);
    }

    return true;
  }),

  body("judul")
    .optional({ values: "undefined" })
    .isString()
    .withMessage("Judul harus berupa teks")
    .bail()
    .trim()
    .isLength({ min: 3, max: 150 })
    .withMessage("Judul harus terdiri dari 3-150 karakter"),

  body("penulis")
    .optional({ values: "undefined" })
    .isString()
    .withMessage("Penulis harus berupa teks")
    .bail()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Penulis harus terdiri dari 3-100 karakter"),

  body("tahun")
    .optional({ values: "undefined" })
    .custom((value) => {
      if (
        typeof value !== "number" ||
        !Number.isInteger(value) ||
        value < 1000 ||
        value > 2100
      ) {
        throw new Error("Tahun harus berupa integer antara 1000-2100");
      }

      return true;
    }),

  body("stok")
    .optional({ values: "undefined" })
    .custom((value) => {
      if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
        throw new Error("Stok harus berupa integer minimal 0");
      }

      return true;
    }),
];
