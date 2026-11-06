/**
 * Skrip Pengujian Latihan Individu Pertemuan 8 — Sistem Absensi
 * Mahasiswa: Nabilla Natasya (NIM: 240160221029)
 * Menguji API Absensi (Pertemuan-8/uts/240160221029-Nabilla-Natasya)
 * Memvalidasi seluruh endpoint fungsional, operasi CRUD, dan 25+ skenario validasi negatif (status 400/404).
 */

import http from "node:http";
import { app } from "../uts/240160221029-Nabilla-Natasya/app.ts";
import { prisma } from "../uts/240160221029-Nabilla-Natasya/client.ts";

export interface TestResult {
  no: number;
  skenario: string;
  endpoint: string;
  method: string;
  expectedStatus: number;
  actualStatus: number;
  status: "PASS" | "FAIL";
  keterangan: string;
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

async function runAllTests() {
  console.log("================================================================================");
  console.log(" PENGUJIAN LATIHAN INDIVIDU PERTEMUAN 8 — REST API SISTEM ABSENSI");
  console.log(" Mahasiswa: Nabilla Natasya (NIM: 240160221029)");
  console.log("================================================================================\n");

  // 1. Verifikasi kondisi awal database
  const countAwal = await prisma.absensi.count();
  console.log(`[Pemeriksaan Awal] Jumlah data absensi saat ini di database: ${countAwal} baris`);

  // 2. Inisialisasi server pengujian via Named Pipe lokal
  const pipeName = "\\\\.\\pipe\\latihan8-test-" + Date.now();
  const server = app.listen(pipeName);
  const client = createClient(pipeName);
  console.log(`[Setup] Server pengujian aktif via IPC Pipe: ${pipeName}\n`);

  const results: TestResult[] = [];
  let testIndex = 1;

  const record = (
    skenario: string,
    method: string,
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
      method,
      expectedStatus,
      actualStatus,
      status: isPass ? "PASS" : "FAIL",
      keterangan,
    };
    results.push(res);
    const icon = isPass ? "✔ [PASS]" : "✖ [FAIL]";
    console.log(
      `${icon} #${res.no} ${res.skenario} | ${res.method} ${res.endpoint} | Status: ${res.actualStatus} (Expected: ${res.expectedStatus})`
    );
  };

  let testId1: number | null = null;
  let testId2: number | null = null;

