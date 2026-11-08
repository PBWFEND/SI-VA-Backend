
/**
 * Pertemuan 7 — CRUD REST API: Controller
 * Menangani validasi input, HTTP status, dan response.
 */

import type { Request, Response } from "express";
import * as bukuService from "../service/buku.service.ts";

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

const sendError = (
  response: Response,
  statusCode: number,
  message: string,
  details?: unknown
) => {
  return response.status(statusCode).json({
    success: false,
    message,
    ...(details !== undefined ? { details } : {}),
  });
};

const bacaIdDariUrl = (
  idRaw: string | string[] | undefined
): number | null => {
  if (typeof idRaw !== "string") return null;

  const id = Number(idRaw);

  if (!Number.isInteger(id) || id < 1) return null;

  return id;
};

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
    errors.push("Field tahun wajib berupa bilangan bulat");
  } else if (tahun < 1000 || tahun > 2100) {
    errors.push("Field tahun berada di luar rentang wajar (1000–2100)");
  }

  if (
    stok !== undefined &&
    (typeof stok !== "number" || !Number.isInteger(stok) || stok < 0)
  ) {
    errors.push("Field stok harus bilangan bulat minimal 0");
  }

  return errors;
};

const validasiPatch = (body: Record<string, unknown>): string[] => {
  const errors: string[] = [];
  const { judul, penulis, tahun, stok } = body;

  if (
    judul !== undefined &&
    (typeof judul !== "string" || judul.trim() === "")
  ) {
    errors.push("Field judul, bila dikirim, wajib berupa string tidak kosong");
  }

  if (
    penulis !== undefined &&
    (typeof penulis !== "string" || penulis.trim() === "")
  ) {
    errors.push("Field penulis, bila dikirim, wajib berupa string tidak kosong");
  }

  if (
    tahun !== undefined &&
    (typeof tahun !== "number" || !Number.isInteger(tahun))
  ) {
    errors.push("Field tahun, bila dikirim, wajib berupa bilangan bulat");
  }

  if (
    stok !== undefined &&
    (typeof stok !== "number" || !Number.isInteger(stok) || stok < 0)
  ) {
    errors.push("Field stok, bila dikirim, wajib bilangan bulat minimal 0");
  }

  return errors;
};

const susunDataPatch = (body: Record<string, unknown>) => {
  const { judul, penulis, tahun, stok } = body;

  const data: {
    judul?: string;
    penulis?: string;
    tahun?: number;
    stok?: number;
  } = {};

  if (typeof judul === "string") data.judul = judul.trim();
  if (typeof penulis === "string") data.penulis = penulis.trim();
  if (typeof tahun === "number") data.tahun = tahun;
  if (typeof stok === "number") data.stok = stok;

  return data;
};

export const handlerDaftarBuku = async (
  request: Request,
  response: Response
) => {
  const penulisRaw = request.query.penulis;
  const penulisFilter =
    typeof penulisRaw === "string" ? penulisRaw : undefined;

  const minStokRaw = request.query.minStok;
  const minStokFilter =
    typeof minStokRaw === "string" ? Number(minStokRaw) : undefined;

  const data = await bukuService.ambilDaftarBuku({
    ...(penulisFilter !== undefined ? { penulis: penulisFilter } : {}),
    ...(minStokFilter !== undefined && !Number.isNaN(minStokFilter)
      ? { minStok: minStokFilter }
      : {}),
  });

  return sendSuccess(response, 200, "Daftar buku berhasil diambil", {
    total: data.length,
    data,
  });
};

export const handlerDetailBuku = async (
  request: Request,
  response: Response
) => {
  const id = bacaIdDariUrl(request.params.id);

  if (id === null) {
    return sendError(response, 400, "Parameter id harus berupa bilangan bulat");
  }

  const item = await bukuService.ambilBuku(id);

  if (!item) {
    return sendError(response, 404, "Buku tidak ditemukan");
  }

  return sendSuccess(response, 200, "Detail buku berhasil diambil", item);
};

export const handlerCreateBuku = async (
  request: Request,
  response: Response
) => {
  const body = (request.body ?? {}) as Record<string, unknown>;
  const errors = validasiCreate(body);

  if (errors.length > 0) {
    return sendError(response, 400, "Data buku tidak valid", errors);
  }

  const dataBuku = susunDataPatch(body);

  if (
    !dataBuku.judul ||
    !dataBuku.penulis ||
    dataBuku.tahun === undefined
  ) {
    return sendError(response, 400, "Data buku tidak lengkap", [
      "Field judul, penulis, dan tahun wajib terisi",
    ]);
  }

  const baru = await bukuService.buatBuku({
    judul: dataBuku.judul,
    penulis: dataBuku.penulis,
    tahun: dataBuku.tahun,
    ...(dataBuku.stok !== undefined ? { stok: dataBuku.stok } : {}),
  });

  return sendSuccess(response, 201, "Buku berhasil dibuat", baru);
};

export const handlerPatchBuku = async (
  request: Request,
  response: Response
) => {
  const id = bacaIdDariUrl(request.params.id);

  if (id === null) {
    return sendError(response, 400, "Parameter id harus berupa bilangan bulat");
  }

  const ada = await bukuService.ambilBuku(id);

  if (!ada) {
    return sendError(response, 404, "Buku tidak ditemukan");
  }

  const body = (request.body ?? {}) as Record<string, unknown>;
  const errors = validasiPatch(body);

  if (errors.length > 0) {
    return sendError(response, 400, "Data perubahan tidak valid", errors);
  }

  const diperbarui = await bukuService.perbaruiBuku(
    id,
    susunDataPatch(body)
  );

  return sendSuccess(response, 200, "Buku berhasil diperbarui", diperbarui);
};

export const handlerDeleteBuku = async (
  request: Request,
  response: Response
) => {
  const id = bacaIdDariUrl(request.params.id);

  if (id === null) {
    return sendError(response, 400, "Parameter id harus berupa bilangan bulat");
  }

  const ada = await bukuService.ambilBuku(id);

  if (!ada) {
    return sendError(response, 404, "Buku tidak ditemukan");
  }

  await bukuService.hapusBuku(id);

  return response.status(204).send();
};
