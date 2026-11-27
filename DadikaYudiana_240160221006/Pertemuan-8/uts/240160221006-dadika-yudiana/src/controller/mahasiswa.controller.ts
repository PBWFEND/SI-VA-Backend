
import type { Request, Response, NextFunction } from "express";
import { mahasiswaService } from "../service/mahasiswa.service.ts";
import type {
  MahasiswaFilter,
  CreateMahasiswaDTO,
  UpdateMahasiswaDTO,
} from "../service/mahasiswa.service.ts";

// Mengambil seluruh data mahasiswa dengan pilihan filter
export const getAll = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { prodi, angkatan } = req.query;
    const parameterFilter: MahasiswaFilter = {};
    const currentYear = new Date().getFullYear();

    // Validasi parameter prodi
    if (prodi !== undefined) {
      if (typeof prodi !== "string" || !prodi.trim()) {
        return res.status(400).json({
          success: false,
          message: "Parameter query 'prodi' harus berupa teks yang tidak kosong",
        });
      }

      parameterFilter.prodi = prodi.trim();
    }

    // Validasi parameter angkatan
    if (angkatan !== undefined) {
      const validYearFormat =
        typeof angkatan === "string" && /^\d{4}$/.test(angkatan);

      if (!validYearFormat) {
        return res.status(400).json({
          success: false,
          message: "Parameter query 'angkatan' harus berupa tahun 4 digit, misalnya 2024",
        });
      }

      const yearValue = Number(angkatan);

      if (
        !Number.isInteger(yearValue) ||
        yearValue < 2000 ||
        yearValue > currentYear
      ) {
        return res.status(400).json({
          success: false,
          message: `Tahun angkatan harus berada di antara 2000 dan ${currentYear}`,
        });
      }

      parameterFilter.angkatan = yearValue;
    }

    const dataMahasiswa = await mahasiswaService.findAll(parameterFilter);

    return res.status(200).json({
      success: true,
      total: dataMahasiswa.length,
      data: dataMahasiswa,
    });
  } catch (error) {
    next(error);
  }
};

// Menampilkan detail mahasiswa berdasarkan NIM
export const getByNim = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { nim } = req.params;

    if (typeof nim !== "string" || !nim.trim()) {
      return res.status(400).json({
        success: false,
        message: "NIM harus diisi dengan teks yang valid",
      });
    }

    const detailMahasiswa = await mahasiswaService.findByNim(nim.trim());

    return res.status(200).json({
      success: true,
      data: detailMahasiswa,
    });
  } catch (error) {
    next(error);
  }
};

// Menangani proses registrasi mahasiswa
export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const body = req.body;

    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body)
    ) {
      return res.status(400).json({
        success: false,
        message: "Request body harus berupa objek JSON yang valid",
      });
    }

    const { nim, nama, prodi, angkatan } = body;
    const currentYear = new Date().getFullYear();

    // NIM harus memiliki nilai berupa teks
    if (typeof nim !== "string" || !nim.trim()) {
      return res.status(400).json({
        success: false,
        message: "Field 'nim' wajib diisi berupa teks dan tidak boleh kosong",
      });
    }

    // Memastikan nama mahasiswa valid
    if (typeof nama !== "string" || !nama.trim()) {
      return res.status(400).json({
        success: false,
        message: "Field 'nama' wajib diisi berupa teks dan tidak boleh kosong",
      });
    }

    // Memastikan program studi sudah diisi
    if (typeof prodi !== "string" || !prodi.trim()) {
      return res.status(400).json({
        success: false,
        message: "Field 'prodi' wajib diisi berupa teks dan tidak boleh kosong",
      });
    }

    // Memastikan tahun angkatan sesuai ketentuan
    const validAngkatan =
      typeof angkatan === "number" &&
      Number.isInteger(angkatan) &&
      angkatan >= 2000 &&
      angkatan <= currentYear;

    if (!validAngkatan) {
      return res.status(400).json({
        success: false,
        message: `Field 'angkatan' harus berupa bilangan bulat antara 2000 dan ${currentYear}`,
      });
    }

    const payload: CreateMahasiswaDTO = {
      nim: nim.trim(),
      nama: nama.trim(),
      prodi: prodi.trim(),
      angkatan,
    };

    const mahasiswa = await mahasiswaService.create(payload);

    return res.status(201).json({
      success: true,
      message: "Mahasiswa berhasil ditambahkan",
      data: mahasiswa,
    });
  } catch (error) {
    next(error);
  }
};

