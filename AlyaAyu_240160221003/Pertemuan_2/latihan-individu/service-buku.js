/**
 * ============================================================
 * Pertemuan 2 — Buku Service
 * ============================================================
 * Studi kasus mini sebelum server: layer "service" memisahkan
 * LOGIKA BISNIS dari HTTP. Di Pertemuan 4-7 (Express + Prisma),
 * pola service/controller akan kita pakai lagi — hari ini versi Node.js murni.
 *
 * Jalankan:
 *   node service-buku.js
 */

import { setTimeout as delay } from "node:timers/promises";

// "Database" in-memory + id berjalan — sama seperti P1
let buku = [
  { id: 1, judul: "Belajar Node.js", penulis: "Andi", tahun: 2024, stok: 3 },
  { id: 2, judul: "Dasar JavaScript", penulis: "Budi", tahun: 2023, stok: 0 },
];
let nextId = 3;

// Simulasi akses database: selalu butuh waktu (async)
// delay diimpor dari node:timers/promises (versi Promise dari setTimeout)

// ---------- Service: semua fungsi async + return object hasil ----------
async function findAll() {
  await delay(100); // seolah query SELECT
  return buku;
}

async function findById(id) {
  await delay(100);
  return buku.find((b) => b.id === Number(id)) ?? null;
}

async function create({ judul, penulis, tahun, stok = 0 }) {
  await delay(100);
  const baru = { id: nextId++, judul, penulis, tahun, stok };
  buku.push(baru);
  return baru;
}

async function update(id, data) {
  const found = await findById(id);
  if (!found) return null;
  Object.assign(found, data); // spread-based partial update (PATCH)
  return found;
}

// ---------- Demo ----------
console.log("Daftar awal:", (await findAll()).length, "buku");

// Destructuring saat menerima hasil service
const { id, judul } = await create({ judul: "Async JS Handbook", penulis: "Dewi", tahun: 2025, stok: 2 });
console.log("Buku baru:", { id, judul });

console.log("Buku id 2:", (await findById(2)).judul);

const diubah = await update(2, { stok: 4 }); // PATCH: sebagian field saja
console.log("Setelah update stok:", { id: diubah.id, stok: diubah.stok });

// Promise.all: hitung statistik paralel
const [total, habis] = await Promise.all([
  findAll().then((all) => all.length),
  findAll().then((all) => all.filter((b) => b.stok === 0).length),
]);
console.log(`Statistik: ${total} buku, ${habis} stok habis`);