/**
 * ============================================================
 * Tugas 1 — Refactor ES6+ Absensi Organisasi
 * ============================================================
 * Menerapkan fitur JavaScript modern:
 * arrow function, template literal, destructuring,
 * default value, dan array methods.
 */

// Data absensi organisasi
const absensi = [
  {
    id: 1,
    nama: "Andi",
    jabatan: "Ketua",
    tanggal: "2026-09-28",
    status: "Hadir",
  },
  {
    id: 2,
    nama: "Siti",
    jabatan: "Sekretaris",
    tanggal: "2026-09-28",
    status: "Izin",
  },
  {
    id: 3,
    nama: "Rina",
    jabatan: "Bendahara",
    tanggal: "2026-09-28",
    status: "Hadir",
  },
];

// Arrow function + destructuring + template literal
const tampilkanAbsensi = ({
  nama = "Tanpa Nama",
  jabatan = "Anggota",
  tanggal = "-",
  status = "Hadir",
}) => {
  return `${nama} - ${jabatan} - ${tanggal} - ${status}`;
};

// map: mengambil nama anggota
const daftarNama = absensi.map(({ nama }) => nama);

// filter: mengambil anggota yang hadir
const anggotaHadir = absensi.filter(
  ({ status }) => status === "Hadir"
);

// find: mencari satu data berdasarkan ID
const cariAbsensi = (id) =>
  absensi.find(({ id: idAbsensi }) => idAbsensi === id) ?? null;

// findIndex: mencari posisi data
const cariIndex = (id) =>
  absensi.findIndex(({ id: idAbsensi }) => idAbsensi === id);

// reduce: menghitung jumlah anggota hadir
const jumlahHadir = absensi.reduce(
  (total, { status }) =>
    status === "Hadir" ? total + 1 : total,
  0
);

// Default value
const buatStatus = (status = "Hadir") => status;

// Spread: membuat data baru dari data sebelumnya
const absensiBaru = {
  ...absensi[0],
  status: "Izin",
};

// Output hasil refactor
console.log("=== HASIL REFACTOR ===");

console.log(
  "Data pertama:",
  tampilkanAbsensi(absensi[0])
);

console.log("Daftar nama:", daftarNama);

console.log(
  "Anggota hadir:",
  anggotaHadir.map(({ nama }) => nama)
);

console.log("Cari ID 2:", cariAbsensi(2));

console.log("Index ID 2:", cariIndex(2));

console.log("Jumlah anggota hadir:", jumlahHadir);

console.log("Default status:", buatStatus());

console.log("Data setelah spread:", absensiBaru);