/**
 * Skrip Pengujian Persistensi Basis Data — Latihan Individu Pertemuan 8
 * Menguji API Mahasiswa (Pertemuan-7/Tugas-5)
 * Memverifikasi persistensi data melewati siklus restart server secara utuh.
 */

import { app } from "../../Pertemuan-7/Tugas-5/app.ts";
import { prisma } from "../../Pertemuan-7/Tugas-5/src/config/client.ts";
import type { Server } from "http";

export interface PersistenceStepResult {
  step: number;
  deskripsi: string;
  detail: string;
  status: "PASS" | "FAIL";
}

async function runPersistenceTest() {
  console.log("================================================================================");
  console.log(" PENGUJIAN PERSISTENSI BASIS DATA — API MAHASISWA (TUGAS-5)");
  console.log("================================================================================\n");

  const results: PersistenceStepResult[] = [];
  const NIM_TEST = "TEST80000003";

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
  const countAwal = await prisma.mahasiswa.count();
  addResult(1, "Pencatatan data awal database", `Jumlah baris awal: ${countAwal}`, true);

  // Bersihkan data uji jika sebelumnya pernah ada
  await prisma.mahasiswa.deleteMany({ where: { nim: NIM_TEST } });

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
    // 3. Buat data mahasiswa khusus pengujian melalui POST /mahasiswa
    const postPayload = {
      nim: NIM_TEST,
      nama: "Mahasiswa Uji Persistensi",
      prodi: "Sistem Informasi",
      angkatan: 2024,
    };

    const postRes = await fetch(`${baseUrl1}/mahasiswa`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(postPayload),
    });
    const postBody = (await postRes.json()) as any;
    const postSuccess =
      postRes.status === 201 &&
      postBody.success === true &&
      postBody.data?.nim === NIM_TEST;

    addResult(
      2,
      "Pembuatan data mahasiswa uji (POST /mahasiswa)",
      `Status: ${postRes.status}, NIM: ${postBody.data?.nim ?? "-"}, Nama: ${postBody.data?.nama ?? "-"}`,
      postSuccess
    );

    // 4. Pastikan data berhasil dibuat dan dapat dibaca via GET /mahasiswa/:nim pada Sesi 1
    const getRes1 = await fetch(`${baseUrl1}/mahasiswa/${NIM_TEST}`);
    const getBody1 = (await getRes1.json()) as any;
    const get1Success =
      getRes1.status === 200 &&
      getBody1.success === true &&
      getBody1.data?.nim === NIM_TEST &&
      getBody1.data?.nama === postPayload.nama;

    addResult(
      3,
      "Pembacaan data sebelum restart (GET /mahasiswa/:nim)",
      `Status: ${getRes1.status}, Data terbaca: ${JSON.stringify(getBody1.data)}`,
      get1Success
    );
  } finally {
    // 5. Matikan server sesi 1 sepenuhnya
    if (server1) {
      await new Promise<void>((resolve) => {
        server1!.close(() => {
          console.log("\n[Server Sesi 1] Dimatikan sepenuhnya (Server shutdown complete).");
          resolve();
        });
      });
      server1 = null;
    }
  }

  addResult(
    4,
    "Shutdown server sesi 1",
    "Server sesi 1 dimatikan dan port dilepas",
    true
  );

  // Beri jeda sejenak untuk memastikan server instance lama telah terlepas sempurna
  await new Promise((r) => setTimeout(r, 500));

  // 6. Jalankan kembali server sesi 2 dengan konfigurasi yang sama
  let server2: Server | null = app.listen(0);
  const address2 = server2.address();
  if (!address2 || typeof address2 === "string") {
    throw new Error("Gagal menginisialisasi server sesi 2");
  }
  const port2 = address2.port;
  const baseUrl2 = `http://127.0.0.1:${port2}`;
  console.log(`[Server Sesi 2] Aktif kembali pada port baru ${port2} (Server restart success)\n`);

  addResult(
    5,
    "Restart server sesi 2",
    `Server baru aktif kembali di ${baseUrl2}`,
    true
  );

  try {
    // 7. Periksa kembali data menggunakan GET /mahasiswa/:nim pada Server Sesi 2
    const getRes2 = await fetch(`${baseUrl2}/mahasiswa/${NIM_TEST}`);
    const getBody2 = (await getRes2.json()) as any;
    const get2Success =
      getRes2.status === 200 &&
      getBody2.success === true &&
      getBody2.data?.nim === NIM_TEST &&
      getBody2.data?.nama === "Mahasiswa Uji Persistensi" &&
      getBody2.data?.prodi === "Sistem Informasi" &&
      getBody2.data?.angkatan === 2024;

    addResult(
      6,
      "Verifikasi persistensi data pasca-restart (GET /mahasiswa/:nim)",
      `Status: ${getRes2.status}, Data tetap utuh di database: ${JSON.stringify(getBody2.data)}`,
      get2Success
    );

    // 8. Hapus hanya data khusus pengujian tersebut (DELETE /mahasiswa/:nim)
    const delRes = await fetch(`${baseUrl2}/mahasiswa/${NIM_TEST}`, {
      method: "DELETE",
    });
    const delSuccess = delRes.status === 204;

    addResult(
      7,
      "Pembersihan data khusus pengujian (DELETE /mahasiswa/:nim)",
      `Status: ${delRes.status} (No Content)`,
      delSuccess
    );

    // 9. Pastikan data sudah tidak ditemukan lagi (GET → 404)
    const getRes3 = await fetch(`${baseUrl2}/mahasiswa/${NIM_TEST}`);
    const getBody3 = (await getRes3.json()) as any;
    const get3Success =
      getRes3.status === 404 &&
      getBody3.success === false &&
      getBody3.message.includes("tidak ditemukan");

    addResult(
      8,
      "Verifikasi data terhapus (GET /mahasiswa/:nim → 404)",
      `Status: ${getRes3.status}, Pesan: ${getBody3.message}`,
      get3Success
    );
  } finally {
    // Matikan server sesi 2
    if (server2) {
      await new Promise<void>((resolve) => {
        server2!.close(() => {
          console.log("\n[Server Sesi 2] Dimatikan sepenuhnya.");
          resolve();
        });
      });
      server2 = null;
    }
    await prisma.$disconnect();
  }

  // 10. Pastikan jumlah data database kembali ke kondisi awal
  const countAkhir = await prisma.mahasiswa.count();
  const countMatch = countAkhir === countAwal;
  addResult(
    9,
    "Verifikasi integritas database akhir",
    `Jumlah data awal: ${countAwal}, Jumlah data akhir: ${countAkhir}`,
    countMatch
  );

  const allPassed = results.every((r) => r.status === "PASS");
  console.log("\n================================================================================");
  console.log(` KESIMPULAN PENGUJIAN PERSISTENSI: ${allPassed ? "SELURUH TAHAP LULUS (PASS)" : "ADA TAHAP GAGAL (FAIL)"}`);
  console.log("================================================================================");

  if (!allPassed) {
    process.exitCode = 1;
  }
}

runPersistenceTest().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

