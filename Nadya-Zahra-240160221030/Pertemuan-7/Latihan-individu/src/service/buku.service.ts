/**
 * Pertemuan 7 — CRUD REST API: Service Layer
 * Tujuan: memusatkan seluruh operasi data resource buku dalam satu modul,
 *         sehingga controller tidak menyentuh Prisma Client secara langsung.
 *
 * Konsep:
 * - Service = lapisan antara HTTP (controller) dan database (Prisma Client).
 * - Controller cukup memanggil fungsi di sini; Prisma Client tidak
 *   tersebar di banyak file route.
 * - Pola ini membuat logika data mudah diuji tanpa menjalankan server.
 *
 * Jalankan (melalui server.ts):
 *   npx prisma migrate dev --name init
 *   npx prisma generate
 *   node --experimental-strip-types server.ts
 */

import { prisma } from "../../client.ts";

/**
 * Tipe input create buku.
 * Field judul, penulis, tahun bersifat wajib; stok opsional karena
 * skema Prisma memberi default 0 (lihat prisma/schema.prisma).
 */
type DataBuku = {
  judul: string;
  penulis: string;
  tahun: number;
  stok?: number;
};

/**
 * Tipe input update buku (PATCH).
 * Setiap field bersifat opsional agar hanya field yang dikirim
 * oleh client yang benar-benar diubah.
 */
type PerbaruiBuku = Partial<DataBuku>;

/**
 * Membuat buku baru.
 * @returns buku yang baru tersimpan, lengkap dengan id dari database.
 */
export const buatBuku = async (data: DataBuku) => {
  return prisma.buku.create({
    data: {
      judul: data.judul,
      penulis: data.penulis,
      tahun: data.tahun,
      ...(data.stok !== undefined && { stok: data.stok }),
    },
  });
};

/**
 * Mengambil daftar buku dengan filter opsional.
 * @param filter Penulis untuk pencocokan persis dan minimal stok.
 * @returns array buku terurut berdasarkan judul.
 */
export const ambilDaftarBuku = async (filter?: { penulis?: string; minStok?: number }) => {
  return prisma.buku.findMany({
    where: {
      ...(filter?.penulis !== undefined && { penulis: filter.penulis }),
      ...(filter?.minStok !== undefined && { stok: { gte: filter.minStok } }),
    },
    orderBy: { judul: "asc" },
  });
};

/**
 * Mengambil satu buku berdasarkan id.
 * @returns buku atau null bila tidak ditemukan — keputusan 404 dibiarkan
 * pada controller agar service tetap netral terhadap status HTTP.
 */
export const ambilBuku = async (id: number) => {
  return prisma.buku.findFirst({ where: { id } });
};

/**
 * Memperbarui sebagian field buku.
 * @param data hanya field yang terdefinisi (selain id) yang akan diubah.
 * @returns buku setelah update.
 */
export const perbaruiBuku = async (id: number, data: PerbaruiBuku) => {
  return prisma.buku.update({
    where: { id },
    data: {
      ...(data.judul !== undefined && { judul: data.judul }),
      ...(data.penulis !== undefined && { penulis: data.penulis }),
      ...(data.tahun !== undefined && { tahun: data.tahun }),
      ...(data.stok !== undefined && { stok: data.stok }),
    },
  });
};

/**
 * Menghapus buku berdasarkan id.
 * Mengembalikan objek terhapus sebagai bukti operasi.
 */
export const hapusBuku = async (id: number) => {
  return prisma.buku.delete({ where: { id } });
};