  try {
    // -------------------------------------------------------------------------
    // BAGIAN 1: PENGUJIAN ENDPOINT UTAMA & OPERASI CRUD
    // -------------------------------------------------------------------------
    console.log("\n--- BAGIAN 1: PENGUJIAN ENDPOINT UTAMA & CRUD ---");

    // 1. GET / — Status Server API & Identitas
    {
      const res = await client("GET", "/");
      record(
        "Pemeriksaan root endpoint dan identitas mahasiswa",
        "GET",
        "/",
        200,
        res.status,
        res.body?.success === true && res.body?.mahasiswa?.nim === "240160221029",
        res.body?.message ?? ""
      );
    }

    // 2. GET /api/health — Health check koneksi SQLite
    {
      const res = await client("GET", "/api/health");
      record(
        "Pemeriksaan kesehatan API dan koneksi basis data SQLite",
        "GET",
        "/api/health",
        200,
        res.status,
        res.body?.success === true && res.body?.message === "API dan database terhubung",
        res.body?.message ?? ""
      );
    }

    // 3. GET /absensi — Kondisi awal
    {
      const res = await client("GET", "/absensi");
      record(
        "Mengambil seluruh daftar data absensi (kondisi awal)",
        "GET",
        "/absensi",
        200,
        res.status,
        res.body?.success === true && Array.isArray(res.body?.data),
        `Total data diterima: ${res.body?.data?.length ?? 0}`
      );
    }

    // 4. POST /absensi — Tambah data absensi 1 (Lengkap)
    {
      const res = await client("POST", "/absensi", {
        nim: "240160221029",
        nama: "Nabilla Natasya",
        tanggal: "2026-11-05T08:00:00.000Z",
        status: "Hadir",
        keterangan: "Hadir tepat waktu praktikum",
      });
      testId1 = res.body?.data?.id ?? null;
      record(
        "Membuat data absensi baru dengan payload lengkap (POST)",
        "POST",
        "/absensi",
        201,
        res.status,
        res.body?.success === true && res.body?.data?.status === "Hadir",
        `ID Dibuat: ${testId1}`
      );
    }

    // 5. POST /absensi — Tambah data absensi 2 (Keterangan opsional)
    {
      const res = await client("POST", "/absensi", {
        nim: "240160221008",
        nama: "Della Kartika",
        tanggal: "2026-11-05",
        status: "Izin",
      });
      testId2 = res.body?.data?.id ?? null;
      record(
        "Membuat data absensi dengan keterangan opsional (POST)",
        "POST",
        "/absensi",
        201,
        res.status,
        res.body?.success === true && res.body?.data?.keterangan === null,
        `ID Dibuat: ${testId2}`
      );
    }

    // 6. GET /absensi/:id — Detail data yang baru dibuat
    {
      const res = await client("GET", `/absensi/${testId1}`);
      record(
        "Mengambil detail data absensi berdasarkan ID valid",
        "GET",
        `/absensi/${testId1}`,
        200,
        res.status,
        res.body?.success === true && res.body?.data?.id === testId1,
        `NIM: ${res.body?.data?.nim}, Status: ${res.body?.data?.status}`
      );
    }

    // 7. PATCH /absensi/:id — Pembaruan sebagian atribut
    {
      const res = await client("PATCH", `/absensi/${testId1}`, {
        status: "Sakit",
        keterangan: "Surat dokter terlampir",
      });
      record(
        "Memperbarui sebagian atribut absensi secara parsial (PATCH)",
        "PATCH",
        `/absensi/${testId1}`,
        200,
        res.status,
        res.body?.success === true && res.body?.data?.status === "Sakit",
        res.body?.message ?? ""
      );
    }

    // 8. PUT /absensi/:id — Pembaruan data absensi
    {
      const res = await client("PUT", `/absensi/${testId1}`, {
        status: "Izin",
        keterangan: "Izin menghadiri seminar akademik",
      });
      record(
        "Memperbarui data absensi melalui metode PUT",
        "PUT",
        `/absensi/${testId1}`,
        200,
        res.status,
        res.body?.success === true && res.body?.data?.status === "Izin",
        res.body?.message ?? ""
      );
    }

    // 9. DELETE /absensi/:id — Hapus data absensi uji 1
    {
      const res = await client("DELETE", `/absensi/${testId1}`);
      record(
        "Menghapus data absensi berdasarkan ID (DELETE 204)",
        "DELETE",
        `/absensi/${testId1}`,
        204,
        res.status,
        res.status === 204,
        "No Content"
      );
    }

    // 10. GET /absensi/:id — Verifikasi data sudah terhapus (404)
    {
      const res = await client("GET", `/absensi/${testId1}`);
      record(
        "Memastikan data yang telah dihapus mengembalikan 404 Not Found",
        "GET",
        `/absensi/${testId1}`,
        404,
        res.status,
        res.body?.success === false,
        res.body?.message ?? ""
      );
    }

    // -------------------------------------------------------------------------
    // BAGIAN 2: PENGUJIAN NEGATIF & VALIDASI INPUT (STATUS 400 & 404)
    // -------------------------------------------------------------------------
    console.log("\n--- BAGIAN 2: PENGUJIAN NEGATIF & VALIDASI INPUT ---");

    // 11. POST /absensi — Request body kosong
    {
      const res = await client("POST", "/absensi", {});
      record(
        "Validasi POST dengan payload body kosong",
        "POST",
        "/absensi",
        400,
        res.status,
        res.body?.success === false,
        res.body?.message ?? ""
      );
    }

    // 12. POST /absensi — Field 'nim' string kosong / spasi
    {
      const res = await client("POST", "/absensi", {
        nim: "    ",
        nama: "Nabilla Natasya",
        tanggal: "2026-11-05",
        status: "Hadir",
      });
      record(
        "Validasi field 'nim' kosong atau hanya spasi",
        "POST",
        "/absensi",
        400,
        res.status,
        res.body?.success === false && res.body?.message?.includes("nim"),
        res.body?.message ?? ""
      );
    }

    // 13. POST /absensi — Field 'nama' string kosong
    {
      const res = await client("POST", "/absensi", {
        nim: "240160221029",
        nama: "",
        tanggal: "2026-11-05",
        status: "Hadir",
      });
      record(
        "Validasi field 'nama' bernilai string kosong",
        "POST",
        "/absensi",
        400,
        res.status,
        res.body?.success === false && res.body?.message?.includes("nama"),
        res.body?.message ?? ""
      );
    }

    // 14. POST /absensi — Field 'tanggal' format tidak valid
    {
      const res = await client("POST", "/absensi", {
        nim: "240160221029",
        nama: "Nabilla Natasya",
        tanggal: "bukan-tanggal-valid",
        status: "Hadir",
      });
      record(
        "Validasi field 'tanggal' berformat string tidak valid",
        "POST",
        "/absensi",
        400,
        res.status,
        res.body?.success === false && res.body?.message?.includes("tanggal"),
        res.body?.message ?? ""
      );
    }

    // 15. POST /absensi — Field 'status' di luar domain resmi (Hadir, Izin, Sakit, Alpa)
    {
      const res = await client("POST", "/absensi", {
        nim: "240160221029",
        nama: "Nabilla Natasya",
        tanggal: "2026-11-05",
        status: "Bolos",
      });
      record(
        "Validasi field 'status' di luar nilai domain resmi (Bolos)",
        "POST",
        "/absensi",
        400,
        res.status,
        res.body?.success === false && res.body?.message?.includes("status"),
        res.body?.message ?? ""
      );
    }

    // 16. POST /absensi — Field 'keterangan' bertipe salah (number)
    {
      const res = await client("POST", "/absensi", {
        nim: "240160221029",
        nama: "Nabilla Natasya",
        tanggal: "2026-11-05",
        status: "Hadir",
        keterangan: 12345,
      });
      record(
        "Validasi field 'keterangan' dengan tipe data salah (number)",
        "POST",
        "/absensi",
        400,
        res.status,
        res.body?.success === false && res.body?.message?.includes("keterangan"),
        res.body?.message ?? ""
      );
    }

    // 17. GET /absensi/:id — ID bukan angka alfabet
    {
      const res = await client("GET", "/absensi/abc");
      record(
        "Validasi parameter ID berupa string teks alfabet (GET /absensi/abc)",
        "GET",
        "/absensi/abc",
        400,
        res.status,
        res.body?.success === false && res.body?.message?.includes("ID"),
        res.body?.message ?? ""
      );
    }

    // 18. GET /absensi/:id — ID bernilai bilangan negatif
    {
      const res = await client("GET", "/absensi/-10");
      record(
        "Validasi parameter ID bernilai negatif (GET /absensi/-10)",
        "GET",
        "/absensi/-10",
        400,
        res.status,
        res.body?.success === false && res.body?.message?.includes("ID"),
        res.body?.message ?? ""
      );
    }

    // 19. GET /absensi/:id — ID bernilai angka nol
    {
      const res = await client("GET", "/absensi/0");
      record(
        "Validasi parameter ID bernilai nol (GET /absensi/0)",
        "GET",
        "/absensi/0",
        400,
        res.status,
        res.body?.success === false && res.body?.message?.includes("ID"),
        res.body?.message ?? ""
      );
    }

    // 20. GET /absensi/:id — ID tidak terdaftar
    {
      const res = await client("GET", "/absensi/999999");
      record(
        "Pencarian detail data dengan ID yang tidak terdaftar (404)",
        "GET",
        "/absensi/999999",
        404,
        res.status,
        res.body?.success === false,
        res.body?.message ?? ""
      );
    }

    // 21. PATCH /absensi/:id — Request body kosong
    {
      const res = await client("PATCH", `/absensi/${testId2}`, {});
      record(
        "Validasi pembaruan PATCH dengan body kosong ({})",
        "PATCH",
        `/absensi/${testId2}`,
        400,
        res.status,
        res.body?.success === false,
        res.body?.message ?? ""
      );
    }

    // 22. PATCH /absensi/:id — Status tidak valid
    {
      const res = await client("PATCH", `/absensi/${testId2}`, { status: "Libur" });
      record(
        "Validasi pembaruan PATCH dengan status di luar domain (Libur)",
        "PATCH",
        `/absensi/${testId2}`,
        400,
        res.status,
        res.body?.success === false && res.body?.message?.includes("status"),
        res.body?.message ?? ""
      );
    }

    // 23. PATCH /absensi/:id — Data tidak ditemukan
    {
      const res = await client("PATCH", "/absensi/999999", { status: "Izin" });
      record(
        "Pembaruan PATCH pada data yang tidak terdaftar (404)",
        "PATCH",
        "/absensi/999999",
        404,
        res.status,
        res.body?.success === false,
        res.body?.message ?? ""
      );
    }

    // 24. DELETE /absensi/:id — ID tidak valid
    {
      const res = await client("DELETE", "/absensi/xyz");
      record(
        "Validasi penghapusan DELETE dengan parameter ID alfabet",
        "DELETE",
        "/absensi/xyz",
        400,
        res.status,
        res.body?.success === false,
        res.body?.message ?? ""
      );
    }

    // 25. DELETE /absensi/:id — Data tidak ditemukan
    {
      const res = await client("DELETE", "/absensi/999999");
      record(
        "Penghapusan DELETE pada data yang tidak terdaftar (404)",
        "DELETE",
        "/absensi/999999",
        404,
        res.status,
        res.body?.success === false,
        res.body?.message ?? ""
      );
    }

    // 26. Middleware 404 — URL rute tidak terdaftar
    {
      const res = await client("GET", "/rute-acak-tidak-ditemukan");
      record(
        "Middleware 404 menangani request URL tidak terdaftar",
        "GET",
        "/rute-acak-tidak-ditemukan",
        404,
        res.status,
        res.body?.success === false && res.body?.message === "Endpoint tidak ditemukan",
        res.body?.message ?? ""
      );
    }

    // -------------------------------------------------------------------------
    // BAGIAN 3: PEMBERSIHAN DATA & VERIFIKASI INTEGRITAS AKHIR
    // -------------------------------------------------------------------------
    console.log("\n--- BAGIAN 3: PEMBERSIHAN & INTEGRITAS BASIS DATA ---");

    // 27. Pembersihan data uji 2
    if (testId2) {
      const res = await client("DELETE", `/absensi/${testId2}`);
      record(
        "Pembersihan sisa data uji ke-2 (DELETE 204)",
        "DELETE",
        `/absensi/${testId2}`,
        204,
        res.status,
        res.status === 204,
        "No Content"
      );
    }

    // 28. Verifikasi integritas jumlah baris database akhir
    const countAkhir = await prisma.absensi.count();
    record(
      "Verifikasi integritas database bersih (jumlah baris kembali ke awal)",
      "GET",
      "/absensi",
      200,
      200,
      countAkhir === countAwal,
      `Jumlah data awal: ${countAwal}, akhir: ${countAkhir}`
    );
  } finally {
    server.close();
    await prisma.$disconnect();
  }

  const allPassed = results.every((r) => r.status === "PASS");
  console.log("\n================================================================================");
  console.log(
    ` KESIMPULAN PENGUJIAN LATIHAN INDIVIDU 8: ${allPassed ? "SELURUH 28 PENGUJIAN LULUS (PASS)" : "ADA PENGUJIAN GAGAL (FAIL)"}`
  );
  console.log("================================================================================\n");

  if (!allPassed) {
    process.exitCode = 1;
  }
}

runAllTests().catch((err) => {
  console.error("Fatal error during test-latihan-8:", err);
  process.exit(1);
});
