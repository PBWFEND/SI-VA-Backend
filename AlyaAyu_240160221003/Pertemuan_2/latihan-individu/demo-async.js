/**
 * ============================================================
 * Demo Pertemuan 2 — Asynchronous JavaScript & Promise
 * ============================================================
 * Tujuan:
 *   1. Memahami kenapa backend wajib paham async:
 *      baca file, query database, request ke API lain = SEMUA async
 *   2. Callback → Promise → async/await (evolusi penanganan async)
 *
 * Jalankan:
 *   node demo-async.js
 *
 * Catatan: file ini memakai ESM (import) + top-level await.
 * Node.js 20+ mendeteksi sintaks module secara otomatis,
 * sehingga tidak memerlukan package.json.
 */

import fs from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";

// Helper kecil: beri waktu event loop memproses antrian async
const jeda = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ============================================================
// 1. Synchronous vs Asynchronous — dengan setTimeout simulasi
// ============================================================
console.log("1. --- Synchronous vs Asynchronous ---");
console.log("1. mulai (sync)");

// Async: penundaan 0ms pun tetap dieksekusi SETELAH semua kode sync selesai
setTimeout(() => console.log("1. [async setTimeout 0ms] ← baru muncul sekarang!"), 0);

console.log("1. selesai (sync) ← muncul duluan walau ditulis belakangan");
await jeda(10); // tunggu event loop agar urutan demo tetap rapi

// ============================================================
// 2. Callback — cara lama (Node.js error-first convention)
// ============================================================
// Promisifikasi: membungkus callback menjadi Promise
// agar bisa dipakai dengan await (pola yang dipakai sebelum fs/promises ada)
function bacaFileCallback(namaFile) {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(import.meta.dirname, namaFile), "utf8", (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

console.log("2. --- Callback (dibungkus Promise) ---");
const isiCallback = await bacaFileCallback("data.txt");
console.log("2. callback sukses:", isiCallback.trim().split("\n")[0]);

// ============================================================
// 3. Promise — pending → fulfilled | rejected
// ============================================================
// Membuat Promise sendiri: simulasi ambil data buku dari "database"
function ambilBuku(delayMs = 300) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const sukses = true;
      if (sukses) {
        resolve([
          { id: 1, judul: "Belajar Node.js", stok: 3 },
          { id: 2, judul: "Dasar JavaScript", stok: 0 },
        ]);
      } else {
        reject(new Error("Database tidak merespons"));
      }
    }, delayMs);
  });
}

console.log("3. --- Promise: top-level await / try / catch / finally ---");
try {
  const bukuPromise = await ambilBuku(200);
  console.log("3. await:", bukuPromise.length, "buku ditemukan");
} catch (error) {
  console.log("3. catch:", error.message);
} finally {
  console.log("3. finally: selesai (apapun hasilnya)");
}

// ============================================================
// 4. async/await — Promise yang ditulis seperti kode sync
// ============================================================
console.log("4. --- async/await ---");

const buku = await ambilBuku(200);
console.log("4. await:", buku.map((b) => `${b.judul} (stok ${b.stok})`).join(", "));

// try/catch untuk menangkap error await (padanan .catch)
try {
  await Promise.reject(new Error("koneksi database terputus"));
} catch (err) {
  console.log("4. try/catch menangkap:", err.message);
}

// ============================================================
// 5. Promise.all — paralel (total waktu = yang terlama, bukan jumlah)
// ============================================================
const tunda = (ms, nilai) => new Promise((resolve) => setTimeout(() => resolve(nilai), ms));

console.log("5. --- Promise.all (paralel) ---");
const mulai = Date.now();

// 3 pekerjaan "berjalan bersamaan"
const [buku2, anggota, peminjaman] = await Promise.all([
  tunda(300, "data buku"),
  tunda(200, "data anggota"),
  tunda(100, "data peminjaman"),
]);

console.log("5. hasil:", { buku2, anggota, peminjaman });
console.log(`5. total ±${Date.now() - mulai}ms (bukan 300+200+100=600ms)`);

// ============================================================
// 6. Studi kasus backend: baca file memakai fs/promises
// ============================================================
console.log("6. --- fs/promises ---");
const isi = await readFile(path.join(import.meta.dirname, "data.txt"), "utf8");
console.log("6. isi data.txt:", isi.trim().split("\n")[0]);

console.log("\nSemua demo async selesai.");