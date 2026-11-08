/**
 * Skrip Pengujian Persistensi Basis Data — Latihan Individu Pertemuan 8
 * Mahasiswa: Nabilla Natasya (NIM: 240160221029)
 * Menguji API Absensi (Pertemuan-8/uts/240160221029-Nabilla-Natasya)
 * Memverifikasi persistensi data SQLite melewati siklus restart server secara utuh.
 */

import http from "node:http";
import type { Server } from "node:http";
import { app } from "../uts/240160221029-Nabilla-Natasya/app.ts";
import { prisma } from "../uts/240160221029-Nabilla-Natasya/client.ts";

export interface PersistenceStepResult {
  step: number;
  deskripsi: string;
  detail: string;
  status: "PASS" | "FAIL";
}

function createClient(pipeName: string) {
  return function request(method: string, path: string, body?: unknown): Promise<{ status: number; body: any }> {
    return new Promise((resolve, reject) => {
      const payload = body !== undefined ? (typeof body === "string" ? body : JSON.stringify(body)) : null;
      const headers: Record<string, string | number> = {};
      if (payload !== null) {
        headers["Content-Type"] = "application/json";
        headers["Content-Length"] = Buffer.byteLength(payload);
      }

      const req = http.request(
        {
          socketPath: pipeName,
          path,
          method,
          headers,
        },
        (res) => {
          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => {
            let parsed: any = null;
            try {
              parsed = JSON.parse(data);
            } catch {
              parsed = data;
            }
            resolve({ status: res.statusCode ?? 500, body: parsed });
          });
        }
      );
      req.on("error", reject);
      if (payload !== null) {
        req.write(payload);
      }
      req.end();
    });
  };
}

async function runPersistenceTest() {
  console.log("================================================================================");
  console.log(" PENGUJIAN PERSISTENSI BASIS DATA SQLITE — SISTEM ABSENSI");
  console.log(" Mahasiswa: Nabilla Natasya (NIM: 240160221029)");
  console.log("================================================================================\n");

  const results: PersistenceStepResult[] = [];
  const NIM_TEST = "240160221029";

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
  addResult(1, "Pencatatan data awal database", `Jumlah baris awal di absensi: ${countAwal}`, true);

  // Bersihkan data uji jika sebelumnya pernah ada
  await prisma.absensi.deleteMany({ where: { keterangan: "TEST_PERSIST_SESSION" } });

  // 2. Jalankan server sesi 1
  const pipe1 = "\\\\.\\pipe\\persist-latihan8-s1-" + Date.now();
  let server1: Server | null = app.listen(pipe1);
  const client1 = createClient(pipe1);
  console.log(`[Server Sesi 1] Aktif pada pipe: ${pipe1}`);

  let createdId: number | null = null;

  try {
    // 3. Buat data absensi khusus pengujian melalui POST /absensi
    const postPayload = {
      nim: NIM_TEST,
      nama: "Nabilla Natasya",
      tanggal: "2026-11-05T09:00:00.000Z",
      status: "Hadir",
      keterangan: "TEST_PERSIST_SESSION",
    };

    const postRes = await client1("POST", "/absensi", postPayload);
    createdId = postRes.body?.data?.id ?? null;
    const postSuccess = postRes.status === 201 && createdId !== null && postRes.body?.data?.status === "Hadir";

    addResult(
      2,
      "Pembuatan data absensi uji (POST /absensi)",
      `Status: ${postRes.status}, ID: ${createdId}, Nama: ${postRes.body?.data?.nama ?? "-"}`,
      postSuccess
    );

    // 4. Pastikan data berhasil dibuat dan dapat dibaca via GET /absensi/:id pada Sesi 1
    const getRes1 = await client1("GET", `/absensi/${createdId}`);
    const get1Success =
      getRes1.status === 200 &&
      getRes1.body?.success === true &&
      getRes1.body?.data?.id === createdId &&
      getRes1.body?.data?.status === "Hadir";

    addResult(
      3,
      "Pembacaan data sebelum restart (GET /absensi/:id)",
      `Status: ${getRes1.status}, Data terbaca: ID ${createdId}, Status: ${getRes1.body?.data?.status}`,
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
    await prisma.$disconnect();
  }

  addResult(
    4,
    "Shutdown server sesi 1 & diskoneksi database",
    "Server sesi 1 dimatikan dan koneksi Prisma diputus",
    true
  );

  // Beri jeda sejenak untuk memastikan server instance lama telah terlepas sempurna
  await new Promise((r) => setTimeout(r, 500));

  // 6. Jalankan kembali server sesi 2 (Restart server)
  const pipe2 = "\\\\.\\pipe\\persist-latihan8-s2-" + Date.now();
  let server2: Server | null = app.listen(pipe2);
  const client2 = createClient(pipe2);
  console.log(`[Server Sesi 2] Aktif kembali pada pipe baru (Server restart success)\n`);

  addResult(
    5,
    "Restart server sesi 2",
    `Server baru aktif kembali pada sesi baru`,
    true
  );

  try {
    // 7. Periksa kembali data menggunakan GET /absensi/:id pada Server Sesi 2
    const getRes2 = await client2("GET", `/absensi/${createdId}`);
    const get2Success =
      getRes2.status === 200 &&
      getRes2.body?.success === true &&
      getRes2.body?.data?.id === createdId &&
      getRes2.body?.data?.nim === NIM_TEST &&
      getRes2.body?.data?.nama === "Nabilla Natasya" &&
      getRes2.body?.data?.status === "Hadir";

    addResult(
      6,
      "Verifikasi persistensi data pasca-restart (GET /absensi/:id)",
      `Status: ${getRes2.status}, Data fisik tetap utuh di SQLite: ID ${createdId}, Nama: ${getRes2.body?.data?.nama}`,
      get2Success
    );

    // 8. Hapus hanya data khusus pengujian tersebut (DELETE /absensi/:id)
    const delRes = await client2("DELETE", `/absensi/${createdId}`);
    const delSuccess = delRes.status === 204;

    addResult(
      7,
      "Pembersihan data khusus pengujian (DELETE /absensi/:id)",
      `Status: ${delRes.status} (204 No Content)`,
      delSuccess
    );

    // 9. Pastikan data sudah tidak ditemukan lagi (GET → 404)
    const getRes3 = await client2("GET", `/absensi/${createdId}`);
    const get3Success =
      getRes3.status === 404 &&
      getRes3.body?.success === false &&
      getRes3.body?.message?.includes("tidak ditemukan");

    addResult(
      8,
      "Verifikasi data terhapus (GET /absensi/:id → 404)",
      `Status: ${getRes3.status}, Pesan: ${getRes3.body?.message}`,
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
  const countAkhir = await prisma.absensi.count();
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
  console.log("================================================================================\n");

  if (!allPassed) {
    process.exitCode = 1;
  }
}

runPersistenceTest().catch((err) => {
  console.error("Fatal error during test-persistence:", err);
  process.exit(1);
});
