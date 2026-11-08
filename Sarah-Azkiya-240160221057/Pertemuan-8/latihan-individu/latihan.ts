/**
 * Pertemuan 8 — Latihan Individu §10
 * Mahasiswa: Sarah Azkiya (NIM: 240160221057)
 * 
 * Modul Evaluasi & Verifikasi Mandiri REST API Perpustakaan (Buku & Anggota)
 * Fokus:
 * 1. Validasi Data Transfer Object (DTO) dan Batasan Domain
 * 2. Pemetaan Kode Status HTTP dan Error Domain (400, 404, 409)
 * 3. Eksekusi Unit Function Controller & Service secara Terisolasi
 */

import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, "../uts/240160221057-sarahazkiya/prisma/dev.db");
process.env.DATABASE_URL = `file:${dbPath}`;

import { prisma } from "../uts/240160221057-sarahazkiya/client.ts";
import { bukuService, NotFoundError, ConflictError } from "../uts/240160221057-sarahazkiya/src/service/buku.service.ts";
import { anggotaService } from "../uts/240160221057-sarahazkiya/src/service/anggota.service.ts";

// ================================================================
// 1. VALIDASI DOMAIN BUKU (LATIHAN INDIVIDU)
// ================================================================

export interface BukuInput {
  judul: string;
  penulis: string;
  tahun: number;
  stok: number;
}

export function validasiInputBuku(input: unknown): { valid: boolean; error?: string; data?: BukuInput } {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return { valid: false, error: "Request body harus berupa objek JSON yang valid" };
  }

  const { judul, penulis, tahun, stok } = input as Record<string, unknown>;

  if (typeof judul !== "string" || judul.trim() === "") {
    return { valid: false, error: "Field 'judul' wajib diisi dan tidak boleh kosong" };
  }

  if (typeof penulis !== "string" || penulis.trim() === "") {
    return { valid: false, error: "Field 'penulis' wajib diisi dan tidak boleh kosong" };
  }

  if (!Number.isInteger(tahun) || (tahun as number) < 1000 || (tahun as number) > 2100) {
    return { valid: false, error: "Field 'tahun' harus berupa angka antara 1000 sampai 2100" };
  }

  if (!Number.isInteger(stok) || (stok as number) < 0) {
    return { valid: false, error: "Field 'stok' harus berupa angka bulat dan tidak boleh negatif" };
  }

  return {
    valid: true,
    data: {
      judul: judul.trim(),
      penulis: penulis.trim(),
      tahun: tahun as number,
      stok: stok as number,
    },
  };
}

// ================================================================
// 2. VALIDASI DOMAIN ANGGOTA (LATIHAN INDIVIDU)
// ================================================================

export interface AnggotaInput {
  nama: string;
  nim: string;
  jurusan: string;
}

export function validasiInputAnggota(input: unknown): { valid: boolean; error?: string; data?: AnggotaInput } {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return { valid: false, error: "Body harus berupa object JSON" };
  }

  const body = input as Record<string, unknown>;
  const fieldWajib = ["nama", "nim", "jurusan"];

  for (const field of fieldWajib) {
    if (typeof body[field] !== "string" || (body[field] as string).trim() === "") {
      return { valid: false, error: `Field '${field}' wajib diisi dan tidak boleh kosong` };
    }
  }

  return {
    valid: true,
    data: {
      nama: (body.nama as string).trim(),
      nim: (body.nim as string).trim(),
      jurusan: (body.jurusan as string).trim(),
    },
  };
}

// ================================================================
// 3. FUNGSI EKSEKUSI INDIVIDU DENGAN SAFETY WRAPPER
// ================================================================

export async function ujiTambahBuku(data: unknown) {
  const v = validasiInputBuku(data);
  if (!v.valid || !v.data) {
    return { status: 400, success: false, message: v.error };
  }
  const buku = await bukuService.create(v.data);
  return { status: 201, success: true, data: buku };
}

export async function ujiCariBukuById(id: number) {
  if (!Number.isInteger(id) || id <= 0) {
    return { status: 400, success: false, message: "ID buku tidak valid" };
  }
  try {
    const buku = await bukuService.findById(id);
    return { status: 200, success: true, data: buku };
  } catch (err) {
    if (err instanceof NotFoundError) {
      return { status: 404, success: false, message: err.message };
    }
    throw err;
  }
}

export async function ujiTambahAnggota(data: unknown) {
  const v = validasiInputAnggota(data);
  if (!v.valid || !v.data) {
    return { status: 400, success: false, message: v.error };
  }
  try {
    const anggota = await anggotaService.create(v.data);
    return { status: 201, success: true, data: anggota };
  } catch (err) {
    if (err instanceof ConflictError) {
      return { status: 409, success: false, message: err.message };
    }
    throw err;
  }
}

export { prisma, bukuService, anggotaService, NotFoundError, ConflictError };
