/**
 * ============================================================
 * absensiService.js — Mini-Service In-Memory untuk Absensi
 * ============================================================
 */

// Database in-memory awal
let dataAbsensi = [
  { id: 1, nama: "Budi Santoso", status: "Hadir", waktu: "07:30" },
  { id: 2, nama: "Siti Aminah", status: "Izin", waktu: "08:15" },
  { id: 3, nama: "Joko Anwar", status: "Alpa", waktu: "-" }
];

// Helper untuk simulasi waktu tunda (100–300 ms)
const tunda = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 1. findAll — Mengambil semua data absensi
async function findAll() {
  await tunda(150);
  return dataAbsensi;
}

// 2. findById — Mencari data absensi berdasarkan ID
async function findById(id) {
  await tunda(200);
  const ditemukan = dataAbsensi.find(item => item.id === id);
  return ditemukan || null;
}

// 3. create — Menambah data absensi baru (memakai default value)
async function create(nama, status = "Hadir", waktu = "08:00") {
  await tunda(250);
  const idBaru = dataAbsensi.length > 0 ? dataAbsensi[dataAbsensi.length - 1].id + 1 : 1;
  const entriBaru = { id: idBaru, nama, status, waktu };
  dataAbsensi.push(entriBaru);
  return entriBaru;
}

// 4. update — Mengubah data absensi berdasarkan ID
async function update(id, dataBaru) {
  await tunda(200);
  const index = dataAbsensi.findIndex(item => item.id === id);
  if (index === -1) return null;

  dataAbsensi[index] = {
    ...dataAbsensi[index],
    ...dataBaru
  };
  return dataAbsensi[index];
}

// 5. delete — Menghapus data absensi berdasarkan ID
async function del(id) {
  await tunda(150);
  const index = dataAbsensi.findIndex(item => item.id === id);
  if (index === -1) return null;

  const [dihapus] = dataAbsensi.splice(index, 1);
  return dihapus;
}

module.exports = { findAll, findById, create, update, del };