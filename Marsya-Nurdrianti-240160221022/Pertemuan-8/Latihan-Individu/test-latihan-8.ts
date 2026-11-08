/**
 * Skrip Pengujian Latihan Individu Pertemuan 8
 * Menguji REST API Sistem Informasi Absensi Mahasiswa (UTS)
 * Mahasiswa: Marsya Nurdrianti (NIM: 240160221022) - Kelas SI-VA
 * Memvalidasi seluruh endpoint fungsional dan pengujian negatif (status 400 & 404).
 */

import { app } from "../uts/240160221022-Marsya-Nurdrianti/src/app.ts";
import { prisma } from "../uts/240160221022-Marsya-Nurdrianti/src/client.ts";
import type { Server } from "node:http";

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
  console.log(" Identitas: Marsya Nurdrianti (NIM: 240160221022) — SI-VA");
  console.log("================================================================================\n");

  // 1. Verifikasi kondisi awal database
  const countAwal = await prisma.absensi.count();
  console.log(`[Pemeriksaan Awal] Jumlah data absensi saat ini di database: ${countAwal} baris`);

  // 2. Inisialisasi test server pada port dinamis (0)
  const server: Server = app.listen(0);
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

  const NIM_TEST_1 = "TEST80000001";
  const NIM_TEST_2 = "TEST80000002";
  let createdId: number | null = null;

  try {
    // Pastikan tidak ada sisa data uji sebelumnya
    await prisma.absensi.deleteMany({
      where: { nim: { in: [NIM_TEST_1, NIM_TEST_2] } },
    });

    // -------------------------------------------------------------------------
    // BAGIAN 1: PENGUJIAN ENDPOINT UTAMA
    // -------------------------------------------------------------------------
    console.log("\n--- BAGIAN 1: PENGUJIAN ENDPOINT UTAMA ---");

    // 1. GET /api/health → 200
    {
      const res = await fetch(`${baseUrl}/api/health`);
      const body = (await res.json()) as any;
      record(
        "Pemeriksaan kesehatan API dan koneksi database",
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
        "Mengambil seluruh daftar absensi (kondisi awal)",
        "GET /api/absensi",
        200,
        res.status,
        body.success === true && Array.isArray(body.data),
        `Total data diterima: ${body.data?.length ?? 0}`
      );
    }

    // 3. POST /api/absensi dengan data valid → 201
    {
      const res = await fetch(`${baseUrl}/api/absensi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nim: NIM_TEST_1,
          namaMahasiswa: "Mahasiswa Uji Pertemuan 8",
          tanggal: "2026-11-02",
          waktuMasuk: "08:00",
          status: "Hadir",
          keterangan: "Absensi kehadiran valid skenario uji 8",
        }),
      });
      const body = (await res.json()) as any;
      if (body.data?.id) {
        createdId = body.data.id;
      }
      record(
        "Membuat data absensi baru dengan payload valid",
        "POST /api/absensi",
        201,
        res.status,
        body.success === true && body.data?.nim === NIM_TEST_1,
        `ID terbuat: ${createdId}`
      );
    }

    // 4. GET /api/absensi/:id untuk data yang dibuat → 200
    {
      const res = await fetch(`${baseUrl}/api/absensi/${createdId}`);
      const body = (await res.json()) as any;
      record(
        "Mengambil detail absensi yang baru dibuat berdasarkan ID",
        `GET /api/absensi/${createdId}`,
        200,
        res.status,
        body.success === true && body.data?.id === createdId,
        `ID: ${body.data?.id}, Mahasiswa: ${body.data?.namaMahasiswa}`
      );
    }

    // 5. GET /api/absensi/:id untuk data yang tidak ditemukan → 404
    {
      const res = await fetch(`${baseUrl}/api/absensi/999999`);
      const body = (await res.json()) as any;
      record(
        "Mengambil detail absensi dengan ID tidak terdaftar",
        "GET /api/absensi/999999",
        404,
        res.status,
        body.success === false,
        body.message
      );
    }

    // 6. PATCH /api/absensi/:id dengan data valid → 200
    {
      const res = await fetch(`${baseUrl}/api/absensi/${createdId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Izin",
          keterangan: "Pembaruan keterangan kehadiran izin seminar",
        }),
      });
      const body = (await res.json()) as any;
      record(
        "Memperbarui sebagian data absensi secara valid",
        `PATCH /api/absensi/${createdId}`,
        200,
        res.status,
        body.success === true && body.data?.status === "Izin",
        body.message
      );
    }

    // 7. DELETE /api/absensi/:id → 204
    {
      const res = await fetch(`${baseUrl}/api/absensi/${createdId}`, {
        method: "DELETE",
      });
      record(
        "Menghapus data absensi uji",
        `DELETE /api/absensi/${createdId}`,
        204,
        res.status,
        res.status === 204,
        "Berhasil dihapus tanpa body"
      );
    }

    // 8. GET /api/absensi/:id verifikasi terhapus → 404
    {
      const res = await fetch(`${baseUrl}/api/absensi/${createdId}`);
      const body = (await res.json()) as any;
      record(
        "Verifikasi data uji telah terhapus dari basis data",
        `GET /api/absensi/${createdId}`,
        404,
        res.status,
        body.success === false,
        body.message
      );
    }

    // -------------------------------------------------------------------------
    // BAGIAN 2: PENGUJIAN NEGATIF POST /api/absensi (Status 400 Bad Request)
    // -------------------------------------------------------------------------
    console.log("\n--- BAGIAN 2: PENGUJIAN NEGATIF (POST) ---");

    // 9. POST: Field wajib 'nim' tidak disertakan → 400
    {
      const res = await fetch(`${baseUrl}/api/absensi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          namaMahasiswa: "Mahasiswa Tanpa NIM",
          tanggal: "2026-11-02",
          status: "Hadir",
        }),
      });
      const body = (await res.json()) as any;
      record(
        "POST: Field 'nim' tidak disertakan",
        "POST /api/absensi",
        400,
        res.status,
        body.success === false && body.message.includes("nim"),
        body.message
      );
    }

    // 10. POST: Field wajib 'nim' string kosong → 400
    {
      const res = await fetch(`${baseUrl}/api/absensi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nim: "   ",
          namaMahasiswa: "Mahasiswa NIM Kosong",
          tanggal: "2026-11-02",
          status: "Hadir",
        }),
      });
      const body = (await res.json()) as any;
      record(
        "POST: Field 'nim' hanya berupa string kosong/spasi",
        "POST /api/absensi",
        400,
        res.status,
        body.success === false && body.message.includes("nim"),
        body.message
      );
    }

    // 11. POST: Field 'namaMahasiswa' tidak disertakan → 400
    {
      const res = await fetch(`${baseUrl}/api/absensi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nim: NIM_TEST_2,
          tanggal: "2026-11-02",
          status: "Hadir",
        }),
      });
      const body = (await res.json()) as any;
      record(
        "POST: Field 'namaMahasiswa' tidak disertakan",
        "POST /api/absensi",
        400,
        res.status,
        body.success === false && body.message.includes("namaMahasiswa"),
        body.message
      );
    }

    // 12. POST: Field 'namaMahasiswa' string kosong → 400
    {
      const res = await fetch(`${baseUrl}/api/absensi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nim: NIM_TEST_2,
          namaMahasiswa: "   ",
          tanggal: "2026-11-02",
          status: "Hadir",
        }),
      });
      const body = (await res.json()) as any;
      record(
        "POST: Field 'namaMahasiswa' berupa karakter spasi",
        "POST /api/absensi",
        400,
        res.status,
        body.success === false && body.message.includes("namaMahasiswa"),
        body.message
      );
    }

    // 13. POST: Field 'tanggal' tidak disertakan → 400
    {
      const res = await fetch(`${baseUrl}/api/absensi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nim: NIM_TEST_2,
          namaMahasiswa: "Mahasiswa Uji",
          status: "Hadir",
        }),
      });
      const body = (await res.json()) as any;
      record(
        "POST: Field 'tanggal' tidak disertakan",
        "POST /api/absensi",
        400,
        res.status,
        body.success === false && body.message.includes("tanggal"),
        body.message
      );
    }

    // 14. POST: Field 'tanggal' bukan tanggal valid → 400
    {
      const res = await fetch(`${baseUrl}/api/absensi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nim: NIM_TEST_2,
          namaMahasiswa: "Mahasiswa Uji",
          tanggal: "bukan-tanggal-format",
          status: "Hadir",
        }),
      });
      const body = (await res.json()) as any;
      record(
        "POST: Format tanggal tidak valid",
        "POST /api/absensi",
        400,
        res.status,
        body.success === false && body.message.includes("tanggal"),
        body.message
      );
    }

    // 15. POST: Field 'status' tidak disertakan → 400
    {
      const res = await fetch(`${baseUrl}/api/absensi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nim: NIM_TEST_2,
          namaMahasiswa: "Mahasiswa Uji",
          tanggal: "2026-11-02",
        }),
      });
      const body = (await res.json()) as any;
      record(
        "POST: Field 'status' tidak disertakan",
        "POST /api/absensi",
        400,
        res.status,
        body.success === false && body.message.includes("status"),
        body.message
      );
    }

    // 16. POST: Nilai 'status' di luar ketentuan → 400
    {
      const res = await fetch(`${baseUrl}/api/absensi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nim: NIM_TEST_2,
          namaMahasiswa: "Mahasiswa Uji",
          tanggal: "2026-11-02",
          status: "Bolos",
        }),
      });
      const body = (await res.json()) as any;
      record(
        "POST: Nilai status di luar Hadir/Izin/Sakit/Alpa",
        "POST /api/absensi",
        400,
        res.status,
        body.success === false && body.message.includes("status"),
        body.message
      );
    }

    // 17. POST: Field 'waktuMasuk' bertipe salah (number) → 400
    {
      const res = await fetch(`${baseUrl}/api/absensi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nim: NIM_TEST_2,
          namaMahasiswa: "Mahasiswa Uji",
          tanggal: "2026-11-02",
          status: "Hadir",
          waktuMasuk: 800,
        }),
      });
      const body = (await res.json()) as any;
      record(
        "POST: Tipe data field 'waktuMasuk' bukan string",
        "POST /api/absensi",
        400,
        res.status,
        body.success === false && body.message.includes("waktuMasuk"),
        body.message
      );
    }

    // 18. POST: Field 'keterangan' bertipe salah (boolean) → 400
    {
      const res = await fetch(`${baseUrl}/api/absensi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nim: NIM_TEST_2,
          namaMahasiswa: "Mahasiswa Uji",
          tanggal: "2026-11-02",
          status: "Hadir",
          keterangan: true,
        }),
      });
      const body = (await res.json()) as any;
      record(
        "POST: Tipe data field 'keterangan' bukan string",
        "POST /api/absensi",
        400,
        res.status,
        body.success === false && body.message.includes("keterangan"),
        body.message
      );
    }

    // 19. POST: Injeksi field tidak dikenal → 400
    {
      const res = await fetch(`${baseUrl}/api/absensi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nim: NIM_TEST_2,
          namaMahasiswa: "Mahasiswa Uji",
          tanggal: "2026-11-02",
          status: "Hadir",
          fieldIlegal: "payload berbahaya",
        }),
      });
      const body = (await res.json()) as any;
      record(
        "POST: Penolakan payload dengan field tidak dikenal",
        "POST /api/absensi",
        400,
        res.status,
        body.success === false && body.message.includes("tidak dikenal"),
        body.message
      );
    }

    // 20. POST: Body berupa array bukan objek → 400
    {
      const res = await fetch(`${baseUrl}/api/absensi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([{ nim: NIM_TEST_2 }]),
      });
      const body = (await res.json()) as any;
      record(
        "POST: Body request berupa format Array alih-alih Objek",
        "POST /api/absensi",
        400,
        res.status,
        body.success === false,
        body.message
      );
    }

    // -------------------------------------------------------------------------
    // BAGIAN 3: PENGUJIAN NEGATIF PATCH & VALIDASI ID
    // -------------------------------------------------------------------------
    console.log("\n--- BAGIAN 3: PENGUJIAN NEGATIF (PATCH & VALIDASI ID) ---");

    // 21. PATCH: Payload body kosong {} → 400
    {
      const res = await fetch(`${baseUrl}/api/absensi/1`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const body = (await res.json()) as any;
      record(
        "PATCH: Payload body kosong ({})",
        "PATCH /api/absensi/1",
        400,
        res.status,
        body.success === false && body.message.includes("tidak boleh kosong"),
        body.message
      );
    }

    // 22. PATCH: Mengirim field tidak dikenal → 400
    {
      const res = await fetch(`${baseUrl}/api/absensi/1`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statusMahasiswa: "Hadir" }),
      });
      const body = (await res.json()) as any;
      record(
        "PATCH: Mengirim field yang tidak terdaftar",
        "PATCH /api/absensi/1",
        400,
        res.status,
        body.success === false && body.message.includes("tidak dikenal"),
        body.message
      );
    }

    // 23. PATCH: Mengirim status tidak valid → 400
    {
      const res = await fetch(`${baseUrl}/api/absensi/1`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Terlambat" }),
      });
      const body = (await res.json()) as any;
      record(
        "PATCH: Nilai status di luar Hadir/Izin/Sakit/Alpa",
        "PATCH /api/absensi/1",
        400,
        res.status,
        body.success === false && body.message.includes("status"),
        body.message
      );
    }

    // 24. URL ID tidak valid (bukan bilangan bulat) → 400
    {
      const res = await fetch(`${baseUrl}/api/absensi/karakter-bukan-angka`);
      const body = (await res.json()) as any;
      record(
        "Validasi ID: Parameter ID bukan bilangan bulat",
        "GET /api/absensi/karakter-bukan-angka",
        400,
        res.status,
        body.success === false && body.message.includes("bilangan bulat"),
        body.message
      );
    }

    // 25. PATCH pada ID yang tidak ditemukan → 404
    {
      const res = await fetch(`${baseUrl}/api/absensi/999999`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Sakit" }),
      });
      const body = (await res.json()) as any;
      record(
        "PATCH: ID absensi tidak ditemukan di database",
        "PATCH /api/absensi/999999",
        404,
        res.status,
        body.success === false,
        body.message
      );
    }

  } finally {
    // Tutup koneksi server dan Prisma
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
    await prisma.$disconnect();
    console.log("\n[Teardown] Server pengujian ditutup dan koneksi Prisma diputus.");
  }

  // Ringkasan hasil
  const passed = results.filter((r) => r.status === "PASS").length;
  const failed = results.filter((r) => r.status === "FAIL").length;

  console.log("\n================================================================================");
  console.log(` REKAPITULASI HASIL: ${passed} DARI ${results.length} PENGUJIAN BERHASIL (PASS)`);
  if (failed === 0) {
    console.log(" KESIMPULAN: SELURUH 25 SKENARIO PENGUJIAN REST API ABSENSI LULUS 100%.");
  } else {
    console.log(` PERINGATAN: ${failed} skenario pengujian gagal.`);
  }
  console.log("================================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error("Fatal test error:", err);
  process.exit(1);
});
