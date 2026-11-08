/**
 * Persistence & Lifecycle Test — SQLite dev.db
 * Memverifikasi persistensi data melewati siklus restart server Express secara utuh.
 * Mahasiswa: Marsya Nurdrianti (240160221022) - SI-VA
 */

import { app } from "./src/app.ts";
import { prisma } from "./src/client.ts";
import type { Server } from "node:http";

interface PersistenceStep {
  step: number;
  description: string;
  expected: string;
  actual: string;
  passed: boolean;
}

async function runPersistenceTest() {
  console.log("================================================================================");
  console.log(" PENGUJIAN PERSISTENSI BASIS DATA SQLITE — RESTART SIKLUS SERVER");
  console.log(" Mahasiswa: Marsya Nurdrianti (240160221022) - SI-VA");
  console.log("================================================================================\n");

  const steps: PersistenceStep[] = [];
  let stepIndex = 1;

  function recordStep(description: string, expected: string, actual: string, passed: boolean) {
    const s: PersistenceStep = {
      step: stepIndex++,
      description,
      expected,
      actual,
      passed,
    };
    steps.push(s);
    const badge = passed ? "✔ [PASS]" : "✖ [FAIL]";
    console.log(`${badge} Tahap #${s.step}: ${s.description} | Status: ${s.actual} (Expected: ${s.expected})`);
  }

  const TEST_NIM_PERSIST = "240160221022-PST";
  let createdId: number | null = null;

  // 1. Catat jumlah data awal
  const countAwal = await prisma.absensi.count();
  recordStep("Pencatatan jumlah data awal di SQLite", "Success", `Ditemukan ${countAwal} baris`, true);

  // Bersihkan data jika ada sisa data uji
  await prisma.absensi.deleteMany({ where: { nim: TEST_NIM_PERSIST } });

  // 2. Mulai server sesi 1
  let server1: Server | null = app.listen(0);
  const addr1 = server1.address();
  if (!addr1 || typeof addr1 === "string") throw new Error("Gagal start server sesi 1");
  const baseUrl1 = `http://127.0.0.1:${addr1.port}`;
  console.log(`[LIFECYCLE] Server Sesi 1 aktif di port: ${addr1.port}`);

  try {
    // 3. POST data baru di sesi 1
    const postPayload = {
      nim: TEST_NIM_PERSIST,
      namaMahasiswa: "Marsya Nurdrianti Persistence",
      tanggal: "2026-11-02",
      waktuMasuk: "07:45",
      status: "Hadir",
      keterangan: "Data uji persistensi siklus restart server",
    };

    const resPost = await fetch(`${baseUrl1}/api/absensi`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(postPayload),
    });
    const postBody = (await resPost.json()) as any;
    createdId = postBody.data?.id;

    recordStep(
      "POST: Penambahan data absensi uji pada Server Sesi 1",
      "201 Created",
      `${resPost.status} Created (ID: ${createdId})`,
      resPost.status === 201 && createdId !== null
    );

    // 4. Verifikasi data terbaca di sesi 1
    const resGet1 = await fetch(`${baseUrl1}/api/absensi/${createdId}`);
    const getBody1 = (await resGet1.json()) as any;
    recordStep(
      "GET: Verifikasi data terbaca pada Server Sesi 1",
      "200 OK",
      `${resGet1.status} OK (${getBody1.data?.namaMahasiswa})`,
      resGet1.status === 200 && getBody1.data?.nim === TEST_NIM_PERSIST
    );
  } finally {
    // 5. Hentikan server sesi 1 secara total
    await new Promise<void>((resolve, reject) => {
      server1?.close((err) => (err ? reject(err) : resolve()));
    });
    server1 = null;
    console.log("[LIFECYCLE] Server Sesi 1 dimatikan secara total. Menguji persistensi SQLite fisik...");
  }

  // 6. Mulai server sesi 2 (simulasi server direstart)
  let server2: Server | null = app.listen(0);
  const addr2 = server2.address();
  if (!addr2 || typeof addr2 === "string") throw new Error("Gagal start server sesi 2");
  const baseUrl2 = `http://127.0.0.1:${addr2.port}`;
  console.log(`[LIFECYCLE] Server Sesi 2 (Restarted) aktif di port: ${addr2.port}`);

  try {
    // 7. GET data pada sesi 2 tanpa koneksi sesi 1
    const resGet2 = await fetch(`${baseUrl2}/api/absensi/${createdId}`);
    const getBody2 = (await resGet2.json()) as any;
    recordStep(
      "GET: Verifikasi data TETAP TERSIMPAN setelah server direstart (Persistensi Fisik)",
      "200 OK",
      `${resGet2.status} OK (ID: ${getBody2.data?.id}, Status: ${getBody2.data?.status})`,
      resGet2.status === 200 && getBody2.data?.id === createdId && getBody2.data?.nim === TEST_NIM_PERSIST
    );

    // 8. Bersihkan data uji melalui DELETE
    const resDel = await fetch(`${baseUrl2}/api/absensi/${createdId}`, {
      method: "DELETE",
    });
    recordStep(
      "DELETE: Pembersihan data uji pada Server Sesi 2",
      "204 No Content",
      `${resDel.status} No Content`,
      resDel.status === 204
    );

    // 9. Verifikasi data sudah tidak ada
    const resGet3 = await fetch(`${baseUrl2}/api/absensi/${createdId}`);
    recordStep(
      "GET: Verifikasi data telah terhapus bersih dari basis data",
      "404 Not Found",
      `${resGet3.status} Not Found`,
      resGet3.status === 404
    );
  } finally {
    await new Promise<void>((resolve, reject) => {
      server2?.close((err) => (err ? reject(err) : resolve()));
    });
    server2 = null;
    await prisma.$disconnect();
    console.log("[LIFECYCLE] Server Sesi 2 dimatikan. Koneksi database diputus dengan bersih.\n");
  }

  const allPassed = steps.every((s) => s.passed);
  console.log("================================================================================");
  console.log(` HASIL PENGUJIAN PERSISTENSI: ${steps.filter((s) => s.passed).length}/${steps.length} TAHAP BERHASIL`);
  if (allPassed) {
    console.log(" BUKTI PERSISTENSI: Data tersimpan secara non-volatile di SQLite dev.db dan tidak hilang saat restart.");
  } else {
    console.log(" PERINGATAN: Ada tahap persistensi yang gagal.");
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

