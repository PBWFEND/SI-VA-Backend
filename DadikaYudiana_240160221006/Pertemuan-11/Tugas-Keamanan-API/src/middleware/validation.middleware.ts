import type { Request, Response, NextFunction } from "express";

export const validateMahasiswaBody = (req: Request, res: Response, next: NextFunction) => {
  if (typeof req.body !== "object" || req.body === null || Array.isArray(req.body)) {
    return res.status(400).json({
      success: false,
      message: "Request body harus berupa JSON object yang valid",
    });
  }

  const { nim, nama, prodi, angkatan } = req.body;
  const errors: string[] = [];

  // Validasi NIM (8-20 digit angka)
  if (typeof nim !== "string" || nim.trim() === "") {
    errors.push("Field 'nim' wajib diisi dengan teks tidak kosong");
  } else if (!/^\d{8,20}$/.test(nim.trim())) {
    errors.push("Format 'nim' harus berupa 8-20 digit angka murni");
  }

  // Validasi Nama (panjang 3-100 karakter)
  if (typeof nama !== "string" || nama.trim() === "") {
    errors.push("Field 'nama' wajib diisi dengan teks tidak kosong");
  } else if (nama.trim().length < 3) {
    errors.push("Panjang 'nama' terlalu pendek, minimal 3 karakter");
  } else if (nama.trim().length > 100) {
    errors.push("Panjang 'nama' melebihi batas maksimal 100 karakter");
  }

  // Validasi Prodi
  if (typeof prodi !== "string" || prodi.trim() === "") {
    errors.push("Field 'prodi' wajib diisi dengan teks tidak kosong");
  }

  // Validasi Angkatan
  const angkatanNum = Number(angkatan);
  if (!Number.isSafeInteger(angkatanNum) || angkatanNum < 2000 || angkatanNum > 2100) {
    errors.push("Field 'angkatan' harus berupa tahun integer valid antara 2000 dan 2100");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validasi data mahasiswa gagal",
      errors,
    });
  }

  req.body = {
    nim: String(nim).trim(),
    nama: String(nama).trim(),
    prodi: String(prodi).trim(),
    angkatan: angkatanNum,
  };

  next();
};

export const validateQuerySearch = (req: Request, res: Response, next: NextFunction) => {
  if (req.query.search !== undefined) {
    if (typeof req.query.search !== "string") {
      return res.status(400).json({
        success: false,
        message: "Parameter 'search' harus berupa string",
      });
    }
    if (req.query.search.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Parameter 'search' melebihi panjang maksimal 100 karakter",
      });
    }
  }
  next();
};

export default {
  validateMahasiswaBody,
  validateQuerySearch,
};

