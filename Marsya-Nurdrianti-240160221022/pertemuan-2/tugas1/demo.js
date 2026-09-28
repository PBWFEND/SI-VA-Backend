// Tugas 1 Pertemuan 2
// Demo Mini-Service Absensi Organisasi

const service = require("./service");

const main = async () => {
  try {
    console.log("=== DEMO SERVICE ABSENSI ORGANISASI ===");

    // 1. findAll
    const semuaData = await service.findAll();

    console.log("\n1. Semua Data Absensi:");
    console.log(semuaData);

    // 2. findById
    const dataId1 = await service.findById(1);

    console.log("\n2. Data dengan ID 1:");
    console.log(dataId1);

    // 3. create
    const dataBaru = await service.create({
      nim: "240160221030",
      nama: "Anggota Baru",
      tanggal: "2026-09-21",
      status: "Hadir",
    });

    console.log("\n3. Data Baru:");
    console.log(dataBaru);

    // 4. update
    const dataUpdate = await service.update(2, {
      status: "Hadir",
    });

    console.log("\n4. Data Setelah Update:");
    console.log(dataUpdate);

    // 5. Promise.all()
    // Dua query dijalankan secara paralel
    const hasilParalel = await Promise.all([
      service.findById(1),
      service.findById(3),
    ]);

    console.log("\n5. Hasil Promise.all():");
    console.log(hasilParalel);

    // 6. delete
    const dataHapus = await service.delete(3);

    console.log("\n6. Data yang Dihapus:");
    console.log(dataHapus);

    // 7. Pengujian ID yang tidak ditemukan
    const dataTidakAda = await service.findById(99);

    if (dataTidakAda === null) {
      throw new Error("Data dengan ID 99 tidak ditemukan");
    }

    console.log(dataTidakAda);
  } catch (error) {
    console.log("\nTerjadi kesalahan:");
    console.log(error.message);
  }
};

main();