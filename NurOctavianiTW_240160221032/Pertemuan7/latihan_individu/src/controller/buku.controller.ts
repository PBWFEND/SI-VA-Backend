/**
 * Pertemuan 7 — CRUD REST API: Controller
 * Tujuan: menangani lapisan HTTP — validasi input, kode status, dan
 *         pembentukan response — tanpa menyentuh database secara langsung.
 *
 * Konvensi:
 * - Setiap handler menerima (request, response) dan memanggil service.
 * - Validasi input dilakukan di sini, bukan di service. Lapisan
 *   pertahan pertama terhadap data tidak valid adalah endpoint; bila
 *   lolos endpoint, service boleh mengandalkan input yang sudah teruji.
 * - Response memakai struktur seragam { success, message, data? }
 *   yang sudah ditetapkan sejak Pertemuan 5 (lihat code/pertemuan-05).
 *
 * Jalankan:
 *   Lihat server.ts — file ini diekspor dan disusun oleh app.ts.
 */

import type { Request, Response } from "express";
import * as bukuService from "../service/buku.service.ts";

/** Kirim response sukses — { success: true, message, data }. */
const sendSuccess = (response: Response, statusCode: number, message: string, data: unknown) => {
  return response.status(statusCode).json({ success: true, message, data });
};

/**
 * Kirim response error — { success: false, message, details? }.
 * `details` disertakan hanya bila ada (mis. daftar error validasi).
 */
const sendError = (response: Response, statusCode: number, message: string, details?: unknown) => {
  return response.status(statusCode).json({ success: false, message, ...(details && { details }) });
};

/**
 * Helper validasi id dari URL.
 * `request.params` dapat bertipe string atau string[] menurut type
 * definition Express; gerbang typeof memastikan hanya string yang
 * dikonversi ke Number. Mengembalikan null bila tidak valid.
 */
const bacaIdDariUrl = (idRaw: string | string[] | undefined): number | null => {
  // params route tunggal selalu string; string[] hanya terjadi bila
  // client mengirim query berulang (?id=1&id=2) — dianggap tidak valid.
  if (typeof idRaw !== "string") return null;
  const id = Number(idRaw);
  if (Number.isNaN(id) || !Number.isInteger(id) || id < 1) return null;
  return id;
};

/**
 * Validasi body POST /buku.
 * Mengembalikan daftar pesan error; bila kosong, data siap diproses.
 * Setiap cek terpisah agar pesan spesifik membantu pengguna memperbaiki input.
 */
const validasiCreate = (body: Record<string, unknown>) => {
  const errors: string[] = [];
  const { judul, penulis, tahun, stok } = body;

  // judul: wajib, string, bukan kosong setelah di-trim.
  if (typeof judul !== "string" || judul.trim() === "") {
    errors.push("Field judul wajib diisi");
  }
  // penulis: wajib, string, bukan kosong.
  if (typeof penulis !== "string" || penulis.trim() === "") {
    errors.push("Field penulis wajib diisi");
  }
  // tahun: wajib, integer, rentang wajar (1000–2100) agar deteksi typo.
  if (typeof tahun !== "number" || !Number.isInteger(tahun)) {
    errors.push("Field tahun wajib berupa bilangan bulat");
  } else if (tahun < 1000 || tahun > 2100) {
    errors.push("Field tahun berada di luar rentang wajar (1000–2100)");
  }
  // stok: opsional karena skema memberi default; bila dikirim, harus int ≥ 0.
  if (stok !== undefined) {
    if (typeof stok !== "number" || !Number.isInteger(stok) || stok < 0) {
      errors.push("Field stok harus bilangan bulat minimal 0");
    }
  }
  return errors;
};

/**
 * Validasi field PATCH (opsional) — kumpulkan semua pesan error.
 * Dipisahkan dari handler agar handler tidak melebihi batas kompleksitas
 * kognitif SonarQube (Cognitive Complexity).
 */
const validasiPatch = (body: Record<string, unknown>): string[] => {
  const errors: string[] = [];
  const { judul, penulis, tahun, stok } = body;

  if (judul !== undefined && (typeof judul !== "string" || judul.trim() === "")) {
    errors.push("Field judul, bila dikirim, wajib berupa string tidak kosong");
  }
  if (penulis !== undefined && (typeof penulis !== "string" || penulis.trim() === "")) {
    errors.push("Field penulis, bila dikirim, wajib berupa string tidak kosong");
  }
  if (tahun !== undefined && (typeof tahun !== "number" || !Number.isInteger(tahun))) {
    errors.push("Field tahun, bila dikirim, wajib berupa bilangan bulat");
  }
  if (stok !== undefined && (typeof stok !== "number" || !Number.isInteger(stok) || stok < 0)) {
    errors.push("Field stok, bila dikirim, wajib bilangan bulat minimal 0");
  }
  return errors;
};

