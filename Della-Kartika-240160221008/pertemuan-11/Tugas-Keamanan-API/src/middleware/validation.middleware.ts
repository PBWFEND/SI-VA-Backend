import type { Request, Response, NextFunction } from "express";

export const VALID_STATUS = ["HADIR", "IZIN", "SAKIT", "ALPA"] as const;
export type StatusAbsensi = (typeof VALID_STATUS)[number];

export const validateAbsensiBody = (req: Request, res: Response, next: NextFunction) => {
  if (typeof req.body !== "object" || req.body === null || Array.isArray(req.body)) {
    return res.status(400).json({
      success: false,
      message: "Request body harus berupa JSON object yang valid",
    });
  }

  const { nim, namaMahasiswa, kelas, status, keterangan } = req.body;
  const errors: string[] = [];

  // Jika nim dikirimkan, validasi formatnya
  if (nim !== undefined) {
    if (typeof nim !== "string" || nim.trim() === "") {
      errors.push("Field 'nim' tidak boleh berupa string kosong");
    } else if (!/^\d{8,20}$/.test(nim.trim())) {
      errors.push("Format 'nim' harus berupa 8-20 digit angka murni");
    }
  }

  // Jika namaMahasiswa dikirimkan, validasi panjangnya
  if (namaMahasiswa !== undefined) {
    if (typeof namaMahasiswa !== "string" || namaMahasiswa.trim() === "") {
      errors.push("Field 'namaMahasiswa' tidak boleh kosong");
    } else if (namaMahasiswa.trim().length < 3) {
      errors.push("Panjang 'namaMahasiswa' terlalu pendek, minimal 3 karakter");
    } else if (namaMahasiswa.trim().length > 100) {
      errors.push("Panjang 'namaMahasiswa' melebihi batas maksimal 100 karakter");
    }
  }

  // Validasi Kelas (wajib diisi saat pencatatan)
  if (!kelas || typeof kelas !== "string" || kelas.trim() === "") {
    errors.push("Field 'kelas' wajib diisi dengan teks tidak kosong");
  } else if (kelas.trim().length < 2) {
    errors.push("Field 'kelas' minimal 2 karakter");
  }

  // Validasi Status Absensi
  if (!status || typeof status !== "string" || status.trim() === "") {
    errors.push(`Field 'status' wajib diisi (pilihan: ${VALID_STATUS.join(", ")})`);
  } else if (!VALID_STATUS.includes(status.trim().toUpperCase() as StatusAbsensi)) {
    errors.push(`Status absensi '${status}' tidak valid. Pilihan yang sah: ${VALID_STATUS.join(", ")}`);
  }

  // Validasi Keterangan opsional
  if (keterangan !== undefined && keterangan !== null) {
    if (typeof keterangan !== "string") {
      errors.push("Field 'keterangan' harus berupa teks");
    } else if (keterangan.trim().length > 255) {
      errors.push("Panjang 'keterangan' maksimal 255 karakter");
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validasi data absensi gagal",
      errors,
    });
  }

  req.body = {
    nim: typeof nim === "string" ? nim.trim() : undefined,
    namaMahasiswa: typeof namaMahasiswa === "string" ? namaMahasiswa.trim() : undefined,
    kelas: kelas.trim(),
    status: status.trim().toUpperCase() as StatusAbsensi,
    keterangan: keterangan && typeof keterangan === "string" ? keterangan.trim() : null,
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
    // Batasi panjang string pencarian untuk mencegah serangan DoS regex atau memory buffer
    if (req.query.search.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Parameter 'search' maksimal 100 karakter",
      });
    }
  }

  if (req.query.status !== undefined) {
    if (typeof req.query.status !== "string") {
      return res.status(400).json({
        success: false,
        message: "Parameter 'status' harus berupa string",
      });
    }
    const upper = req.query.status.trim().toUpperCase();
    if (!VALID_STATUS.includes(upper as StatusAbsensi)) {
      return res.status(400).json({
        success: false,
        message: `Filter status '${req.query.status}' tidak valid. Pilihan: ${VALID_STATUS.join(", ")}`,
      });
    }
  }

  next();
};

export const validationMiddlewares = {
  validateAbsensiBody,
  validateQuerySearch,
};

export default validationMiddlewares;

