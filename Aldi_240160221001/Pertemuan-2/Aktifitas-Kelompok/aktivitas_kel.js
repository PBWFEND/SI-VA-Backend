/**
 * ============================================================
 * AKTIVITAS KELOMPOK — PERTEMUAN 2
 * ============================================================
 * Mata Kuliah : Praktikum Backend
 *
 * Anggota Kelompok:
 * 1. Resa Khoerunnisa - 240160221038
 * 2. Aldi Restu Fauzi - 240160221001
 * 3. Khoirunnisa Shaleha - 240160221018
 */

// ============================================================
// 1. REFACTORING KODE
// ============================================================

console.log("========================================");
console.log("1. REFACTORING KODE");
console.log("========================================");

// Versi lama:
// function buatPesan(l) {
//   var t = "Total: " + l.reduce(function(a, i) {
//     return a + i.harga * i.jumlah;
//   }, 0);
//   return t;
// }

// Versi hasil refactoring:
const buatPesan = (items = []) => {
  const total = items.reduce(
    (total, { harga, jumlah }) => total + harga * jumlah,
    0
  );

  return `Total: ${total}`;
};

// Data contoh
const dataBarang = [
  { nama: "Buku", harga: 10000, jumlah: 2 },
  { nama: "Pulpen", harga: 5000, jumlah: 3 },
];

console.log(buatPesan(dataBarang));


// ============================================================
// 2. PREDIKSI OUTPUT SYNC / ASYNC
// ============================================================

console.log("\n========================================");
console.log("2. PREDIKSI OUTPUT SYNC / ASYNC");
console.log("========================================");

console.log("A. Mulai");

setTimeout(() => {
  console.log("C. setTimeout 0ms");
}, 0);

console.log("B. Selesai");


// ============================================================
// 3. PARALEL VS SEKUENSIAL
// ============================================================

const tunda = (ms, nama) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(`${nama} selesai`);
    }, ms);
  });


// ---------- SEQUENTIAL ----------

const jalankanSequential = async () => {
  console.log("\n--- Sequential ---");

  const mulai = Date.now();

  const hasil1 = await tunda(300, "Query Buku");
  console.log(hasil1);

  const hasil2 = await tunda(200, "Query Anggota");
  console.log(hasil2);

  const hasil3 = await tunda(100, "Query Absensi");
  console.log(hasil3);

  const waktu = Date.now() - mulai;

  console.log(`Waktu sequential: ±${waktu}ms`);
};


// ---------- PROMISE.ALL ----------

const jalankanParalel = async () => {
  console.log("\n--- Promise.all (Paralel) ---");

  const mulai = Date.now();

  const [hasil1, hasil2, hasil3] = await Promise.all([
    tunda(300, "Query Buku"),
    tunda(200, "Query Anggota"),
    tunda(100, "Query Absensi"),
  ]);

  console.log(hasil1);
  console.log(hasil2);
  console.log(hasil3);

  const waktu = Date.now() - mulai;

  console.log(`Waktu Promise.all: ±${waktu}ms`);
};


// Jalankan nomor 3
const jalankanDemo = async () => {
  await jalankanSequential();
  await jalankanParalel();

  console.log("\n========================================");
  console.log("SEMUA AKTIVITAS KELOMPOK SELESAI");
  console.log("========================================");
};

await jalankanDemo();