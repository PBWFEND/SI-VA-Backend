/**
 * ============================================================
 * Tugas 1 — Demo Service Absensi Organisasi
 * ============================================================
 * Menjalankan operasi service:
 * findAll, findById, create, update, delete
 * serta Promise.all dan try/catch.
 */

import {
  findAll,
  findById,
  create,
  update,
  remove,
} from "./service.js";

try {
  // ============================================================
  // 1. findAll — mengambil semua data absensi
  // ============================================================
  const semuaAbsensi = await findAll();

  console.log("=== 1. SEMUA DATA ABSENSI ===");
  console.log(semuaAbsensi);

  // ============================================================
  // 2. findById — mencari absensi berdasarkan ID
  // ============================================================
  const absensi = await findById(2);

  console.log("\n=== 2. CARI ABSENSI ID 2 ===");
  console.log(absensi);

  // ============================================================
  // 3. create — menambahkan data absensi
  // ============================================================
  const { id, nama, status } = await create({
    nama: "Dewi",
    jabatan: "Anggota",
    tanggal: "2026-09-28",
    status: "Hadir",
  });

  console.log("\n=== 3. DATA ABSENSI BARU ===");
  console.log({ id, nama, status });

  // ============================================================
  // 4. update — mengubah data absensi
  // ============================================================
  const diubah = await update(2, {
    status: "Hadir",
  });

  console.log("\n=== 4. SETELAH UPDATE ===");
  console.log(diubah);

  // ============================================================
  // 5. remove/delete — menghapus data absensi
  // ============================================================
  const dihapus = await remove(3);

  console.log("\n=== 5. DATA YANG DIHAPUS ===");
  console.log(dihapus);

  // ============================================================
  // 6. Promise.all — dua operasi berjalan secara paralel
  // ============================================================
  const [total, jumlahHadir] = await Promise.all([
    findAll().then((data) => data.length),

    findAll().then(
      (data) =>
        data.filter((absen) => absen.status === "Hadir").length
    ),
  ]);

  console.log("\n=== 6. PROMISE.ALL ===");
  console.log(`Total data absensi: ${total}`);
  console.log(`Jumlah anggota hadir: ${jumlahHadir}`);

  // ============================================================
  // 7. Try/catch — menangani ID yang tidak ditemukan
  // ============================================================
  const tidakAda = await findById(999);

  if (!tidakAda) {
    throw new Error(
      "Data absensi dengan ID 999 tidak ditemukan"
    );
  }

  console.log(tidakAda);
} catch (error) {
  console.log("\n=== ERROR ===");
  console.log(error.message);
}