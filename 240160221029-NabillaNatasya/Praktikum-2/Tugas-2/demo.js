const {
  findAll,
  findById,
  create,
  update,
  remove,
} = require("./service");

async function main() {
  const data = await findAll();
  console.log("Daftar absensi:", data);

  const detail = await findById("ABS002");
  console.log("Detail absensi:", detail);

  const absensiBaru = await create({
    anggota_id: "AGT002",
    kegiatan: "Rapat Evaluasi",
    tanggal: "2026-08-03",
    status: "hadir",
  });
  console.log("Absensi baru:", absensiBaru);

  const absensiDiubah = await update("ABS002", {
    status: "Sakit",
  });
  console.log("Absensi setelah diubah:", absensiDiubah);

  const [absensiSatu, absensiTiga] = await Promise.all([
    findById("ABS001"),
    findById("ABS003"),
  ]);
  console.log("Query paralel:", absensiSatu, absensiTiga);

  try {
    const absensiTidakAda = await findById("ABS999");

    if (!absensiTidakAda) {
      throw new Error("Absensi tidak ditemukan");
    }

    console.log("Absensi:", absensiTidakAda);
  } catch (error) {
    console.log("Error:", error.message);
  }
}

main();