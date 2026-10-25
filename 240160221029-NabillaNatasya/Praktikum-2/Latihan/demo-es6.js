/**
 * ============================================================
 * Demo Pertemuan 2 — JavaScript Modern (ES6+) untuk Backend
 * ============================================================
 * Tujuan:
 *   1. Mengulas fitur ES6+ yang dipakai terus-menerus di backend:
 *      let/const, arrow function, template literal, destructuring,
 *      spread/rest, dan array methods
 *   2. Semua contoh DIBERI LABEL agar mudah diikuti saat live demo
 *
 * Jalankan:
 *   node demo-es6.js
 */

// ============================================================
// 1. let vs const vs var
// ============================================================
const PORT = 3000;          // const = tidak bisa di-reassign
let jumlahRequest = 0;      // let  = bisa berubah
// var sudah tidak dipakai: function-scoped & hoisting membingungkan

jumlahRequest = 10;
console.log("1. let/const:", { PORT, jumlahRequest });

// ============================================================
// 2. Arrow function — bentuk ringkas, cocok untuk callback
// ============================================================
// Function biasa
function sapa(nama) {
  return `Halo, ${nama}!`;
}

// Arrow function satu baris (implicit return)
const sapaRingkas = (nama) => `Halo, ${nama}!`;

// Arrow function sebagai callback (paling sering dipakai)
const angka = [1, 2, 3, 4, 5];
const kaliDua = angka.map((n) => n * 2);

console.log("2. Arrow:", sapa("Budi") === sapaRingkas("Budi"), kaliDua);

// Perilaku `this` pada arrow function: `this` diambil dari scope sekitar
// (lexical this) — bukan dari pemanggil function-nya.
const counter = {
  nilai: 0,
  naik() {
    this.nilai++; // method biasa → `this` = counter
  },
};
counter.naik();
console.log("2. Arrow this:", counter.nilai); // 1

// ============================================================
// 3. Template literals — string + variabel tanpa konkatenasi
// ============================================================
const nim = "F1D022001";
const nama = "Jhon Doe";
const logRequest = (method, url) => `${method} ${url}`; // dipakai di server.js P1

console.log("3. Template literal:", `GET /mahasiswa — log: ${logRequest("GET", "/mahasiswa")}`);
console.log("3. Multi-baris:", `baris 1
baris 2`);

// ============================================================
// 4. Destructuring — membongkar object/array
// ============================================================
const mahasiswa = { nim: "F1D022001", nama: "Jhon Doe", prodi: "Sistem Informasi", ipk: 3.55 };

// Object destructuring + default value + rename
const { nim: nimMhs, nama: namaMhs, angkatan = 2022 } = mahasiswa;

// Di server P1 kita sudah memakainya: const { method, url } = req;
const reqDummy = { method: "GET", url: "/mahasiswa" };
const { method, url } = reqDummy;

// Array destructuring
const [pertama, , ketiga] = ["apel", "jeruk", "mangga"]; // skip "jeruk"

// Destructuring parameter function — sangat umum di Express (P4)
function buatResponse({ success = true, message = "", data = null } = {}) {
  return { success, message, data };
}

console.log("4. Destructuring:", { nimMhs, namaMhs, angkatan, method, url, pertama, ketiga });
console.log("4. Param function:", buatResponse({ message: "OK" }));

// ============================================================
// 5. Spread ... — menyalin & menggabung (object / array)
// ============================================================
const defaultBuku = { judul: "-", penulis: "-", tahun: 2024, stok: 0 };
const bukuBaru = { ...defaultBuku, judul: "Belajar Node.js", stok: 3 }; // override sebagian

const listA = [1, 2];
const listB = [3, 4];
const gabung = [...listA, ...listB];

// REST parameter — kebalikan spread: mengumpulkan sisa argumen
function catatLog(...pesan) {
  return pesan.join(" | ");
}

console.log("5. Spread:", { bukuBaru, gabung });
console.log("5. Rest:", catatLog("GET", "/buku", "200"));

// ============================================================
// 6. Array methods — map / filter / find / findIndex / reduce
// ============================================================
const buku = [
  { id: 1, judul: "Belajar Node.js", penulis: "Andi", tahun: 2024, stok: 3 },
  { id: 2, judul: "Dasar JavaScript", penulis: "Budi", tahun: 2023, stok: 0 },
  { id: 3, judul: "REST API untuk Pemula", penulis: "Citra", tahun: 2025, stok: 5 },
];

// map: transformasi → array baru
const judulBuku = buku.map((b) => b.judul);
// filter: saring sesuai kondisi
const tersedia = buku.filter((b) => b.stok > 0);
// find: cari satu item (dipakai cariBuku() di perpustakaan.js P1)
const detail = buku.find((b) => b.id === 2);
// findIndex: posisi item (dipakai untuk hapus di P1)
const index = buku.findIndex((b) => b.id === 2);
// reduce: akumulasi menjadi satu nilai
const totalStok = buku.reduce((acc, b) => acc + b.stok, 0);

console.log("6. map:", judulBuku);
console.log("6. filter:", tersedia.map((b) => b.judul));
console.log("6. find:", detail);
console.log("6. findIndex:", index);
console.log("6. reduce:", totalStok);

// ============================================================
// 7. Optional chaining ?. dan nullish coalescing ??
// ============================================================
const body = { mahasiswa: { nama: "Ani" } };
// ?. aman saat property bisa tidak ada (body.null?.nama → undefined, bukan error)
const namaBody = body.mahasiswa?.nama ?? "Tanpa Nama"; // ?? hanya peduli null/undefined
const stokInput = Number(process.env.STOK ?? 0);
const stokDefault = stokInput ?? 10; // 0 tetap 0, karena 0 bukan null/undefined

console.log("7. Optional:", { namaBody, stokDefault });

// ============================================================
// 8. Module — memecah kode ke banyak file (dibahas P3)
// Preview: module adalah "file terpisah yang bisa saling import"
// ============================================================
const { formatRupiah } = require("./modul-02");
console.log("8. Module:", formatRupiah(15000)); // Rp15.000