// Menangani perubahan informasi mahasiswa
export const update = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const nim = req.params.nim;
    const body = req.body;

    if (typeof nim !== "string" || !nim.trim()) {
      return res.status(400).json({
        success: false,
        message: "NIM harus diisi dengan teks yang valid",
      });
    }

    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body)
    ) {
      return res.status(400).json({
        success: false,
        message: "Request body harus berupa objek JSON yang valid",
      });
    }

    // NIM tidak termasuk bagian yang dapat diperbarui
    if (Object.hasOwn(body, "nim")) {
      return res.status(400).json({
        success: false,
        message: "Field 'nim' tidak dapat diubah melalui endpoint PATCH",
      });
    }

    const allowedFields = ["nama", "prodi", "angkatan"];
    const selectedFields = allowedFields.filter((field) =>
      Object.hasOwn(body, field)
    );

    if (selectedFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Minimal satu field harus diisi untuk proses pembaruan",
      });
    }

    const updatePayload: UpdateMahasiswaDTO = {};
    const currentYear = new Date().getFullYear();

    // Validasi perubahan nama
    if (Object.hasOwn(body, "nama")) {
      const newName = body.nama;

      if (typeof newName !== "string" || !newName.trim()) {
        return res.status(400).json({
          success: false,
          message: "Field 'nama' harus berupa teks dan tidak boleh kosong",
        });
      }

      updatePayload.nama = newName.trim();
    }

    // Validasi perubahan program studi
    if (Object.hasOwn(body, "prodi")) {
      const newProdi = body.prodi;

      if (typeof newProdi !== "string" || !newProdi.trim()) {
        return res.status(400).json({
          success: false,
          message: "Field 'prodi' harus berupa teks dan tidak boleh kosong",
        });
      }

      updatePayload.prodi = newProdi.trim();
    }

    // Validasi perubahan tahun masuk
    if (Object.hasOwn(body, "angkatan")) {
      const newYear = body.angkatan;

      const isValidYear =
        typeof newYear === "number" &&
        Number.isInteger(newYear) &&
        newYear >= 2000 &&
        newYear <= currentYear;

      if (!isValidYear) {
        return res.status(400).json({
          success: false,
          message: `Field 'angkatan' harus berupa bilangan bulat antara 2000 dan ${currentYear}`,
        });
      }

      updatePayload.angkatan = newYear;
    }

    const updatedData = await mahasiswaService.update(
      nim.trim(),
      updatePayload
    );

    return res.status(200).json({
      success: true,
      message: "Informasi mahasiswa berhasil diperbarui",
      data: updatedData,
    });
  } catch (error) {
    next(error);
  }
};

// Menghapus data mahasiswa berdasarkan NIM
export const deleteMahasiswa = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const nim = req.params.nim;

    if (typeof nim !== "string" || !nim.trim()) {
      return res.status(400).json({
        success: false,
        message: "NIM harus diisi dengan teks yang valid",
      });
    }

    await mahasiswaService.delete(nim.trim());

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// Alias fungsi penghapusan
export { deleteMahasiswa as delete };

// Mengelompokkan seluruh method controller
export const mahasiswaController = {
  getAll,
  getByNim,
  create,
  update,
  delete: deleteMahasiswa,
};

export default mahasiswaController;
