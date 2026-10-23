/**
 * ============================================================
 * Pertemuan 2 — Absensi Organisasi Service
 * ============================================================
 * Service digunakan untuk memisahkan logika bisnis dari HTTP.
 * Data absensi disimpan sementara di memory.
 *
 * Jalankan:
 *   node demo.js
 */

import { setTimeout as delay } from "node:timers/promises";

// "Database" in-memory + id berjalan
let absensi = [
  {
    id: 1,
    nama: "Andi",
    jabatan: "Ketua",
    tanggal: "2026-09-28",
    status: "Hadir",
  },
  {
    id: 2,
    nama: "Siti",
    jabatan: "Sekretaris",
    tanggal: "2026-09-28",
    status: "Izin",
  },
  {
    id: 3,
    nama: "Rina",
    jabatan: "Bendahara",
    tanggal: "2026-09-28",
    status: "Hadir",
  },
];

let nextId = 4;

// Simulasi akses database
function waktuAcak() {
  return Math.floor(Math.random() * 201) + 100;
}

// ---------- Service ----------

// Mengambil semua data absensi
const findAll = async () => {
  await delay(waktuAcak());
  return absensi;
};

// Mencari data absensi berdasarkan ID
const findById = async (id) => {
  await delay(waktuAcak());
  return absensi.find((a) => a.id === Number(id)) ?? null;
};

// Menambahkan data absensi baru
const create = async ({
  nama,
  jabatan,
  tanggal,
  status = "Hadir",
}) => {
  await delay(waktuAcak());

  const baru = {
    id: nextId++,
    nama,
    jabatan,
    tanggal,
    status,
  };

  absensi.push(baru);
  return baru;
};

// Mengubah data absensi
const update = async (id, data) => {
  const found = await findById(id);

  if (!found) return null;

  Object.assign(found, data);
  return found;
};

// Menghapus data absensi
const remove = async (id) => {
  await delay(waktuAcak());

  const index = absensi.findIndex((a) => a.id === Number(id));

  if (index === -1) return null;

  const [deleted] = absensi.splice(index, 1);

  return deleted;
};

// ---------- Export Service ----------

export {
  findAll,
  findById,
  create,
  update,
  remove,
};