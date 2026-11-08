import type { Request, Response } from "express";
import * as bukuService from "../service/buku.service.ts";

// Response sukses
const sendSuccess = (
  response: Response,
  statusCode: number,
  message: string,
  data: unknown
) => {
  return response.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

// Response error
const sendError = (
  response: Response,
  statusCode: number,
  message: string,
  details?: unknown
) => {
  return response.status(statusCode).json({
    success: false,
    message,
    ...(details !== undefined && { details }),
  });
};

// Validasi ID
const bacaIdDariUrl = (
  idRaw: string | string[] | undefined
): number | null => {
  if (typeof idRaw !== "string") return null;

  const id = Number(idRaw);

  if (!Number.isInteger(id) || id < 1) return null;

  return id;
};

// Validasi data POST
const validasiCreate = (body: Record<string, unknown>) => {
  const errors: string[] = [];
  const { judul, penulis, tahun, stok } = body;

  if (typeof judul !== "string" || judul.trim() === "") {
    errors.push("Field judul wajib diisi");
  }

  if (typeof penulis !== "string" || penulis.trim() === "") {
    errors.push("Field penulis wajib diisi");
  }

  if (typeof tahun !== "number" || !Number.isInteger(tahun)) {
    errors.push("Field tahun harus berupa bilangan bulat");
  } else if (tahun < 1000 || tahun > 2100) {
    errors.push("Field tahun harus antara 1000 sampai 2100");
  }

  if (
    typeof stok !== "number" ||
    !Number.isInteger(stok) ||
    stok < 0
  ) {
    errors.push("Field stok harus bilangan bulat minimal 0");
  }

  return errors;
};

// Validasi data PATCH
const validasiPatch = (body: Record<string, unknown>) => {
  const errors: string[] = [];
  const { judul, penulis, tahun, stok } = body;

  if (Object.keys(body).length === 0) {
    errors.push("Data perubahan tidak boleh kosong");
  }

  if (judul !== undefined &&
    (typeof judul !== "string" || judul.trim() === "")) {
    errors.push("Field judul harus berupa teks dan tidak boleh kosong");
  }

  if (penulis !== undefined &&
    (typeof penulis !== "string" || penulis.trim() === "")) {
    errors.push("Field penulis harus berupa teks dan tidak boleh kosong");
  }

  if (tahun !== undefined &&
    (typeof tahun !== "number" || !Number.isInteger(tahun) || tahun < 1000 || tahun > 2100)) {
    errors.push("Field tahun harus bilangan bulat antara 1000 sampai 2100");
  }

  if (stok !== undefined &&
    (typeof stok !== "number" || !Number.isInteger(stok) || stok < 0)) {
    errors.push("Field stok harus bilangan bulat minimal 0");
  }

  const fieldDiizinkan = ["judul", "penulis", "tahun", "stok"];
  const fieldTidakDikenal = Object.keys(body).find(
    (field) => !fieldDiizinkan.includes(field)
  );

  if (fieldTidakDikenal) {
    errors.push(`Field '${fieldTidakDikenal}' tidak diizinkan`);
  }

  return errors;
};

// GET semua buku
export const handlerDaftarBuku = async (
  _request: Request,
  response: Response
) => {
  const data = await bukuService.getAllBuku();

  return sendSuccess(response, 200, "Daftar buku berhasil diambil", {
    total: data.length,
    data,
  });
};

// GET detail buku
export const handlerDetailBuku = async (
  request: Request,
  response: Response
) => {
  const id = bacaIdDariUrl(request.params.id);

  if (id === null) {
    return sendError(response, 400, "ID buku tidak valid");
  }

  const data = await bukuService.getBukuById(id);

  if (!data) {
    return sendError(response, 404, "Buku tidak ditemukan");
  }

  return sendSuccess(response, 200, "Detail buku berhasil diambil", data);
};

// POST tambah buku
export const handlerCreateBuku = async (
  request: Request,
  response: Response
) => {
  const body = (request.body ?? {}) as Record<string, unknown>;
  const errors = validasiCreate(body);

  if (errors.length > 0) {
    return sendError(response, 400, "Data buku tidak valid", errors);
  }

  const data = await bukuService.createBuku({
    judul: (body.judul as string).trim(),
    penulis: (body.penulis as string).trim(),
    tahun: body.tahun as number,
    stok: body.stok as number,
  });

  return sendSuccess(response, 201, "Buku berhasil ditambahkan", data);
};

// PATCH update buku
export const handlerPatchBuku = async (
  request: Request,
  response: Response
) => {
  const id = bacaIdDariUrl(request.params.id);

  if (id === null) {
    return sendError(response, 400, "ID buku tidak valid");
  }

  const ada = await bukuService.getBukuById(id);

  if (!ada) {
    return sendError(response, 404, "Buku tidak ditemukan");
  }

  const body = (request.body ?? {}) as Record<string, unknown>;
  const errors = validasiPatch(body);

  if (errors.length > 0) {
    return sendError(response, 400, "Data perubahan tidak valid", errors);
  }

  const dataUpdate: {
    judul?: string;
    penulis?: string;
    tahun?: number;
    stok?: number;
  } = {};

  if (typeof body.judul === "string") {
    dataUpdate.judul = body.judul.trim();
  }

  if (typeof body.penulis === "string") {
    dataUpdate.penulis = body.penulis.trim();
  }

  if (typeof body.tahun === "number") {
    dataUpdate.tahun = body.tahun;
  }

  if (typeof body.stok === "number") {
    dataUpdate.stok = body.stok;
  }

  const data = await bukuService.updateBuku(id, dataUpdate);

  return sendSuccess(response, 200, "Buku berhasil diperbarui", data);
};

// DELETE buku
export const handlerDeleteBuku = async (
  request: Request,
  response: Response
) => {
  const id = bacaIdDariUrl(request.params.id);

  if (id === null) {
    return sendError(response, 400, "ID buku tidak valid");
  }

  const ada = await bukuService.getBukuById(id);

  if (!ada) {
    return sendError(response, 404, "Buku tidak ditemukan");
  }

  await bukuService.deleteBuku(id);

  return response.status(204).send();
};