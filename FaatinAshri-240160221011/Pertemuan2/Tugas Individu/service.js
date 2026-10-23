/**
 * ============================================================
 * Pertemuan 2 — Buku Service
 * ============================================================
 * Service untuk resource buku.
 * Database masih menggunakan array (in-memory).
 */


import { setTimeout as delay } from "node:timers/promises";


// "Database" in-memory + id berjalan
let buku = [
  {
    id: 1,
    judul: "Belajar Node.js",
    penulis: "Andi",
    tahun: 2024,
    stok: 3
  },
  {
    id: 2,
    judul: "Dasar JavaScript",
    penulis: "Budi",
    tahun: 2023,
    stok: 0
  }
];


let nextId = 3;


// ============================================================
// FIND ALL
// ============================================================


async function findAll() {
  await delay(100);

  return buku;
}


// ============================================================
// FIND BY ID
// ============================================================


async function findById(id) {
  await delay(100);

  return buku.find((b) => b.id === Number(id)) ?? null;
}


// ============================================================
// CREATE
// ============================================================


// Default value stok = 0.
async function create({
  judul,
  penulis,
  tahun,
  stok = 0
}) {
  await delay(100);

  const baru = {
    id: nextId++,
    judul,
    penulis,
    tahun,
    stok
  };

  buku.push(baru);

  return baru;
}


// ============================================================
// UPDATE
// ============================================================


async function update(id, data) {
  await delay(100);

  const found = await findById(id);

  if (!found) {
    return null;
  }

  Object.assign(found, data);

  return found;
}


// ============================================================
// DELETE
// ============================================================


async function deleteBuku(id) {
  await delay(100);

  const index = buku.findIndex(
    (b) => b.id === Number(id)
  );

  if (index === -1) {
    return null;
  }

  const [deleted] = buku.splice(index, 1);

  return deleted;
}


// ============================================================
// EXPORT
// ============================================================


export {
  findAll,
  findById,
  create,
  update,
  deleteBuku
};