// Versi sesudah refactor

const tampilkanAbsensi = (absensi, status = "Semua") => {
 

  const hasil = absensi.map(({ kegiatan }) => kegiatan);

  console.log(`Status: ${status}`);
  console.log(`Daftar kegiatan: ${hasil.join(", ")}`);
}

const dataAbsensi = [
  { id: "BS001", anggota_id: "AGT001", kegiatan: "Rapat Pembahasan LDKM", tanggal: "2026-09-27", status: "hadir" },
  { id: "ABS001", anggota_id: "AGT002", kegiatan: "Rapat Pembahasan LDKM", tanggal: "2026-09-27", status: "hadir" },
  { id: "ABS002", anggota_id: "AGT003", kegiatan: "Rapat Program Kerja", tanggal: "2026-09-28", status: "hadir" },
];

tampilkanAbsensi(dataAbsensi);