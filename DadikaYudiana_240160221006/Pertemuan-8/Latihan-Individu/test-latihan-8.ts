/**
 * Skrip Pengujian Latihan Individu Pertemuan 8
 * Menguji API Mahasiswa (Pertemuan-7/Tugas-5)
 * Memvalidasi seluruh endpoint fungsional dan pengujian negatif (status 400).
 */

import { app } from "../../Pertemuan-7/Tugas-5/app.ts";
import { prisma } from "../../Pertemuan-7/Tugas-5/src/config/client.ts";

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
  console.log(" MEMULAI PENGUJIAN LATIHAN INDIVIDU PERTEMUAN 8 — API MAHASISWA (TUGAS-5)");
  console.log("================================================================================\n");

  // 1. Verifikasi kondisi awal database
  const countAwal = await prisma.mahasiswa.count();
  console.log(`[Pemeriksaan Awal] Jumlah data mahasiswa saat ini di database: ${countAwal} baris`);

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

  const NIM_TEST_1 = "TEST80000001";
  const NIM_TEST_2 = "TEST80000002";

  try {
    // Pastikan tidak ada sisa data uji sebelumnya
    await prisma.mahasiswa.deleteMany({
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

    // 2. GET /mahasiswa → 200
    {
      const res = await fetch(`${baseUrl}/mahasiswa`);
      const body = (await res.json()) as any;
      record(
        "Mengambil seluruh daftar mahasiswa (kondisi awal)",
        "GET /mahasiswa",
        200,
        res.status,
        body.success === true && Array.isArray(body.data),
        `Total data diterima: ${body.data?.length ?? 0}`
      );
    }

    // 3. POST /mahasiswa dengan data valid → 201
    {
      const res = await fetch(`${baseUrl}/mahasiswa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nim: NIM_TEST_1,
          nama: "Mahasiswa Uji Pertemuan 8",
          prodi: "Teknik Informatika",
          angkatan: 2024,
        }),
      });
      const body = (await res.json()) as any;
      record(
        "Membuat data mahasiswa baru dengan payload valid",
        "POST /mahasiswa",
        201,
        res.status,
        body.success === true && body.data?.nim === NIM_TEST_1,
        body.message
      );
    }

    // 4. GET /mahasiswa/:nim untuk data yang dibuat → 200
    {
      const res = await fetch(`${baseUrl}/mahasiswa/${NIM_TEST_1}`);
      const body = (await res.json()) as any;
      record(
        "Mengambil detail mahasiswa yang baru dibuat",
        `GET /mahasiswa/${NIM_TEST_1}`,
        200,
        res.status,
        body.success === true && body.data?.nim === NIM_TEST_1,
        `NIM: ${body.data?.nim}, Nama: ${body.data?.nama}`
      );
    }

    // 5. GET /mahasiswa/:nim untuk data yang tidak ditemukan → 404
    {
      const res = await fetch(`${baseUrl}/mahasiswa/NIM_TIDAK_ADA_9999`);
      const body = (await res.json()) as any;
      record(
        "Mengambil detail mahasiswa dengan NIM tidak terdaftar",
        "GET /mahasiswa/NIM_TIDAK_ADA_9999",
        404,
        res.status,
        body.success === false,
        body.message
      );
    }

    // 6. PATCH /mahasiswa/:nim dengan data valid → 200
    {
      const res = await fetch(`${baseUrl}/mahasiswa/${NIM_TEST_1}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: "Mahasiswa Uji Pertemuan 8 Terupdate",
          prodi: "Sistem Informasi",
          angkatan: 2025,
        }),
      });
      const body = (await res.json()) as any;
      record(
        "Memperbarui sebagian data mahasiswa secara valid",
        `PATCH /mahasiswa/${NIM_TEST_1}`,
        200,
        res.status,
        body.success === true &&
          body.data?.nama === "Mahasiswa Uji Pertemuan 8 Terupdate" &&
          body.data?.angkatan === 2025,
        body.message
      );
    }

    // 7. DELETE /mahasiswa/:nim → 204
    {
      const res = await fetch(`${baseUrl}/mahasiswa/${NIM_TEST_1}`, {
        method: "DELETE",
      });
      record(
        "Menghapus data mahasiswa uji",
        `DELETE /mahasiswa/${NIM_TEST_1}`,
        204,
        res.status,
        res.status === 204,
        "Berhasil dihapus tanpa body"
      );
    }

    // Verifikasi data benar-benar terhapus (GET → 404)
    {
      const res = await fetch(`${baseUrl}/mahasiswa/${NIM_TEST_1}`);
      const body = (await res.json()) as any;
      record(
        "Verifikasi data uji telah terhapus dari basis data",
        `GET /mahasiswa/${NIM_TEST_1}`,
        404,
        res.status,
        body.success === false,
        body.message
      );
    }

    // -------------------------------------------------------------------------
    // BAGIAN 2: PENGUJIAN NEGATIF (POST)
    // -------------------------------------------------------------------------
    console.log("\n--- BAGIAN 2: PENGUJIAN NEGATIF (POST) ---");

    // 9. POST: Field wajib 'nim' tidak diisi / hilang → 400
    {
      const res = await fetch(`${baseUrl}/mahasiswa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: "Mahasiswa Tanpa NIM",
          prodi: "TI",
          angkatan: 2024,
        }),
      });
      const body = (await res.json()) as any;
      record(
        "POST: Field 'nim' tidak disertakan",
        "POST /mahasiswa",
        400,
        res.status,
        body.success === false && body.message.includes("'nim' wajib diisi"),
        body.message
      );
    }

    // 10. POST: Field wajib 'nama' berupa string kosong → 400
    {
      const res = await fetch(`${baseUrl}/mahasiswa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nim: NIM_TEST_2,
          nama: "   ",
          prodi: "TI",
          angkatan: 2024,
        }),
      });
      const body = (await res.json()) as any;
      record(
        "POST: Field 'nama' berupa spasi kosong",
        "POST /mahasiswa",
        400,
        res.status,
        body.success === false && body.message.includes("'nama' wajib diisi"),
        body.message
      );
    }

    // 11. POST: Field wajib 'prodi' tidak disertakan → 400
    {
      const res = await fetch(`${baseUrl}/mahasiswa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nim: NIM_TEST_2,
          nama: "Mahasiswa Tanpa Prodi",
          angkatan: 2024,
        }),
      });
      const body = (await res.json()) as any;
      record(
        "POST: Field 'prodi' tidak disertakan",
        "POST /mahasiswa",
        400,
        res.status,
        body.success === false && body.message.includes("'prodi' wajib diisi"),
        body.message
      );
    }

    // 12. POST: Tipe data salah - 'angkatan' berupa string → 400
    {
      const res = await fetch(`${baseUrl}/mahasiswa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nim: NIM_TEST_2,
          nama: "Mahasiswa Uji",
          prodi: "TI",
          angkatan: "2024", // string
        }),
      });
      const body = (await res.json()) as any;
      record(
        "POST: Tipe data 'angkatan' berupa string",
        "POST /mahasiswa",
        400,
        res.status,
        body.success === false &&
          body.message.includes("'angkatan' wajib berupa angka bilangan bulat"),
        body.message
      );
    }

    // 13. POST: 'angkatan' bukan bilangan bulat (desimal) → 400
    {
      const res = await fetch(`${baseUrl}/mahasiswa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nim: NIM_TEST_2,
          nama: "Mahasiswa Uji",
          prodi: "TI",
          angkatan: 2024.5,
        }),
      });
      const body = (await res.json()) as any;
      record(
        "POST: 'angkatan' bernilai pecahan / desimal",
        "POST /mahasiswa",
        400,
        res.status,
        body.success === false &&
          body.message.includes("'angkatan' wajib berupa angka bilangan bulat"),
        body.message
      );
    }

    // 14. POST: 'angkatan' di bawah rentang (< 2000) → 400
    {
      const res = await fetch(`${baseUrl}/mahasiswa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nim: NIM_TEST_2,
          nama: "Mahasiswa Uji",
          prodi: "TI",
          angkatan: 1999,
        }),
      });
      const body = (await res.json()) as any;
      record(
        "POST: 'angkatan' di bawah batas minimum (1999)",
        "POST /mahasiswa",
        400,
        res.status,
        body.success === false && body.message.includes("antara 2000 dan"),
        body.message
      );
    }

    // 15. POST: 'angkatan' di atas rentang (> tahun berjalan) → 400
    {
      const res = await fetch(`${baseUrl}/mahasiswa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nim: NIM_TEST_2,
          nama: "Mahasiswa Uji",
          prodi: "TI",
          angkatan: 2030,
        }),
      });
      const body = (await res.json()) as any;
      record(
        "POST: 'angkatan' di atas batas maksimum (2030)",
        "POST /mahasiswa",
        400,
        res.status,
        body.success === false && body.message.includes("antara 2000 dan"),
        body.message
      );
    }

    // -------------------------------------------------------------------------
    // BAGIAN 3: PENGUJIAN NEGATIF (PATCH)
    // -------------------------------------------------------------------------
    console.log("\n--- BAGIAN 3: PENGUJIAN NEGATIF (PATCH) ---");

    // Buat data uji khusus untuk skenario PATCH negatif
    await prisma.mahasiswa.create({
      data: {
        nim: NIM_TEST_2,
        nama: "Mahasiswa Uji PATCH",
        prodi: "Sistem Informasi",
        angkatan: 2024,
      },
    });

    // 16. PATCH: Payload kosong {} → 400
    {
      const res = await fetch(`${baseUrl}/mahasiswa/${NIM_TEST_2}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const body = (await res.json()) as any;
      record(
        "PATCH: Payload body kosong {}",
        `PATCH /mahasiswa/${NIM_TEST_2}`,
        400,
        res.status,
        body.success === false &&
          body.message.includes("Isi minimal satu field yang ingin diperbarui"),
        body.message
      );
    }

    // 17. PATCH: Mencoba mengubah field 'nim' → 400
    {
      const res = await fetch(`${baseUrl}/mahasiswa/${NIM_TEST_2}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nim: "TEST89999999",
        }),
      });
      const body = (await res.json()) as any;
      record(
        "PATCH: Mencoba memodifikasi field 'nim'",
        `PATCH /mahasiswa/${NIM_TEST_2}`,
        400,
        res.status,
        body.success === false &&
          body.message.includes("Field 'nim' tidak dapat diubah melalui endpoint PATCH"),
        body.message
      );
    }

    // 18. PATCH: Field 'nama' berupa string kosong → 400
    {
      const res = await fetch(`${baseUrl}/mahasiswa/${NIM_TEST_2}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: "   ",
        }),
      });
      const body = (await res.json()) as any;
      record(
        "PATCH: Field 'nama' berupa spasi kosong",
        `PATCH /mahasiswa/${NIM_TEST_2}`,
        400,
        res.status,
        body.success === false &&
          body.message.includes("Field 'nama' harus berupa teks dan tidak boleh kosong"),
        body.message
      );
    }

    // 19. PATCH: Field 'prodi' berupa string kosong → 400
    {
      const res = await fetch(`${baseUrl}/mahasiswa/${NIM_TEST_2}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prodi: "   ",
        }),
      });
      const body = (await res.json()) as any;
      record(
        "PATCH: Field 'prodi' berupa spasi kosong",
        `PATCH /mahasiswa/${NIM_TEST_2}`,
        400,
        res.status,
        body.success === false &&
          body.message.includes("Field 'prodi' harus berupa teks dan tidak boleh kosong"),
        body.message
      );
    }

    // 20. PATCH: Tipe data salah - 'angkatan' berupa string → 400
    {
      const res = await fetch(`${baseUrl}/mahasiswa/${NIM_TEST_2}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          angkatan: "2024",
        }),
      });
      const body = (await res.json()) as any;
      record(
        "PATCH: Tipe data 'angkatan' berupa string",
        `PATCH /mahasiswa/${NIM_TEST_2}`,
        400,
        res.status,
        body.success === false &&
          body.message.includes("'angkatan' wajib berupa angka bilangan bulat"),
        body.message
      );
    }

    // 21. PATCH: 'angkatan' bukan bilangan bulat (desimal) → 400
    {
      const res = await fetch(`${baseUrl}/mahasiswa/${NIM_TEST_2}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          angkatan: 2024.75,
        }),
      });
      const body = (await res.json()) as any;
      record(
        "PATCH: 'angkatan' bernilai pecahan / desimal",
        `PATCH /mahasiswa/${NIM_TEST_2}`,
        400,
        res.status,
        body.success === false &&
          body.message.includes("'angkatan' wajib berupa angka bilangan bulat"),
        body.message
      );
    }

    // 22. PATCH: 'angkatan' di bawah rentang (< 2000) → 400
    {
      const res = await fetch(`${baseUrl}/mahasiswa/${NIM_TEST_2}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          angkatan: 1995,
        }),
      });
      const body = (await res.json()) as any;
      record(
        "PATCH: 'angkatan' di bawah batas minimum (1995)",
        `PATCH /mahasiswa/${NIM_TEST_2}`,
        400,
        res.status,
        body.success === false && body.message.includes("antara 2000 dan"),
        body.message
      );
    }

    // 23. PATCH: 'angkatan' di atas rentang (> tahun berjalan) → 400
    {
      const res = await fetch(`${baseUrl}/mahasiswa/${NIM_TEST_2}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          angkatan: 2035,
        }),
      });
      const body = (await res.json()) as any;
      record(
        "PATCH: 'angkatan' di atas batas maksimum (2035)",
        `PATCH /mahasiswa/${NIM_TEST_2}`,
        400,
        res.status,
        body.success === false && body.message.includes("antara 2000 dan"),
        body.message
      );
    }

    // 24. CLEANUP: Hapus data uji NIM_TEST_2 → 204
    {
      const res = await fetch(`${baseUrl}/mahasiswa/${NIM_TEST_2}`, {
        method: "DELETE",
      });
      record(
        "Pembersihan data sementara uji PATCH",
        `DELETE /mahasiswa/${NIM_TEST_2}`,
        204,
        res.status,
        res.status === 204,
        "Berhasil dibersihkan"
      );
    }

    // -------------------------------------------------------------------------
    // VERIFIKASI KEBERSIHAN BASIS DATA
    // -------------------------------------------------------------------------
    console.log("\n--- VERIFIKASI KEBERSIHAN BASIS DATA ---");
    const countAkhir = await prisma.mahasiswa.count();
    console.log(`[Pemeriksaan Akhir] Jumlah data mahasiswa di database: ${countAkhir} baris`);

    record(
      "Verifikasi integritas database (jumlah data kembali ke kondisi awal)",
      "Database State Verification",
      countAwal,
      countAkhir,
      countAkhir === countAwal,
      `Kondisi awal: ${countAwal} baris, Kondisi akhir: ${countAkhir} baris`
    );

    const totalPass = results.filter((r) => r.status === "PASS").length;
    const totalFail = results.filter((r) => r.status === "FAIL").length;

    console.log("\n================================================================================");
    console.log(` HASIL PENGUJIAN: ${totalPass}/${results.length} PENGUJIAN LULUS (${totalFail} GAGAL)`);
    console.log("================================================================================");

    if (totalFail > 0) {
      process.exitCode = 1;
    }
  } finally {
    // Pastikan server tertutup dan koneksi prisma dilepaskan
    server.close();
    await prisma.$disconnect();
  }
}

runAllTests().catch((error) => {
  console.error("Kesalahan fatal saat eksekusi pengujian:", error);
  process.exit(1);
});

