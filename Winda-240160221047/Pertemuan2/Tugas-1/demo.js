/**
 * ============================================================
 * demo.js — Demo Operasi Mini-Service Absensi
 * ============================================================
 */
const { findAll, findById, create, update, del } = require("./absensiService");

async function jalankanDemo() {
  console.log("=== DEMO MINI-SERVICE ABSENSI ===\n");

  try {
    // 1. Operasi CREATE (Menambah absensi dengan default value)
    console.log("1. Menambah data absensi baru...");
    const dataBaru = await create("Dewi Lestari"); 
    console.log("Berhasil ditambahkan:", dataBaru);
    console.log("--------------------------------------------------");

    // 2. Operasi FIND ALL (Mengambil seluruh data)
    console.log("2. Menampilkan seluruh data absensi:");
    const semuaData = await findAll();
    semuaData.forEach(({ id, nama, status }) => {
      console.log(`- [ID: ${id}] ${nama} (${status})`);
    });
    console.log("--------------------------------------------------");

    // 3. Operasi FIND BY ID dengan Try/Catch (Kasus ID Ditemukan & Tidak Ditemukan)
    console.log("3. Mencari data berdasarkan ID (Valid & Invalid)...");
    const cariValid = await findById(2);
    console.log("Pencarian ID 2:", cariValid);

    const cariInvalid = await findById(999);
    if (!cariInvalid) {
      throw new Error("Data absensi dengan ID 999 tidak ditemukan!");
    }
  } catch (error) {
    console.error("❌ Penanganan Error (Try/Catch):", error.message);
  }
  console.log("--------------------------------------------------");

  try {
    // 4. Operasi UPDATE & DELETE
    console.log("4. Melakukan Update & Delete data...");
    const diupdate = await update(1, { status: "Izin", waktu: "09:00" });
    console.log("Data setelah di-update:", diupdate);

    const dihapus = await del(3);
    console.log("Data yang dihapus:", dihapus);
    console.log("--------------------------------------------------");

    // 5. PROMISE.ALL (Dua kueri paralel: mencari ID 1 dan ID 2 secara bersamaan)
    console.log("5. Menjalankan Promise.all() secara paralel...");
    const waktuMulai = Date.now();
    
    const [absen1, absen2] = await Promise.all([
      findById(1),
      findById(2)
    ]);

    const durasi = Date.now() - waktuMulai;
    console.log("Hasil kueri paralel:", [absen1, absen2]);
    console.log(`Waktu eksekusi paralel selesai dalam: ${durasi} ms (membuktikan berjalan serentak)`);

  } catch (error) {
    console.error("Error pada operasi lanjutan:", error.message);
  }
}

jalankanDemo();