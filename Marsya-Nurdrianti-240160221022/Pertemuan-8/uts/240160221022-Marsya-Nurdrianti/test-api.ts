/**
 * Automated Integration Test untuk REST API Sistem Informasi Absensi Mahasiswa
 * UTS Pemrograman Web Back End — Marsya Nurdrianti (240160221022)
 */

import { app } from "./src/app.ts";
import { prisma } from "./src/client.ts";
import type { Server } from "node:http";

interface TestReport {
  id: number;
  name: string;
  endpoint: string;
  method: string;
  expectedStatus: number;
  actualStatus: number;
  passed: boolean;
  notes: string;
}

async function runTests() {
  console.log("================================================================================");
  console.log(" INTEGRATION TESTING — SISTEM INFORMASI ABSENSI MAHASISWA (UTS)");
  console.log(" Mahasiswa: Marsya Nurdrianti (NIM: 240160221022) - SI-VA");
  console.log("================================================================================\n");

  const server: Server = app.listen(0);
  const addr = server.address();
  if (!addr || typeof addr === "string") {
    throw new Error("Gagal memulai server pengujian.");
  }
  const baseUrl = `http://127.0.0.1:${addr.port}`;
  console.log(`[INFO] Server pengujian aktif di: ${baseUrl}\n`);

  const reports: TestReport[] = [];
  let testNum = 1;

  function assertTest(
    name: string,
    method: string,
    endpoint: string,
    expectedStatus: number,
    actualStatus: number,
    condition: boolean,
    notes: string
  ) {
    const passed = condition && expectedStatus === actualStatus;
    const rep: TestReport = {
      id: testNum++,
      name,
      method,
      endpoint,
      expectedStatus,
      actualStatus,
      passed,
      notes,
    };
    reports.push(rep);
    const badge = passed ? "✔ [PASS]" : "✖ [FAIL]";
    console.log(`${badge} #${rep.id} [${rep.method}] ${rep.endpoint} -> ${rep.actualStatus} (Expected: ${rep.expectedStatus}) | ${rep.name}`);
  }

  let createdId: number | null = null;
  const TEST_NIM = "240160221022";

  try {
    // Bersihkan data uji sebelumnya jika ada
    await prisma.absensi.deleteMany({
      where: { nim: TEST_NIM },
    });

    // 1. GET / — Status Server
    {
      const res = await fetch(`${baseUrl}/`);
      const body = (await res.json()) as any;
      assertTest(
        "Pemeriksaan root endpoint status server",
        "GET",
        "/",
        200,
        res.status,
        body.success === true && body.author?.includes("Marsya Nurdrianti"),
        body.message
      );
    }

    // 2. GET /api/health — Konektivitas Database
    {
      const res = await fetch(`${baseUrl}/api/health`);
      const body = (await res.json()) as any;
      assertTest(
        "Pemeriksaan health check koneksi database",
        "GET",
        "/api/health",
        200,
        res.status,
        body.success === true && body.message === "API dan database terhubung",
        body.message
      );
    }

    // 3. GET /api/absensi — Kondisi Awal
    {
      const res = await fetch(`${baseUrl}/api/absensi`);
      const body = (await res.json()) as any;
      assertTest(
        "Mengambil semua absensi (kondisi awal)",
        "GET",
        "/api/absensi",
        200,
        res.status,
        body.success === true && Array.isArray(body.data),
        `Total awal: ${body.data?.length}`
      );
    }

    // 4. POST /api/absensi — Tambah data valid
    {
      const payload = {
        nim: TEST_NIM,
        namaMahasiswa: "Marsya Nurdrianti",
        tanggal: "2026-11-02",
        waktuMasuk: "08:00",
        status: "Hadir",
        keterangan: "Hadir tepat waktu di kelas Praktikum Backend",
      };
      const res = await fetch(`${baseUrl}/api/absensi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await res.json()) as any;
      if (body.data?.id) {
        createdId = body.data.id;
      }
      assertTest(
        "POST: Tambah record absensi baru dengan payload valid",
        "POST",
        "/api/absensi",
        201,
        res.status,
        body.success === true && body.data?.nim === TEST_NIM && body.data?.status === "Hadir",
        `ID dibuat: ${createdId}`
      );
    }

    // 5. GET /api/absensi/:id — Detail data yang baru dibuat
    {
      const res = await fetch(`${baseUrl}/api/absensi/${createdId}`);
      const body = (await res.json()) as any;
      assertTest(
        "GET: Mengambil detail absensi berdasarkan ID",
        "GET",
        `/api/absensi/${createdId}`,
        200,
        res.status,
        body.success === true && body.data?.id === createdId && body.data?.namaMahasiswa === "Marsya Nurdrianti",
        `Nama: ${body.data?.namaMahasiswa}`
      );
    }

    // 6. GET /api/absensi/:id — ID tidak ditemukan
    {
      const res = await fetch(`${baseUrl}/api/absensi/999999`);
      const body = (await res.json()) as any;
      assertTest(
        "GET: ID tidak terdaftar di database",
        "GET",
        "/api/absensi/999999",
        404,
        res.status,
        body.success === false,
        body.message
      );
    }

    // 7. GET /api/absensi/:id — ID bukan angka
    {
      const res = await fetch(`${baseUrl}/api/absensi/abc`);
      const body = (await res.json()) as any;
      assertTest(
        "GET: Format ID tidak valid (bukan angka)",
        "GET",
        "/api/absensi/abc",
        400,
        res.status,
        body.success === false,
        body.message
      );
    }

    // 8. POST /api/absensi — Negatif: Field nim tidak disertakan
    {
      const res = await fetch(`${baseUrl}/api/absensi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          namaMahasiswa: "Mahasiswa Uji",
          tanggal: "2026-11-02",
          status: "Hadir",
        }),
      });
      const body = (await res.json()) as any;
      assertTest(
        "POST: Menolak request tanpa field 'nim'",
        "POST",
        "/api/absensi",
        400,
        res.status,
        body.success === false && body.message.includes("nim"),
        body.message
      );
    }

    // 9. POST /api/absensi — Negatif: namaMahasiswa kosong
    {
      const res = await fetch(`${baseUrl}/api/absensi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nim: TEST_NIM,
          namaMahasiswa: "   ",
          tanggal: "2026-11-02",
          status: "Hadir",
        }),
      });
      const body = (await res.json()) as any;
      assertTest(
        "POST: Menolak field 'namaMahasiswa' string kosong",
        "POST",
        "/api/absensi",
        400,
        res.status,
        body.success === false && body.message.includes("namaMahasiswa"),
        body.message
      );
    }

    // 10. POST /api/absensi — Negatif: tanggal tidak valid
    {
      const res = await fetch(`${baseUrl}/api/absensi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nim: TEST_NIM,
          namaMahasiswa: "Marsya Nurdrianti",
          tanggal: "tanggal-bukan-format-valid",
          status: "Hadir",
        }),
      });
      const body = (await res.json()) as any;
      assertTest(
        "POST: Menolak format tanggal yang tidak valid",
        "POST",
        "/api/absensi",
        400,
        res.status,
        body.success === false && body.message.includes("tanggal"),
        body.message
      );
    }

    // 11. POST /api/absensi — Negatif: status di luar daftar diperbolehkan
    {
      const res = await fetch(`${baseUrl}/api/absensi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nim: TEST_NIM,
          namaMahasiswa: "Marsya Nurdrianti",
          tanggal: "2026-11-02",
          status: "Bolos",
        }),
      });
      const body = (await res.json()) as any;
      assertTest(
        "POST: Menolak status di luar ketentuan (Hadir/Izin/Sakit/Alpa)",
        "POST",
        "/api/absensi",
        400,
        res.status,
        body.success === false && body.message.includes("status"),
        body.message
      );
    }

    // 12. POST /api/absensi — Negatif: Field tidak dikenal
    {
      const res = await fetch(`${baseUrl}/api/absensi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nim: TEST_NIM,
          namaMahasiswa: "Marsya Nurdrianti",
          tanggal: "2026-11-02",
          status: "Hadir",
          injectedField: "hacker_payload",
        }),
      });
      const body = (await res.json()) as any;
      assertTest(
        "POST: Menolak payload yang mengandung field asing/tidak dikenal",
        "POST",
        "/api/absensi",
        400,
        res.status,
        body.success === false && body.message.includes("tidak dikenal"),
        body.message
      );
    }

    // 13. PATCH /api/absensi/:id — Pembaruan valid parsial
    {
      const res = await fetch(`${baseUrl}/api/absensi/${createdId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Izin",
          keterangan: "Izin keperluan keluarga mendesak",
        }),
      });
      const body = (await res.json()) as any;
      assertTest(
        "PATCH: Memperbarui sebagian field secara valid",
        "PATCH",
        `/api/absensi/${createdId}`,
        200,
        res.status,
        body.success === true && body.data?.status === "Izin" && body.data?.keterangan.includes("keluarga"),
        body.message
      );
    }

    // 14. PATCH /api/absensi/:id — Negatif: Body kosong
    {
      const res = await fetch(`${baseUrl}/api/absensi/${createdId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const body = (await res.json()) as any;
      assertTest(
        "PATCH: Menolak request body kosong ({})",
        "PATCH",
        `/api/absensi/${createdId}`,
        400,
        res.status,
        body.success === false && body.message.includes("tidak boleh kosong"),
        body.message
      );
    }

    // 15. PATCH /api/absensi/:id — Negatif: Field tidak dikenal
    {
      const res = await fetch(`${baseUrl}/api/absensi/${createdId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nilai: 100 }),
      });
      const body = (await res.json()) as any;
      assertTest(
        "PATCH: Menolak field tidak dikenal",
        "PATCH",
        `/api/absensi/${createdId}`,
        400,
        res.status,
        body.success === false && body.message.includes("tidak dikenal"),
        body.message
      );
    }

    // 16. PATCH /api/absensi/:id — Negatif: ID tidak ditemukan
    {
      const res = await fetch(`${baseUrl}/api/absensi/999999`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Sakit" }),
      });
      const body = (await res.json()) as any;
      assertTest(
        "PATCH: ID tidak ditemukan di database",
        "PATCH",
        "/api/absensi/999999",
        404,
        res.status,
        body.success === false,
        body.message
      );
    }

    // 17. GET /api/absensi?status=Izin — Filter status
    {
      const res = await fetch(`${baseUrl}/api/absensi?status=Izin`);
      const body = (await res.json()) as any;
      const allMatches = Array.isArray(body.data) && body.data.every((item: any) => item.status === "Izin");
      assertTest(
        "GET: Filter data absensi dengan query status=Izin",
        "GET",
        "/api/absensi?status=Izin",
        200,
        res.status,
        body.success === true && allMatches,
        `Total data filter: ${body.data?.length}`
      );
    }

    // 18. GET /api/absensi?nim=240160221022 — Filter NIM
    {
      const res = await fetch(`${baseUrl}/api/absensi?nim=${TEST_NIM}`);
      const body = (await res.json()) as any;
      const allMatches = Array.isArray(body.data) && body.data.every((item: any) => item.nim === TEST_NIM);
      assertTest(
        "GET: Filter data absensi dengan query nim",
        "GET",
        `/api/absensi?nim=${TEST_NIM}`,
        200,
        res.status,
        body.success === true && allMatches,
        `Total data filter: ${body.data?.length}`
      );
    }

    // 19. DELETE /api/absensi/:id — Hapus data
    {
      const res = await fetch(`${baseUrl}/api/absensi/${createdId}`, {
        method: "DELETE",
      });
      assertTest(
        "DELETE: Menghapus data absensi berdasarkan ID",
        "DELETE",
        `/api/absensi/${createdId}`,
        204,
        res.status,
        res.status === 204,
        "Berhasil dihapus dengan status 204 No Content"
      );
    }

    // 20. GET /api/absensi/:id — Verifikasi data telah terhapus
    {
      const res = await fetch(`${baseUrl}/api/absensi/${createdId}`);
      const body = (await res.json()) as any;
      assertTest(
        "GET: Verifikasi data yang sudah dihapus menghasilkan 404",
        "GET",
        `/api/absensi/${createdId}`,
        404,
        res.status,
        body.success === false,
        body.message
      );
    }

    // 21. DELETE /api/absensi/:id — ID sudah tidak ada
    {
      const res = await fetch(`${baseUrl}/api/absensi/${createdId}`, {
        method: "DELETE",
      });
      const body = (await res.json()) as any;
      assertTest(
        "DELETE: Menghapus ID yang tidak ada menghasilkan 404",
        "DELETE",
        `/api/absensi/${createdId}`,
        404,
        res.status,
        body.success === false,
        body.message
      );
    }

    // 22. GET /endpoint-ngawur — Middleware 404
    {
      const res = await fetch(`${baseUrl}/endpoint-ngawur`);
      const body = (await res.json()) as any;
      assertTest(
        "Middleware 404 pada URL yang tidak terdaftar",
        "GET",
        "/endpoint-ngawur",
        404,
        res.status,
        body.success === false && body.message === "Endpoint tidak ditemukan",
        body.message
      );
    }

  } finally {
    server.close();
    await prisma.$disconnect();
  }

  const passedCount = reports.filter((r) => r.passed).length;
  const failedCount = reports.filter((r) => !r.passed).length;

  console.log("\n================================================================================");
  console.log(` HASIL AKHIR INTEGRATION TESTING: ${passedCount}/${reports.length} BERHASIL (PASS)`);
  if (failedCount > 0) {
    console.log(` PERINGATAN: ${failedCount} PENGUJIAN GAGAL (FAIL)`);
  } else {
    console.log(" SELURUH SKENARIO PENGUJIAN INTEGRASI BERHASIL MEMENUHI SPESIFIKASI DENGAN SEMPURNA.");
  }
  console.log("================================================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Fatal test error:", err);
  process.exit(1);
});