/**
 * Ekstrak field tervalidasi untuk PATCH menjadi objek data yang siap
 * diberikan ke service. Setiap field hanya disertakan bila dikirim dan
 * bertipe yang diharapkan — gunakan guard typeof yang terenkapsulasi
 * untuk menghindari String()/Number() pada tipe unknown.
 */
const susunDataPatch = (body: Record<string, unknown>) => {
  const { judul, penulis, tahun, stok } = body;
  const data: { judul?: string; penulis?: string; tahun?: number; stok?: number } = {};

  if (typeof judul === "string") data.judul = judul.trim();
  if (typeof penulis === "string") data.penulis = penulis.trim();
  if (typeof tahun === "number") data.tahun = tahun;
  if (typeof stok === "number") data.stok = stok;

  return data;
};

/** GET /buku — daftar buku dengan filter query opsional. */
export const handlerDaftarBuku = async (request: Request, response: Response) => {
  // Query parameter Express bertipe string | string[]; gerbang typeof
  // memastikan hanya string yang dikonversi ke Number.
  const penulisRaw = request.query.penulis;
  const penulisFilter = typeof penulisRaw === "string" ? penulisRaw : undefined;
  const minStokRaw = request.query.minStok;
  const minStokFilter = typeof minStokRaw === "string" ? Number(minStokRaw) : undefined;

  const data = await bukuService.ambilDaftarBuku({
    ...(penulisFilter !== undefined && { penulis: penulisFilter }),
    ...(minStokFilter !== undefined && !Number.isNaN(minStokFilter) && { minStok: minStokFilter }),
  });

  return sendSuccess(response, 200, "Daftar buku berhasil diambil", {
    total: data.length,
    data,
  });
};

/** GET /buku/:id — detail satu buku; 404 bila tidak ditemukan. */
export const handlerDetailBuku = async (request: Request, response: Response) => {
  const id = bacaIdDariUrl(request.params.id);
  if (id === null) {
    return sendError(response, 400, "Parameter id harus berupa bilangan bulat");
  }

  const item = await bukuService.ambilBuku(id);
  if (!item) {
    // 404 — resource tidak ada di database; bukan error validasi (400).
    return sendError(response, 404, "Buku tidak ditemukan");
  }

  return sendSuccess(response, 200, "Detail buku berhasil diambil", item);
};

/** POST /buku — membuat buku; 201 bila berhasil. */
export const handlerCreateBuku = async (request: Request, response: Response) => {
  // request.body tanpa express.json() tidak di-parse; pastikan middleware
  // bodyParser didaftarkan di app.ts sebelum route ini.
  const body = (request.body ?? {}) as Record<string, unknown>;
  const errors = validasiCreate(body);
  if (errors.length > 0) {
    // 400 — input tidak valid; kirim seluruh pesan error sekaligus
    // agar client memperbaiki semua masalah dalam satu putaran.
    return sendError(response, 400, "Data buku tidak valid", errors);
  }

  // Ekstrak nilai yang sudah dipastikan tipe string/number oleh validasi
  // (lihat susunDataPatch — pola yang sama untuk POST dan PATCH).
  const dataBuku = susunDataPatch(body);
  if (!dataBuku.judul || !dataBuku.penulis || dataBuku.tahun === undefined) {
    // Guard kedua: validasiCreate sudah memastikan ketiganya ada,
    // tetapi susunDataPatch bersifat generik — guard ini menjaga
    // agar service tidak menerima payload tanpa field wajib.
    return sendError(response, 400, "Data buku tidak lengkap", [
      "Field judul, penulis, dan tahun wajib terisi",
    ]);
  }

  const baru = await bukuService.buatBuku({
    judul: dataBuku.judul,
    penulis: dataBuku.penulis,
    tahun: dataBuku.tahun,
    ...(dataBuku.stok !== undefined && { stok: dataBuku.stok }),
  });

  // 201 Created — resource baru berhasil dibuat di server.
  return sendSuccess(response, 201, "Buku berhasil dibuat", baru);
};

/** PATCH /buku/:id — update sebagian field; 404 bila tidak ditemukan. */
export const handlerPatchBuku = async (request: Request, response: Response) => {
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

  const diperbarui = await bukuService.perbaruiBuku(id, susunDataPatch(body));

  return sendSuccess(response, 200, "Buku berhasil diperbarui", diperbarui);
};

/** DELETE /buku/:id — hapus; 204 No Content bila berhasil. */
export const handlerDeleteBuku = async (request: Request, response: Response) => {
  const id = bacaIdDariUrl(request.params.id);
  if (id === null) {
    return sendError(response, 400, "Parameter id harus berupa bilangan bulat");
  }

  const ada = await bukuService.ambilBuku(id);
  if (!ada) {
    return sendError(response, 404, "Buku tidak ditemukan");
  }

  await bukuService.hapusBuku(id);
  // 204 — operasi sukses, tidak ada body yang perlu dikirim.
  return response.status(204).send();
};