/**
 * ============================================================
 * Demo Service Buku
 * ============================================================
 */


import {
  findAll,
  findById,
  create,
  update,
  deleteBuku
} from "./service.js";


// ============================================================
// DEMO
// ============================================================


async function main() {

  console.log("=== DEMO SERVICE BUKU ===\n");


  // ----------------------------------------------------------
  // 1. FIND ALL
  // ----------------------------------------------------------

  const semuaBuku = await findAll();

  console.log("1. Semua buku:");
  console.log(semuaBuku);


  // ----------------------------------------------------------
  // 2. FIND BY ID
  // ----------------------------------------------------------

  const buku = await findById(1);

  console.log("\n2. Buku ID 1:");
  console.log(buku);


  // ----------------------------------------------------------
  // 3. CREATE
  // ----------------------------------------------------------

  const bukuBaru = await create({
    judul: "Atomic Habits",
    penulis: "James Clear",
    tahun: 2018,
    stok: 2
  });

  console.log("\n3. Buku berhasil dibuat:");
  console.log(bukuBaru);


  // ----------------------------------------------------------
  // 4. UPDATE
  // ----------------------------------------------------------

  const bukuDiubah = await update(1, {
    stok: 5
  });

  console.log("\n4. Buku setelah update:");
  console.log(bukuDiubah);


  // ----------------------------------------------------------
  // 5. DELETE
  // ----------------------------------------------------------

  const bukuDihapus = await deleteBuku(2);

  console.log("\n5. Buku yang dihapus:");
  console.log(bukuDihapus);


  // ----------------------------------------------------------
  // 6. PROMISE.ALL
  // ----------------------------------------------------------

  console.log("\n6. Dua query paralel:");

  const mulai = Date.now();

  const [daftarBuku, bukuPertama] = await Promise.all([
    findAll(),
    findById(1)
  ]);

  const waktu = Date.now() - mulai;

  console.log("Jumlah buku:", daftarBuku.length);
  console.log("Buku ID 1:", bukuPertama);
  console.log(`Waktu Promise.all: ${waktu} ms`);


  // ----------------------------------------------------------
  // 7. TRY / CATCH
  // ----------------------------------------------------------

  try {

    const bukuTidakAda = await findById(9999);

    if (!bukuTidakAda) {
      throw new Error("Buku dengan ID 9999 tidak ditemukan");
    }

    console.log(bukuTidakAda);

  } catch (error) {

    console.log("\n7. Error handling:");
    console.log(error.message);

  }

}
main();