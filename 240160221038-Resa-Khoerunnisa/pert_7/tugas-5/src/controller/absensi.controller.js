
import * as absensiService from "../service/absensi.service.js";

const statusDiizinkan = ["Hadir", "Izin", "Sakit"];

const parseId = (value) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

const parseTanggal = (value) => {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
};

const validasiAbsensi = (body, partial = false) => {
  const errors = [];
  const fields = ["nama", "jabatan", "tanggal", "status"];

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return ["Body harus berupa object JSON"];
  }

  if (partial && Object.keys(body).length === 0) {
    errors.push("Data perubahan tidak boleh kosong");
  }

  if (Object.keys(body).some((field) => !fields.includes(field))) {
    errors.push("Terdapat field yang tidak diizinkan");
  }

  if (!partial) {
    for (const field of fields) {
      if (body[field] === undefined) {
        errors.push(`Field ${field} wajib diisi`);
      }
    }
  }

  if (body.nama !== undefined) {
    if (typeof body.nama !== "string" || !body.nama.trim()) {
      errors.push("Nama harus berupa teks dan tidak boleh kosong");
    } else if (body.nama.trim().length > 100) {
      errors.push("Nama maksimal 100 karakter");
    }
  }

  if (body.jabatan !== undefined) {
    if (typeof body.jabatan !== "string" || !body.jabatan.trim()) {
      errors.push("Jabatan harus berupa teks dan tidak boleh kosong");
    } else if (body.jabatan.trim().length > 100) {
      errors.push("Jabatan maksimal 100 karakter");
    }
  }

  if (body.tanggal !== undefined && !parseTanggal(body.tanggal)) {
    errors.push("Tanggal harus menggunakan format YYYY-MM-DD yang valid");
  }

  if (
    body.status !== undefined &&
    (typeof body.status !== "string" ||
      !statusDiizinkan.includes(body.status))
  ) {
    errors.push("Status harus Hadir, Izin, atau Sakit");
  }

  return errors;
};

// GET /absensi
export const getSemuaAbsensi = async (request, response) => {
  const { status, jabatan, tanggal } = request.query;

  if (
    (status !== undefined && typeof status !== "string") ||
    (jabatan !== undefined && typeof jabatan !== "string")
  ) {
    return response.status(400).json({
      success: false,
      message: "Filter tidak valid",
    });
  }

  if (tanggal !== undefined && !parseTanggal(tanggal)) {
    return response.status(400).json({
      success: false,
      message: "Format tanggal harus YYYY-MM-DD",
    });
  }

  const data = await absensiService.ambilSemuaAbsensi({
    status,
    jabatan,
    tanggal,
  });

  return response.status(200).json({
    success: true,
    message: "Daftar absensi berhasil diambil",
    total: data.length,
    data,
  });
};

// GET /absensi/:id
export const getAbsensiById = async (request, response) => {
  const id = parseId(request.params.id);

  if (!id) {
    return response.status(400).json({
      success: false,
      message: "ID absensi tidak valid",
    });
  }

  const data = await absensiService.ambilAbsensiById(id);

  if (!data) {
    return response.status(404).json({
      success: false,
      message: "Data absensi tidak ditemukan",
    });
  }

  return response.status(200).json({
    success: true,
    message: "Detail absensi berhasil diambil",
    data,
  });
};

// POST /absensi
export const postAbsensi = async (request, response) => {
  const errors = validasiAbsensi(request.body);

  if (errors.length > 0) {
    return response.status(400).json({
      success: false,
      message: "Data absensi tidak valid",
      details: errors,
    });
  }

  const data = await absensiService.buatAbsensi(request.body);

  return response.status(201).json({
    success: true,
    message: "Data absensi berhasil dibuat",
    data,
  });
};

// PATCH /absensi/:id
export const patchAbsensi = async (request, response) => {
  const id = parseId(request.params.id);

  if (!id) {
    return response.status(400).json({
      success: false,
      message: "ID absensi tidak valid",
    });
  }

  const errors = validasiAbsensi(request.body, true);

  if (errors.length > 0) {
    return response.status(400).json({
      success: false,
      message: "Data perubahan tidak valid",
      details: errors,
    });
  }

  const data = await absensiService.ubahAbsensi(id, request.body);

  if (!data) {
    return response.status(404).json({
      success: false,
      message: "Data absensi tidak ditemukan",
    });
  }

  return response.status(200).json({
    success: true,
    message: "Data absensi berhasil diperbarui",
    data,
  });
};

// DELETE /absensi/:id
export const deleteAbsensi = async (request, response) => {
  const id = parseId(request.params.id);

  if (!id) {
    return response.status(400).json({
      success: false,
      message: "ID absensi tidak valid",
    });
  }

  const berhasil = await absensiService.hapusAbsensi(id);

  if (!berhasil) {
    return response.status(404).json({
      success: false,
      message: "Data absensi tidak ditemukan",
    });
  }

  return response.status(204).send();
};
