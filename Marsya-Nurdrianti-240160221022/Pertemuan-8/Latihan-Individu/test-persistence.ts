/**
 * Skrip Pengujian Persistensi Basis Data — Latihan Individu Pertemuan 8
 * Menguji API Sistem Informasi Absensi Mahasiswa (UTS)
 * Memverifikasi persistensi data melewati siklus restart server secara utuh.
 * Mahasiswa: Marsya Nurdrianti (NIM: 240160221022) — Kelas SI-VA
 */

import { app } from "../uts/240160221022-Marsya-Nurdrianti/src/app.ts";
import { prisma } from "../uts/240160221022-Marsya-Nurdrianti/src/client.ts";
import type { Server } from "node:http";

export interface PersistenceStepResult {
  step: number;
  deskripsi: string;
  detail: string;
  status: "PASS" | "FAIL";
}

async function runPersistenceTest() {
  console.log("================================================================================");
  console.log(" PENGUJIAN PERSISTENSI BASIS DATA — API ABSENSI MAHASISWA");
  console.log(" Mahasiswa: Marsya Nurdrianti (NIM: 240160221022) — SI-VA");
  console.log("================================================================================\n");

  const results: PersistenceStepResult[] = [];
  const NIM_TEST = "TEST80000003";
  let createdId: number | null = null;

  const addResult = (step: number, deskripsi: string, detail: string, isPass: boolean) => {
    results.push({
      step,
      deskripsi,
      detail,
      status: isPass ? "PASS" : "FAIL",
    });
    console.log(`${isPass ? "✔ [PASS]" : "✖ [FAIL]"} Langkah ${step}: ${deskripsi} — ${detail}`);
  };

  // 1. Catat jumlah data awal
  const countAwal = await prisma.absensi.count();
  addResult(1, "Pencatatan data awal database", `Jumlah baris awal: ${countAwal}`, true);

  // Bersihkan data uji jika sebelumnya pernah ada
  await prisma.absensi.deleteMany({ where: { nim: NIM_TEST } });

  // 2. Jalankan server sesi 1
  let server1: Server | null = app.listen(0);
  const address1 = server1.address();
  if (!address1 || typeof address1 === "string") {
    throw new Error("Gagal menginisialisasi server sesi 1");
  }
  const port1 = address1.port;
  const baseUrl1 = `http://127.0.0.1:${port1}`;
  console.log(`[Server Sesi 1] Aktif pada port ${port1}`);

  try {
    // 3. Buat data absensi khusus pengujian melalui POST /api/absensi
    const postPayload = {
      nim: NIM_TEST,
      namaMahasiswa: "Mahasiswa Uji Persistensi Marsya",
      tanggal: "2026-11-02",
      waktuMasuk: "07:30",
      status: "Hadir",
      keterangan: "Data uji ketahanan persistensi siklus restart",
    };

    const resPost = await fetch(`${baseUrl1}/api/absensi`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(postPayload),
    });
    const bodyPost = (await resPost.json()) as any;
    createdId = bodyPost.data?.id;

    addResult(
      2,
      "Pembuatan data absensi uji (POST /api/absensi)",
      `Status HTTP ${resPost.status} (ID terbuat: ${createdId})`,
      resPost.status === 201 && createdId !== null
    );

    // 4. Verifikasi data terbaca pada server sesi 1 (GET /api/absensi/:id)
    const resGet1 = await fetch(`${baseUrl1}/api/absensi/${createdId}`);
    const bodyGet1 = (await resGet1.json()) as any;
    addResult(
      3,
      "Verifikasi data pada Server Sesi 1 (GET /api/absensi/:id)",
      `Status HTTP ${resGet1.status} (Nama: ${bodyGet1.data?.namaMahasiswa})`,
      resGet1.status === 200 && bodyGet1.data?.nim === NIM_TEST
    );
  } finally {
    // 5. Matikan server sesi 1 secara total
    await new Promise<void>((resolve, reject) => {
      server1?.close((err) => (err ? reject(err) : resolve()));
    });
    server1 = null;
    console.log("[Server Sesi 1] Berhasil dimatikan sepenuhnya. Data berada di disk SQLite.");
  }

  // 6. Jalankan server sesi 2 pada port dinamis baru (Simulasi Restart Penuh)
  let server2: Server | null = app.listen(0);
  const address2 = server2.address();
  if (!address2 || typeof address2 === "string") {
    throw new Error("Gagal menginisialisasi server sesi 2");
  }
  const port2 = address2.port;
  const baseUrl2 = `http://127.0.0.1:${port2}`;
  console.log(`[Server Sesi 2 - Restart] Aktif pada port baru ${port2}`);

  try {
    // 7. Ambil kembali data pada server sesi 2 (GET /api/absensi/:id)
    const resGet2 = await fetch(`${baseUrl2}/api/absensi/${createdId}`);
    const bodyGet2 = (await resGet2.json()) as any;
    addResult(
      4,
      "Verifikasi persistensi data pasca-restart (GET /api/absensi/:id)",
      `Status HTTP ${resGet2.status} (Data tetap tersimpan: ${bodyGet2.data?.namaMahasiswa})`,
      resGet2.status === 200 && bodyGet2.data?.id === createdId && bodyGet2.data?.nim === NIM_TEST
    );

    // 8. Hapus data uji sementara (DELETE /api/absensi/:id)
    const resDelete = await fetch(`${baseUrl2}/api/absensi/${createdId}`, {
      method: "DELETE",
    });
    addResult(
      5,
      "Pembersihan data uji pasca verifikasi (DELETE /api/absensi/:id)",
      `Status HTTP ${resDelete.status} No Content`,
      resDelete.status === 204
    );

    // 9. Verifikasi bahwa data sudah tidak ada (GET /api/absensi/:id -> 404)
    const resGet3 = await fetch(`${baseUrl2}/api/absensi/${createdId}`);
    addResult(
      6,
      "Verifikasi data telah terhapus dari basis data (GET /api/absensi/:id)",
      `Status HTTP ${resGet3.status} Not Found`,
      resGet3.status === 404
    );

    // 10. Verifikasi jumlah baris akhir kembali seperti semula
    const countAkhir = await prisma.absensi.count();
    addResult(
      7,
      "Verifikasi integritas jumlah baris database akhir",
      `Jumlah baris akhir: ${countAkhir} (sama dengan kondisi awal: ${countAwal})`,
      countAkhir === countAwal
    );
  } finally {
    // Tutup server sesi 2 dan disconnect Prisma
    await new Promise<void>((resolve, reject) => {
      server2?.close((err) => (err ? reject(err) : resolve()));
    });
    server2 = null;
    await prisma.$disconnect();
    console.log("[Server Sesi 2] Berhasil dimatikan dan koneksi basis data ditutup bersih.\n");
  }

  const allPassed = results.every((r) => r.status === "PASS");
  console.log("================================================================================");
  console.log(` REKAPITULASI PENGUJIAN PERSISTENSI: ${results.filter((r) => r.status === "PASS").length}/${results.length} LANGKAH BERHASIL (PASS)`);
  if (allPassed) {
    console.log(" KESIMPULAN: BASIS DATA SQLITE TERBUKTI PERSISTEN MELEWATI SIKLUS RESTART TOTAL.");
  } else {
    console.log(" PERINGATAN: Pengujian persistensi mengalami kegagalan.");
  }
  console.log("================================================================================\n");

  if (!allPassed) {
    process.exit(1);
  }
}

runPersistenceTest().catch((err) => {
  console.error("Fatal persistence error:", err);
  process.exit(1);
});
