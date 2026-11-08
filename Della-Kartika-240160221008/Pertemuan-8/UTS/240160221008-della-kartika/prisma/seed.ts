import { prisma } from "../client.ts";

async function main() {
  console.log("Menjalankan database seed untuk absensi-della-kartika...");

  const dataAwal = [
    {
      nim: "240160221008",
      namaMahasiswa: "Della Kartika",
      kelas: "Informatika",
      tanggal: new Date("2026-11-02T08:00:00.000Z"),
      status: "Hadir",
      keterangan: "Mengikuti perkuliahan UTS Praktikum Backend",
    },
    {
      nim: "240160221008",
      namaMahasiswa: "Della Kartika",
      kelas: "Informatika",
      tanggal: new Date("2026-11-01T08:00:00.000Z"),
      status: "Hadir",
      keterangan: "Mengikuti perkuliahan teori",
    },
    {
      nim: "240160221003",
      namaMahasiswa: "Alya Ayu",
      kelas: "Informatika",
      tanggal: new Date("2026-11-02T08:00:00.000Z"),
      status: "Izin",
      keterangan: "Menghadiri kegiatan akademik",
    },
    {
      nim: "240160221011",
      namaMahasiswa: "Faatin Ashri",
      kelas: "Informatika",
      tanggal: new Date("2026-11-02T08:00:00.000Z"),
      status: "Sakit",
      keterangan: "Surat dokter terlampir",
    },
    {
      nim: "240160221048",
      namaMahasiswa: "Yosep",
      kelas: "Informatika",
      tanggal: new Date("2026-11-02T08:00:00.000Z"),
      status: "Alpa",
      keterangan: "Tanpa keterangan",
    },
  ];

  for (const item of dataAwal) {
    await prisma.absensi.create({
      data: item,
    });
  }

  const count = await prisma.absensi.count();
  console.log(`Seeding selesai. Total data absensi saat ini: ${count}`);
}

main()
  .catch((e) => {
    console.error("Gagal menjalankan seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

