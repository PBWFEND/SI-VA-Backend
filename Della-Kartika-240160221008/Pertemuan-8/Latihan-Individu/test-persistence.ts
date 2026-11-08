/**
 * Skrip Pengujian Persistensi Basis Data — Latihan Individu Pertemuan 8
 * Menguji API Absensi Mahasiswa
 * Della Kartika — 240160221008
 * Memverifikasi persistensi data melewati siklus restart server secara utuh.
 */

import { app } from "../UTS/240160221008-della-kartika/app.ts";
import { prisma } from "../UTS/240160221008-della-kartika/src/config/client.ts";
import type { Server } from "http";

export interface PersistenceStepResult {
  step: number;
  deskripsi: string;
  detail: string;
  status: "PASS" | "FAIL";
}

async function runPersistenceTest() {
  console.log("================================================================================");
  console.log(" PENGUJIAN PERSISTENSI BASIS DATA — API ABSENSI MAHASISWA");
  console.log(" DELLA KARTIKA — 240160221008");
  console.log("================================================================================\n");

  const results: PersistenceStepResult[] = [];
  const NIM_TEST = "240160221008";

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

  // 2. Jalankan server sesi 1
  let server1: Server | null = app.listen(0);
  const address1 = server1.address();
  if (!address1 || typeof address1 === "string") {
    throw new Error("Gagal menginisialisasi server sesi 1");
  }
  const port1 = address1.port;
  const baseUrl1 = `http://127.0.0.1:${port1}`;
  console.log(`[Server Sesi 1] Aktif pada port ${port1}`);

  let createdId = 0;

  try {
    // 3. Buat data absensi khusus pengujian melalui POST /api/absensi
    const postPayload = {
      nim: NIM_TEST,
      namaMahasiswa: "Della Kartika Uji Persistensi",
      kelas: "Informatika",
      tanggal: "2026-11-02T10:00:00.000Z",
      status: "Hadir",
      keterangan: "Pencatatan kehadiran sesi 1 sebelum restart",
    };

    const postRes = await fetch(`${baseUrl1}/api/absensi`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(postPayload),
    });
    const postBody = (await postRes.json()) as any;
    createdId = postBody.data?.id ?? 0;
    const postSuccess = postRes.status === 201 && postBody.success === true && createdId > 0;

    addResult(
      2,
      "Pembuatan data absensi uji (POST /api/absensi)",
      `Status: ${postRes.status}, ID: ${createdId}, Nama: ${postBody.data?.namaMahasiswa ?? "-"}`,
      postSuccess
    );

    // 4. Pastikan data berhasil dibuat dan dapat dibaca via GET /api/absensi/:id pada Sesi 1
    const getRes1 = await fetch(`${baseUrl1}/api/absensi/${createdId}`);
    const getBody1 = (await getRes1.json()) as any;
    const get1Success =
      getRes1.status === 200 &&
      getBody1.success === true &&
      getBody1.data?.id === createdId &&
      getBody1.data?.namaMahasiswa === postPayload.namaMahasiswa;

    addResult(
      3,
      "Pembacaan data sebelum restart (GET /api/absensi/:id)",
      `Status: ${getRes1.status}, Data terbaca: ${JSON.stringify(getBody1.data)}`,
      get1Success
    );
  } finally {
    // 5. Matikan server sesi 1 sepenuhnya
    if (server1) {
      await new Promise<void>((resolve) => {
        server1!.close(() => {
          console.log("\n[Server Sesi 1] Dimatikan sepenuhnya (Server shutdown complete).");
          server1 = null;
          resolve();
        });
      });
      addResult(4, "Shutdown server sesi 1 secara tuntas", "Port dilepaskan dan server sesi 1 berhenti", true);
    }
  }

  // Jeda transisi
  await new Promise((resolve) => setTimeout(resolve, 500));

  // 6. Jalankan server sesi 2 (menyimulasikan restart server)
  console.log("\n[Server Sesi 2] Memulai server kembali dengan koneksi basis data SQLite yang sama...");
  const server2 = app.listen(0);
  const address2 = server2.address();
  if (!address2 || typeof address2 === "string") {
    throw new Error("Gagal menginisialisasi server sesi 2");
  }
  const port2 = address2.port;
  const baseUrl2 = `http://127.0.0.1:${port2}`;
  console.log(`[Server Sesi 2] Aktif pada port ${port2}`);
  addResult(5, "Restart server sesi 2 dengan konfigurasi sama", `Server sesi 2 aktif pada port ${port2}`, true);

  try {
    // 7. Baca kembali data yang dibuat pada Sesi 1 melalui Server Sesi 2
    const getRes2 = await fetch(`${baseUrl2}/api/absensi/${createdId}`);
    const getBody2 = (await getRes2.json()) as any;
    const get2Success =
      getRes2.status === 200 &&
      getBody2.success === true &&
      getBody2.data?.id === createdId &&
      getBody2.data?.namaMahasiswa === "Della Kartika Uji Persistensi";

    addResult(
      6,
      "Verifikasi persistensi data pasca-restart (GET /api/absensi/:id)",
      `Status: ${getRes2.status}, Data tetap utuh dari SQLite: ${JSON.stringify(getBody2.data)}`,
      get2Success
    );

    // 8. Hapus data absensi uji pembersihan
    const delRes = await fetch(`${baseUrl2}/api/absensi/${createdId}`, {
      method: "DELETE",
    });
    addResult(
      7,
      "Pembersihan data absensi khusus pengujian (DELETE /api/absensi/:id)",
      `Status: ${delRes.status}`,
      delRes.status === 204
    );

    // 9. Pastikan data sudah terhapus
    const getRes3 = await fetch(`${baseUrl2}/api/absensi/${createdId}`);
    addResult(
      8,
      "Verifikasi data uji sudah terhapus dari basis data",
      `Status: ${getRes3.status}`,
      getRes3.status === 404
    );

    // 10. Periksa jumlah baris akhir database
    const countAkhir = await prisma.absensi.count();
    const countMatch = countAkhir === countAwal;
    addResult(
      9,
      "Verifikasi integritas akhir database",
      `Jumlah baris: ${countAkhir} (Awal: ${countAwal})`,
      countMatch
    );
  } finally {
    await new Promise<void>((resolve) => {
      server2.close(() => {
        console.log("\n[Server Sesi 2] Dimatikan. Pengujian persistensi selesai.");
        resolve();
      });
    });
    await prisma.$disconnect();
  }

  // Rekapitulasi hasil pengujian
  console.log("\n================================================================================");
  console.log(" REKAPITULASI HASIL PENGUJIAN PERSISTENSI (9 TAHAP)");
  console.log("================================================================================");
  const passCount = results.filter((r) => r.status === "PASS").length;
  const failCount = results.filter((r) => r.status === "FAIL").length;
  console.log(`Total Tahapan : ${results.length}`);
  console.log(`Lulus (PASS)  : ${passCount}`);
  console.log(`Gagal (FAIL)  : ${failCount}`);
  console.log(`Tingkat Lulus : ${(passCount / results.length) * 100}%\n`);

  if (failCount > 0) {
    process.exit(1);
  }
}

runPersistenceTest().catch((err) => {
  console.error("Persistence test execution failed:", err);
  process.exit(1);
});
