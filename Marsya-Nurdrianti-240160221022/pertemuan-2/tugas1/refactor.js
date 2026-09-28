// Tugas 1 Pertemuan 2
// Refactor Kode Absensi Organisasi

const dataAbsensi = [
  {
    id: 1,
    nim: "240160221022",
    nama: "Marsya Nurdrianti",
    tanggal: "2026-09-21",
    status: "Hadir",
  },
  {
    id: 2,
    nim: "240160221008",
    nama: "Dela Kartika",
    tanggal: "2026-09-21",
    status: "Izin",
  },
  {
    id: 3,
    nim: "240160221011",
    nama: "Fatin Ashri",
    tanggal: "2026-09-21",
    status: "Hadir",
  },
];

// =====================================================
// VERSI SEBELUM REFACTOR
// =====================================================

function tampilkanAbsensi(data, status) {
  var hasil = [];

  for (var i = 0; i < data.length; i++) {
    if (data[i].status === status) {
      hasil.push(
        "NIM: " +
          data[i].nim +
          ", Nama: " +
          data[i].nama +
          ", Status: " +
          data[i].status
      );
    }
  }

  return hasil;
}

console.log("=== VERSI SEBELUM REFACTOR ===");
console.log(tampilkanAbsensi(dataAbsensi, "Hadir"));

// =====================================================
// VERSI SESUDAH REFACTOR
// =====================================================

const tampilkanAbsensiBaru = (
  data = [],
  status = "Hadir"
) => {
  return data
    .filter(({ status: statusAbsensi }) => statusAbsensi === status)
    .map(({ nim, nama, status }) =>
      `NIM: ${nim}, Nama: ${nama}, Status: ${status}`
    );
};

console.log("\n=== VERSI SESUDAH REFACTOR ===");
console.log(tampilkanAbsensiBaru(dataAbsensi));