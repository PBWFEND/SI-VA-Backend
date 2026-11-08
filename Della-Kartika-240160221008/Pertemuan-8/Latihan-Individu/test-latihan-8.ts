/**
 * Skrip Pengujian Latihan Individu Pertemuan 8
 * Menguji API Absensi Mahasiswa
 * Della Kartika — 240160221008
 * Memvalidasi seluruh endpoint fungsional dan pengujian validasi negatif (status 400 & 404).
 */

import { app } from "../UTS/240160221008-della-kartika/app.ts";
import { prisma } from "../UTS/240160221008-della-kartika/src/config/client.ts";

export interface TestResult {
  no: number;
  skenario: string;
  endpoint: string;
  expectedStatus: number;
  actualStatus: number;
  status: "PASS" | "FAIL";
  keterangan: string;
}

async function runAllTests() {
  console.log("================================================================================");
  console.log(" MEMULAI PENGUJIAN LATIHAN INDIVIDU PERTEMUAN 8 — API ABSENSI MAHASISWA");
  console.log(" DELLA KARTIKA — 240160221008");
  console.log("================================================================================\n");

  // 1. Verifikasi kondisi awal database
  const countAwal = await prisma.absensi.count();
  console.log(`[Pemeriksaan Awal] Jumlah data absensi saat ini di database: ${countAwal} baris`);

  // 2. Inisialisasi test server pada port dinamis (0)
  const server = app.listen(0);
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Gagal menginisialisasi server pengujian");
  }
  const port = address.port;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`[Setup] Server pengujian aktif di ${baseUrl}\n`);

  const results: TestResult[] = [];
  let testIndex = 1;

  const record = (
    skenario: string,
    endpoint: string,
    expectedStatus: number,
    actualStatus: number,
    condition: boolean,
    keterangan: string
  ) => {
    const isPass = condition && expectedStatus === actualStatus;
    const res: TestResult = {
      no: testIndex++,
      skenario,
      endpoint,
      expectedStatus,
      actualStatus,
      status: isPass ? "PASS" : "FAIL",
      keterangan,
    };
    results.push(res);
    const icon = isPass ? "✔ [PASS]" : "✖ [FAIL]";
    console.log(
      `${icon} #${res.no} ${res.skenario} | Endpoint: ${res.endpoint} | Status: ${res.actualStatus} (Expected: ${res.expectedStatus})`
    );
  };

  let testId1 = 0;
  let testId2 = 0;

  try {
    // -------------------------------------------------------------------------
    // BAGIAN 1: PENGUJIAN ENDPOINT UTAMA
    // -------------------------------------------------------------------------
    console.log("\n--- BAGIAN 1: PENGUJIAN ENDPOINT UTAMA ---");

    // 1. GET /api/health → 200
    {
      const res = await fetch(`${baseUrl}/api/health`);
      const body = (await res.json()) as any;
      record(
        "Pemeriksaan kesehatan API dan koneksi database SQLite",
        "GET /api/health",
        200,
        res.status,
        body.success === true && body.message === "API dan database terhubung",
        body.message
      );
    }

    // 2. GET /api/absensi → 200
    {
      const res = await fetch(`${baseUrl}/api/absensi`);
      const body = (await res.json()) as any;
      record(
        "Mengambil seluruh daftar data absensi (kondisi awal)",
        "GET /api/absensi",
        200,
        res.status,
        body.success === true && Array.isArray(body.data),
        `Total data awal: ${body.total ?? body.data?.length}`
      );
    }

    // 3. POST /api/absensi → 201
    {
      const payload = {
        nim: "TEST80000001",
        namaMahasiswa: "Mahasiswa Uji Latihan 1",
        kelas: "Informatika",
        tanggal: "2026-11-02T08:00:00.000Z",
        status: "Hadir",
        keterangan: "Pencatatan uji coba latihan individu",
      };
      const res = await fetch(`${baseUrl}/api/absensi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await res.json()) as any;
      testId1 = body.data?.id ?? 0;
      record(
        "Membuat data absensi baru dengan payload valid",
        "POST /api/absensi",
        201,
        res.status,
        body.success === true && testId1 > 0,
        `ID hasil dibuat: ${testId1}`
      );
    }

    // 4. GET /api/absensi/:id → 200
    {
      const res = await fetch(`${baseUrl}/api/absensi/${testId1}`);
      const body = (await res.json()) as any;
      record(
        "Mengambil detail absensi yang baru dibuat",
        `GET /api/absensi/${testId1}`,
        200,
        res.status,
        body.success === true && body.data?.id === testId1,
        `Data: ${body.data?.namaMahasiswa}`
      );
    }

    // 5. GET /api/absensi/:id → 404
    {
      const res = await fetch(`${baseUrl}/api/absensi/999999`);
      const body = (await res.json()) as any;
      record(
        "Mengambil detail absensi dengan ID yang tidak terdaftar",
        "GET /api/absensi/999999",
        404,
        res.status,
        body.success === false,
        body.message
      );
    }

    // 6. PATCH /api/absensi/:id → 200
    {
      const patchPayload = {
        status: "Izin",
        keterangan: "Pembaruan keterangan via PATCH",
      };
      const res = await fetch(`${baseUrl}/api/absensi/${testId1}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patchPayload),
      });
      const body = (await res.json()) as any;
      record(
        "Memperbarui sebagian data absensi secara valid",
        `PATCH /api/absensi/${testId1}`,
        200,
        res.status,
        body.success === true && body.data?.status === "Izin",
        `Status baru: ${body.data?.status}`
      );
    }

    // 7. DELETE /api/absensi/:id → 204
    {
      const res = await fetch(`${baseUrl}/api/absensi/${testId1}`, {
        method: "DELETE",
      });
      record(
        "Menghapus data absensi uji (HTTP 204 No Content)",
        `DELETE /api/absensi/${testId1}`,
        204,
        res.status,
        res.status === 204,
        "Berhasil dihapus tanpa response body"
      );
    }

    // 8. GET /api/absensi/:id → 404
    {
      const res = await fetch(`${baseUrl}/api/absensi/${testId1}`);
      const body = (await res.json()) as any;
      record(
        "Verifikasi data uji telah terhapus dari basis data",
        `GET /api/absensi/${testId1}`,
        404,
        res.status,
        body.success === false,
        body.message
      );
    }

    // -------------------------------------------------------------------------
    // BAGIAN 2: PENGUJIAN NEGATIF POST /api/absensi (Status 400 Bad Request)
    // -------------------------------------------------------------------------
    console.log("\n--- BAGIAN 2: PENGUJIAN NEGATIF POST /api/absensi ---");

    // 9. Field nim kosong
    {
      const res = await fetch(`${baseUrl}/api/absensi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nim: "   ",
          namaMahasiswa: "Nama Valid",
          kelas: "Informatika",
          tanggal: "2026-11-02T08:00:00.000Z",
          status: "Hadir",
        }),
      });
      const body = (await res.json()) as any;
      record("POST: Field 'nim' berupa spasi kosong", "POST /api/absensi", 400, res.status, body.success === false, body.message);
    }

    // 10. Field namaMahasiswa tidak disertakan
    {
      const res = await fetch(`${baseUrl}/api/absensi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nim: "240160221008",
          kelas: "Informatika",
          tanggal: "2026-11-02T08:00:00.000Z",
          status: "Hadir",
        }),
      });
      const body = (await res.json()) as any;
      record("POST: Field 'namaMahasiswa' tidak disertakan", "POST /api/absensi", 400, res.status, body.success === false, body.message);
    }

    // 11. Field kelas tidak disertakan
    {
      const res = await fetch(`${baseUrl}/api/absensi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nim: "240160221008",
          namaMahasiswa: "Della Kartika",
          tanggal: "2026-11-02T08:00:00.000Z",
          status: "Hadir",
        }),
      });
      const body = (await res.json()) as any;
      record("POST: Field 'kelas' tidak disertakan", "POST /api/absensi", 400, res.status, body.success === false, body.message);
    }

    // 12. Format tanggal salah
    {
      const res = await fetch(`${baseUrl}/api/absensi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nim: "240160221008",
          namaMahasiswa: "Della Kartika",
          kelas: "Informatika",
          tanggal: "tanggal-tidak-valid",
          status: "Hadir",
        }),
      });
      const body = (await res.json()) as any;
      record("POST: Format 'tanggal' tidak valid", "POST /api/absensi", 400, res.status, body.success === false, body.message);
    }

    // 13. Status tidak valid (di luar domain)
    {
      const res = await fetch(`${baseUrl}/api/absensi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nim: "240160221008",
          namaMahasiswa: "Della Kartika",
          kelas: "Informatika",
          tanggal: "2026-11-02T08:00:00.000Z",
          status: "Dispensasi",
        }),
      });
      const body = (await res.json()) as any;
      record("POST: Nilai 'status' di luar domain yang diizinkan", "POST /api/absensi", 400, res.status, body.success === false, body.message);
    }

    // 14. Field nim melebihi panjang maksimum
    {
      const res = await fetch(`${baseUrl}/api/absensi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nim: "NIM_YANG_SANGAT_PANJANG_MELEBIHI_BATAS_30_KARAKTER",
          namaMahasiswa: "Della Kartika",
          kelas: "Informatika",
          tanggal: "2026-11-02T08:00:00.000Z",
          status: "Hadir",
        }),
      });
      const body = (await res.json()) as any;
      record("POST: Panjang field 'nim' melebihi 30 karakter", "POST /api/absensi", 400, res.status, body.success === false, body.message);
    }

    // 15. Field namaMahasiswa melebihi 100 karakter
    {
      const res = await fetch(`${baseUrl}/api/absensi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nim: "240160221008",
          namaMahasiswa: "A".repeat(105),
          kelas: "Informatika",
          tanggal: "2026-11-02T08:00:00.000Z",
          status: "Hadir",
        }),
      });
      const body = (await res.json()) as any;
      record("POST: Panjang field 'namaMahasiswa' melebihi 100 karakter", "POST /api/absensi", 400, res.status, body.success === false, body.message);
    }

    // Buat data uji kedua untuk skenario PATCH
    {
      const res = await fetch(`${baseUrl}/api/absensi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nim: "TEST80000002",
          namaMahasiswa: "Mahasiswa Uji PATCH",
          kelas: "Informatika",
          tanggal: "2026-11-02T08:00:00.000Z",
          status: "Hadir",
        }),
      });
      const body = (await res.json()) as any;
      testId2 = body.data?.id ?? 0;
    }

    // -------------------------------------------------------------------------
    // BAGIAN 3: PENGUJIAN NEGATIF PATCH /api/absensi/:id (Status 400 Bad Request)
    // -------------------------------------------------------------------------
    console.log("\n--- BAGIAN 3: PENGUJIAN NEGATIF PATCH /api/absensi/:id ---");

    // 16. Payload body kosong {}
    {
      const res = await fetch(`${baseUrl}/api/absensi/${testId2}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const body = (await res.json()) as any;
      record("PATCH: Payload body kosong {}", `PATCH /api/absensi/${testId2}`, 400, res.status, body.success === false, body.message);
    }

    // 17. Field nim bernilai spasi kosong pada update
    {
      const res = await fetch(`${baseUrl}/api/absensi/${testId2}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nim: "   " }),
      });
      const body = (await res.json()) as any;
      record("PATCH: Field 'nim' berupa spasi kosong", `PATCH /api/absensi/${testId2}`, 400, res.status, body.success === false, body.message);
    }

    // 18. Field namaMahasiswa bernilai spasi kosong pada update
    {
      const res = await fetch(`${baseUrl}/api/absensi/${testId2}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ namaMahasiswa: "   " }),
      });
      const body = (await res.json()) as any;
      record("PATCH: Field 'namaMahasiswa' berupa spasi kosong", `PATCH /api/absensi/${testId2}`, 400, res.status, body.success === false, body.message);
    }

    // 19. Field kelas bernilai spasi kosong pada update
    {
      const res = await fetch(`${baseUrl}/api/absensi/${testId2}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kelas: "   " }),
      });
      const body = (await res.json()) as any;
      record("PATCH: Field 'kelas' berupa spasi kosong", `PATCH /api/absensi/${testId2}`, 400, res.status, body.success === false, body.message);
    }

    // 20. Field tanggal format tidak valid pada update
    {
      const res = await fetch(`${baseUrl}/api/absensi/${testId2}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tanggal: "format-salah" }),
      });
      const body = (await res.json()) as any;
      record("PATCH: Format 'tanggal' tidak valid", `PATCH /api/absensi/${testId2}`, 400, res.status, body.success === false, body.message);
    }

    // 21. Field status tidak valid pada update
    {
      const res = await fetch(`${baseUrl}/api/absensi/${testId2}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "HadirTapiBolos" }),
      });
      const body = (await res.json()) as any;
      record("PATCH: Nilai 'status' di luar pilihan yang diizinkan", `PATCH /api/absensi/${testId2}`, 400, res.status, body.success === false, body.message);
    }

    // 22. Field keterangan melebihi panjang 255 karakter
    {
      const res = await fetch(`${baseUrl}/api/absensi/${testId2}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keterangan: "X".repeat(260) }),
      });
      const body = (await res.json()) as any;
      record("PATCH: Panjang field 'keterangan' melebihi 255 karakter", `PATCH /api/absensi/${testId2}`, 400, res.status, body.success === false, body.message);
    }

    // 23. Parameter ID bukan integer positif
    {
      const res = await fetch(`${baseUrl}/api/absensi/abc`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Sakit" }),
      });
      const body = (await res.json()) as any;
      record("PATCH: Parameter ID bukan bilangan bulat positif ('abc')", "PATCH /api/absensi/abc", 400, res.status, body.success === false, body.message);
    }

    // -------------------------------------------------------------------------
    // BAGIAN 4: PEMBERSIHAN DAN VERIFIKASI INTEGRITAS
    // -------------------------------------------------------------------------
    console.log("\n--- BAGIAN 4: PEMBERSIHAN DAN VERIFIKASI INTEGRITAS ---");

    // 24. Hapus data uji testId2
    {
      const res = await fetch(`${baseUrl}/api/absensi/${testId2}`, {
        method: "DELETE",
      });
      record("Pembersihan data sementara uji PATCH", `DELETE /api/absensi/${testId2}`, 204, res.status, res.status === 204, "Data uji dibersihkan");
    }

    // 25. Verifikasi integritas database kembali ke jumlah baris awal
    {
      const countAkhir = await prisma.absensi.count();
      record(
        "Verifikasi integritas database (kembali ke jumlah baris awal)",
        "Database State Check",
        countAwal,
        countAkhir,
        countAkhir === countAwal,
        `Jumlah baris: ${countAkhir} (Awal: ${countAwal})`
      );
    }
  } finally {
    await new Promise<void>((resolve) => {
      server.close(() => {
        resolve();
      });
    });
    await prisma.$disconnect();
  }

  // -------------------------------------------------------------------------
  // REKAPITULASI HASIL
  // -------------------------------------------------------------------------
  console.log("\n================================================================================");
  console.log(" REKAPITULASI HASIL PENGUJIAN LATIHAN INDIVIDU (25 SKENARIO)");
  console.log("================================================================================");
  const passCount = results.filter((r) => r.status === "PASS").length;
  const failCount = results.filter((r) => r.status === "FAIL").length;
  console.log(`Total Pengujian: ${results.length}`);
  console.log(`Lulus (PASS)   : ${passCount}`);
  console.log(`Gagal (FAIL)   : ${failCount}`);
  console.log(`Tingkat Lulus  : ${(passCount / results.length) * 100}%\n`);

  if (failCount > 0) {
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
