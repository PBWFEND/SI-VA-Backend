/**
 * ============================================================
 * Latihan Individu Pertemuan 2 — ES6+ & Async
 * ============================================================
 * Lengkapi setiap bagian latihan di file ini. Jalankan:
 *   node latihan.js
 *
 * Semua latihan meniru kode backend nyata. Setelah selesai,
 * wajib bisa menjelaskan tiap baris (kontrak AI Pertemuan 1).
 */

const { formatRupiah, hitungDiskon } = require("./modul-02");

// ---------- Data ----------
const transaksi = [
  { id: 1, nama: "Kopi Hitam", harga: 15000, jumlah: 2 },
  { id: 2, nama: "Roti Bakar", harga: 12000, jumlah: 3 },
  { id: 3, nama: "Air Mineral", harga: 5000, jumlah: 10 },
];

// =========================================================
// LATIHAN 1 — Destructuring + template literal
// Ambil nama dan harga item PERTAMA tanpa transaksi[0].nama
// Cetak: "Item pertama: Kopi Hitam (Rp15.000)"
// =========================================================
const { nama, harga } = transaksi[0];

console.log(`Item pertama: ${nama} (${formatRupiah(harga)})`);
// =========================================================
// LATIHAN 2 — map + reduce
// Hitung subtotal tiap item (harga x jumlah) lalu TOTAL struk
// Gunakan map → subtotal, reduce → total. Cetak keduanya.
// =========================================================
const subtotal = transaksi.map((item) => item.harga * item.jumlah);

const total = subtotal.reduce((acc, nilai) => acc + nilai, 0);

console.log("Subtotal:", subtotal);
console.log("Total:", total);
// =========================================================
// LATIHAN 3 — filter + spread
// Ambil item dengan harga > 10000.
// Buat array baru berisi NAMA semua item termahal
// menggunakan spread pada array hasil filter.
// =========================================================
const itemTermahal = transaksi.filter((item) => item.harga > 10000);

const namaItemTermahal = [...itemTermahal].map((item) => item.nama);

console.log("Nama item termahal:", namaItemTermahal);
// =========================================================
// LATIHAN 4 — Promise + async/await
// Buat fungsi prosesPembayaran(total, delayMs) yang mengembalikan
// Promise: setelah delayMs → resolve { status: "lunas", total, kembali: total - diskon }
// Diskon 10% jika total > 100000 (pakai hitungDiskon dari modul-02).
// Panggil dengan await, cetak hasilnya.
// =========================================================
function prosesPembayaran(total, delayMs) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const diskon = total > 100000 ? hitungDiskon(total, 10) : total;

      resolve({
        status: "lunas",
        total,
        kembali: diskon,
      });
    }, delayMs);
  });
}

async function jalankanPembayaran() {
  const hasil = await prosesPembayaran(total, 500);

  console.log("Hasil pembayaran:", hasil);
}

jalankanPembayaran();
// =========================================================
// LATIHAN 5 — Promise.all
// Tiga "cabang" mengirim laporan penjualan serentak:
//   tunda(200, 50), tunda(300, 80), tunda(100, 70)
// (angka kedua = penjualan). Gunakan Promise.all, jumlahkan hasilnya.
// Cetak total waktu eksekusi dengan Date.now() — buktikan paralel.
// =========================================================
const tunda = (ms, nilai) => new Promise((resolve) => setTimeout(() => resolve(nilai), ms));
const mulai = Date.now();

Promise.all([
  tunda(200, 50),
  tunda(300, 80),
  tunda(100, 70),
]).then((hasil) => {
  const totalPenjualan = hasil.reduce((acc, nilai) => acc + nilai, 0);
  const waktu = Date.now() - mulai;

  console.log("Hasil penjualan:", hasil);
  console.log("Total penjualan:", totalPenjualan);
  console.log("Waktu eksekusi:", waktu, "ms");
});

// =========================================================
// LATIHAN 6 — BONUS: mini formatter struk
// Cetak struk rapi memakai map + template literal multi-baris:
//   1. Kopi Hitam       x2  Rp30.000
//   2. Roti Bakar       x3  Rp36.000
//   ...
// Gunakan formatRupiah dari modul-02 dan .padEnd(20).
// =========================================================
const struk = transaksi.map((item, index) => {
  const subtotalItem = item.harga * item.jumlah;

  return `${index + 1}. ${item.nama.padEnd(20)} x${item.jumlah}  ${formatRupiah(subtotalItem)}`;
});

console.log("Struk:");
console.log(struk.join("\n"));