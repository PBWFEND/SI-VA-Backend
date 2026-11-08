import { app } from "./app.ts";
import { prisma } from "./client.ts";
import type { Server } from "http";

interface TestReport {
  no: number;
  skenario: string;
  endpoint: string;
  expectedStatus: number;
  actualStatus: number;
  result: "PASS" | "FAIL";
  keterangan: string;
}

const reports: TestReport[] = [];
let testNo = 1;

function recordTest(
  skenario: string,
  endpoint: string,
  expectedStatus: number,
  actualStatus: number,
  condition: boolean,
  keterangan: string
) {
  const isPass = condition && expectedStatus === actualStatus;
  reports.push({
    no: testNo++,
    skenario,
    endpoint,
    expectedStatus,
    actualStatus,
    result: isPass ? "PASS" : "FAIL",
    keterangan,
  });
  const mark = isPass ? "✔ [PASS]" : "✖ [FAIL]";
  console.log(`${mark} #${reports[reports.length - 1].no} ${skenario} | Status: ${actualStatus} (Expected: ${expectedStatus})`);
}

async function runTestSuite() {
  console.log("================================================================================");
  console.log(" PENGUJIAN OTOMATIS REST API SISTEM INFORMASI ABSENSI MAHASISWA");
  console.log(" DELLA KARTIKA — 240160221008");
  console.log("================================================================================\n");

  // 1. Jalankan server pada port dinamis (0)
  const server = app.listen(0);
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Gagal menginisialisasi HTTP server");
  }
  const port = address.port;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`[Setup] Server pengujian aktif di ${baseUrl}\n`);

  let createdId: number = 0;

  try {
    // 1. GET /api/health
    {
      const res = await fetch(`${baseUrl}/api/health`);
      const body = (await res.json()) as any;
      recordTest(
        "Pemeriksaan kesehatan API dan koneksi database SQLite",
        "GET /api/health",
        200,
        res.status,
        body.success === true && body.message === "API dan database terhubung",
        body.message
      );
    }

    // 2. GET /api/absensi — Mengambil seluruh data awal
    {
      const res = await fetch(`${baseUrl}/api/absensi`);
      const body = (await res.json()) as any;
      recordTest(
        "Mengambil seluruh data absensi (kondisi awal)",
        "GET /api/absensi",
        200,
        res.status,
        body.success === true && Array.isArray(body.data),
        `Total data: ${body.total ?? body.data?.length}`
      );
    }

    // 3. POST /api/absensi — Menambahkan data absensi baru (valid)
    {
      const newAbsensi = {
        nim: "240160221008",
        namaMahasiswa: "Della Kartika",
        kelas: "Informatika",
        tanggal: "2026-11-02T08:00:00.000Z",
        status: "Hadir",
        keterangan: "Mengikuti perkuliahan praktikum backend",
      };

      const res = await fetch(`${baseUrl}/api/absensi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAbsensi),
      });
      const body = (await res.json()) as any;
      createdId = body.data?.id ?? 0;

      recordTest(
        "Menambahkan data absensi baru dengan payload valid",
        "POST /api/absensi",
        201,
        res.status,
        body.success === true && body.data?.nim === "240160221008" && createdId > 0,
        `ID hasil dibuat: ${createdId}`
      );
    }

    // 4. GET /api/absensi/:id — Detail data absensi yang baru dibuat
    {
      const res = await fetch(`${baseUrl}/api/absensi/${createdId}`);
      const body = (await res.json()) as any;
      recordTest(
        "Mengambil detail data absensi berdasarkan ID yang valid",
        `GET /api/absensi/${createdId}`,
        200,
        res.status,
        body.success === true && body.data?.id === createdId,
        `Data: ${body.data?.namaMahasiswa} (${body.data?.status})`
      );
    }

    // 5. PATCH /api/absensi/:id — Memperbarui sebagian field secara valid
    {
      const updatePayload = {
        status: "Izin",
        keterangan: "Izin dinas luar kampus",
      };

      const res = await fetch(`${baseUrl}/api/absensi/${createdId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatePayload),
      });
      const body = (await res.json()) as any;
      recordTest(
        "Memperbarui data absensi secara parsial (PATCH)",
        `PATCH /api/absensi/${createdId}`,
        200,
        res.status,
        body.success === true && body.data?.status === "Izin",
        `Status baru: ${body.data?.status}, Keterangan: ${body.data?.keterangan}`
      );
    }

    // 6. GET /api/absensi?status=Izin — Filter berdasarkan query parameter status
    {
      const res = await fetch(`${baseUrl}/api/absensi?status=Izin`);
      const body = (await res.json()) as any;
      const allIzin = Array.isArray(body.data) && body.data.every((item: any) => item.status === "Izin");
      recordTest(
        "Filter data absensi berdasarkan query parameter (?status=Izin)",
        "GET /api/absensi?status=Izin",
        200,
        res.status,
        body.success === true && allIzin,
        `Ditemukan ${body.total} data berstatus Izin`
      );
    }

    // 7. POST /api/absensi — Negatif: Field kosong (nim kosong)
    {
      const res = await fetch(`${baseUrl}/api/absensi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nim: "   ",
          namaMahasiswa: "Della Kartika",
          kelas: "Informatika",
          tanggal: "2026-11-02T08:00:00.000Z",
          status: "Hadir",
        }),
      });
      const body = (await res.json()) as any;
      recordTest(
        "Penolakan POST ketika field wajib 'nim' kosong",
        "POST /api/absensi",
        400,
        res.status,
        body.success === false,
        body.message
      );
    }

    // 8. POST /api/absensi — Negatif: Tipe data salah (tanggal tidak valid)
    {
      const res = await fetch(`${baseUrl}/api/absensi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nim: "240160221008",
          namaMahasiswa: "Della Kartika",
          kelas: "Informatika",
          tanggal: "bukan-tanggal-valid",
          status: "Hadir",
        }),
      });
      const body = (await res.json()) as any;
      recordTest(
        "Penolakan POST ketika format tanggal tidak valid",
        "POST /api/absensi",
        400,
        res.status,
        body.success === false,
        body.message
      );
    }

    // 9. POST /api/absensi — Negatif: Status di luar Hadir/Izin/Sakit/Alpa
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
      recordTest(
        "Penolakan POST ketika nilai status tidak valid",
        "POST /api/absensi",
        400,
        res.status,
        body.success === false,
        body.message
      );
    }

    // 10. PATCH /api/absensi/:id — Negatif: Body kosong {}
    {
      const res = await fetch(`${baseUrl}/api/absensi/${createdId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const body = (await res.json()) as any;
      recordTest(
        "Penolakan PATCH ketika body kosong {}",
        `PATCH /api/absensi/${createdId}`,
        400,
        res.status,
        body.success === false,
        body.message
      );
    }

    // 11. PATCH /api/absensi/:id — Negatif: Status tidak valid
    {
      const res = await fetch(`${baseUrl}/api/absensi/${createdId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Bolos" }),
      });
      const body = (await res.json()) as any;
      recordTest(
        "Penolakan PATCH ketika nilai status tidak valid",
        `PATCH /api/absensi/${createdId}`,
        400,
        res.status,
        body.success === false,
        body.message
      );
    }

    // 12. GET /api/absensi/:id — Negatif: ID tidak ditemukan (404)
    {
      const res = await fetch(`${baseUrl}/api/absensi/999999`);
      const body = (await res.json()) as any;
      recordTest(
        "Pengembalian status 404 ketika ID tidak ditemukan",
        "GET /api/absensi/999999",
        404,
        res.status,
        body.success === false,
        body.message
      );
    }

    // 13. DELETE /api/absensi/:id — Negatif: ID tidak ditemukan (404)
    {
      const res = await fetch(`${baseUrl}/api/absensi/999999`, {
        method: "DELETE",
      });
      const body = (await res.json()) as any;
      recordTest(
        "Pengembalian status 404 ketika menghapus ID yang tidak ada",
        "DELETE /api/absensi/999999",
        404,
        res.status,
        body.success === false,
        body.message
      );
    }

    // 14. Akses endpoint yang tidak tersedia (Middleware 404)
    {
      const res = await fetch(`${baseUrl}/api/tidak-ada-endpoint`);
      const body = (await res.json()) as any;
      recordTest(
        "Middleware 404 untuk rute yang tidak terdaftar",
        "GET /api/tidak-ada-endpoint",
        404,
        res.status,
        body.success === false && body.message === "Endpoint tidak ditemukan",
        body.message
      );
    }

    // 15. DELETE /api/absensi/:id — Menghapus data absensi valid (204 No Content)
    {
      const res = await fetch(`${baseUrl}/api/absensi/${createdId}`, {
        method: "DELETE",
      });
      recordTest(
        "Menghapus data absensi berdasarkan ID (204 No Content)",
        `DELETE /api/absensi/${createdId}`,
        204,
        res.status,
        res.status === 204,
        "Berhasil dihapus tanpa response body"
      );
    }

    // 16. GET /api/absensi/:id — Verifikasi data telah terhapus (404)
    {
      const res = await fetch(`${baseUrl}/api/absensi/${createdId}`);
      const body = (await res.json()) as any;
      recordTest(
        "Verifikasi data yang dihapus sudah tidak dapat diakses",
        `GET /api/absensi/${createdId}`,
        404,
        res.status,
        body.success === false,
        body.message
      );
    }
  } finally {
    // Matikan server pengujian pertama
    await new Promise<void>((resolve) => {
      server.close(() => {
        resolve();
      });
    });
  }

  // -------------------------------------------------------------------------
  // SIKLUS PENGUJIAN PERSISTENSI SETELAH RESTART SERVER
  // -------------------------------------------------------------------------
  console.log("\n--- PENGUJIAN PERSISTENSI SETELAH RESTART SERVER ---");

  // Langkah P1: Buat data pada server sesi 1
  let server1: Server | null = app.listen(0);
  const port1 = (server1.address() as any).port;
  let persistId = 0;

  try {
    const postRes = await fetch(`http://127.0.0.1:${port1}/api/absensi`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nim: "240160221008",
        namaMahasiswa: "Della Kartika Persistensi",
        kelas: "Informatika",
        tanggal: "2026-11-02T09:00:00.000Z",
        status: "Hadir",
        keterangan: "Uji persistensi sebelum restart",
      }),
    });
    const postBody = (await postRes.json()) as any;
    persistId = postBody.data?.id;

    recordTest(
      "Persistensi: POST data absensi pada Sesi 1 sebelum server restart",
      "POST /api/absensi",
      201,
      postRes.status,
      postRes.status === 201 && persistId > 0,
      `ID data: ${persistId}`
    );
  } finally {
    // Shutdown server 1 sepenuhnya
    await new Promise<void>((resolve) => {
      server1!.close(() => {
        server1 = null;
        resolve();
      });
    });
  }

  // Langkah P2: Start server sesi 2 (menyimulasikan restart server)
  const server2 = app.listen(0);
  const port2 = (server2.address() as any).port;

  try {
    const getRes = await fetch(`http://127.0.0.1:${port2}/api/absensi/${persistId}`);
    const getBody = (await getRes.json()) as any;

    recordTest(
      "Persistensi: GET data absensi pada Sesi 2 pasca server restart (Verifikasi Non-Volatile SQLite)",
      `GET /api/absensi/${persistId}`,
      200,
      getRes.status,
      getRes.status === 200 && getBody.data?.id === persistId && getBody.data?.namaMahasiswa === "Della Kartika Persistensi",
      `Data tetap utuh di SQLite: ${getBody.data?.namaMahasiswa}`
    );

    // Bersihkan data uji persistensi
    const delRes = await fetch(`http://127.0.0.1:${port2}/api/absensi/${persistId}`, {
      method: "DELETE",
    });
    recordTest(
      "Persistensi: Pembersihan data uji persistensi",
      `DELETE /api/absensi/${persistId}`,
      204,
      delRes.status,
      delRes.status === 204,
      "Data uji dibersihkan"
    );
  } finally {
    await new Promise<void>((resolve) => {
      server2.close(() => {
        resolve();
      });
    });
    await prisma.$disconnect();
  }

  // Ringkasan hasil
  console.log("\n================================================================================");
  console.log(" RINGKASAN HASIL PENGUJIAN REST API ABSENSI");
  console.log("================================================================================");
  const passCount = reports.filter((r) => r.result === "PASS").length;
  const failCount = reports.filter((r) => r.result === "FAIL").length;
  console.log(`Total Pengujian: ${reports.length}`);
  console.log(`Lulus (PASS)   : ${passCount}`);
  console.log(`Gagal (FAIL)   : ${failCount}`);
  console.log(`Tingkat Sukses : ${(passCount / reports.length) * 100}%\n`);

  if (failCount > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error("Test suite fatal error:", err);
  process.exit(1);
});

