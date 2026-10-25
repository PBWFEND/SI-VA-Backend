// Versi sesudah refactor

const tampilkanAbsensi = (absensi, status = "Semua") => {
 

  const hasil = absensi.map(({ kegiatan }) => kegiatan);

  console.log(`Status: ${status}`);
  console.log(`Daftar kegiatan: ${hasil.join(", ")}`);
}

const dataAbsensi = [
  { id: "BS001", anggota_id: "AGT001", kegiatan: "Rapat UKM", tanggal: "2026-08-18", status: "hadir" },
  { id: "ABS001", anggota_id: "AGT002", kegiatan: "Rapat UKM", tanggal: "2026-08-18", status: "hadir" },
  { id: "ABS002", anggota_id: "AGT003", kegiatan: "Rapat Evaluasi", tanggal: "2026-08-03", status: "hadir" },
];

tampilkanAbsensi(dataAbsensi);