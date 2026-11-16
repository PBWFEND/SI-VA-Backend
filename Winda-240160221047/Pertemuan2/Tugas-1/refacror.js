/**
 * ============================================================
 * refactor.js — Perbandingan Kode Warisan (Legacy) vs Refactor
 * Tugas 1 — Pertemuan 2 (ES6+ & Async)
 * ============================================================
 */

// Data sampel absensi untuk pengujian fungsi refactor
const dataAbsensi = [
  { id: 1, nama: "Budi Santoso", status: "Hadir", waktu: "07:30" },
  { id: 2, nama: "Siti Aminah", status: "Izin", waktu: "08:15" },
  { id: 3, nama: "Joko Anwar", status: "Alpa", waktu: "-" },
  { id: 4, nama: "Dewi Lestari", status: "Hadir", waktu: "07:45" }
];

console.log("=== DEMO REFACTOR KODE ABSTRAK ===\n");

// --------------------------------------------------------
// 1. KODE SEBELUM (Legacy Code)
// Karakteristik: Pakai 'var', perulangan 'for' manual, string concatenation '+'
// --------------------------------------------------------
function formatDataAbsensiLegacy(data) {
  var hasilAkhir = [];
  for (var i = 0; i < data.length; i++) {
    if (data[i].status == "Hadir") {
      var info = "Nama: " + data[i].nama + " - Waktu: " + data[i].waktu;
      hasilAkhir.push(info);
    }
  }
  return hasilAkhir;
}

console.log("Hasil Versi SEBELUM (Legacy):");
console.log(formatDataAbsensiLegacy(dataAbsensi));
console.log("--------------------------------------------------");

// --------------------------------------------------------
// 2. KODE SESUDAH (Refactor ES6+)
// Karakteristik: Arrow function, default value, destructuring, filter & map, template literal
// --------------------------------------------------------
const formatDataAbsensiModern = (data, statusFilter = "Hadir") => {
  return data
    .filter(({ status }) => status === statusFilter)         // Destructuring + filter
    .map(({ nama, waktu }) => `Nama: ${nama} - Waktu: ${waktu}`); // Destructuring + template literal
};

console.log("Hasil Versi SESUDAH (Refactor ES6+):");
console.log(formatDataAbsensiModern(dataAbsensi));
console.log("--------------------------------------------------");