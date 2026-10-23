/**
============================================================
Latihan Individu Pertemuan 2 — ES6+ & Async
============================================================
Lengkapi setiap bagian latihan di file ini. Jalankan:
node latihan.js

Semua latihan meniru kode backend nyata. Setelah selesai,
wajib bisa menjelaskan tiap baris (kontrak AI Pertemuan 1).
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
const [{ nama, harga }] = transaksi;
console.log(`Item pertama: ${nama} (${formatRupiah(harga)})`);


// =========================================================
// LATIHAN 2 — map + reduce
// Hitung subtotal tiap item (harga x jumlah) lalu TOTAL struk
// Gunakan map → subtotal, reduce → total. Cetak keduanya.
// =========================================================
const subtotals = transaksi.map((item) => item.harga * item.jumlah);
const totalStruk = subtotals.reduce((acc, curr) => acc + curr, 0);

console.log("Subtotal tiap item:", subtotals);
console.log("Total struk:", formatRupiah(totalStruk));


// =========================================================
// LATIHAN 3 — filter + spread
// Ambil item dengan harga > 10000.
// Buat array baru berisi NAMA semua item termahal
// menggunakan spread pada array hasil filter.
// =========================================================
const itemMahal = transaksi.filter((item) => item.harga > 10000);
const namaItemMahal = [...itemMahal.map((item) => item.nama)];

console.log("Nama item termahal (>10.000):", namaItemMahal);


// =========================================================
// LATIHAN 4 — Promise + async/await
// Buat fungsi prosesPembayaran(total, delayMs) yang mengembalikan
// Promise: setelah delayMs → resolve { status: "lunas", total, kembali: total - diskon }
// Diskon 10% jika total > 100000 (pakai hitungDiskon dari modul-02).
// Panggil dengan await, cetak hasilnya.
// =========================================================
const prosesPembayaran = (total, delayMs) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Hitung bayar setelah diskon 10% jika total > 100000
      const totalSetelahDiskon = total > 100000 ? hitungDiskon(total, 10) : total;
      const kembali = total - totalSetelahDiskon;

      resolve({
        status: "lunas",
        total: total,
        kembali: kembali,
      });
    }, delayMs);
  });
};

async function jalankanPembayaran() {
  const hasil = await prosesPembayaran(totalStruk, 1000);
  console.log("Hasil Pembayaran:", hasil);
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

async function jalankanLaporanCabang() {
  const mulai = Date.now();

  const [cabang1, cabang2, cabang3] = await Promise.all([
    tunda(200, 50),
    tunda(300, 80),
    tunda(100, 70),
  ]);

  const totalPenjualan = cabang1 + cabang2 + cabang3;
  const selesainya = Date.now() - mulai;

  console.log(`Total Penjualan Cabang: ${totalPenjualan}`);
  console.log(`Waktu Eksekusi Paralel: ${selesainya}ms`);
}

jalankanLaporanCabang();


// =========================================================
// LATIHAN 6 — BONUS: mini formatter struk
// Cetak struk rapi memakai map + template literal multi-baris:
//   1. Kopi Hitam       x2  Rp30.000
//   2. Roti Bakar       x3  Rp36.000
//   ...
// Gunakan formatRupiah dari modul-02 dan .padEnd(20).
// =========================================================
console.log("\n=== STRUK E-WARUNG KAMPUS ===");
const barisStruk = transaksi.map((item, index) => {
  const nomorDanNama = `${index + 1}. ${item.nama}`.padEnd(20);
  const subtotal = formatRupiah(item.harga * item.jumlah);
  return `${nomorDanNama} x${item.jumlah}  ${subtotal}`;
});

console.log(barisStruk.join("\n"));
console.log("----------------------------");
console.log(`TOTAL: ${formatRupiah(totalStruk)}`);