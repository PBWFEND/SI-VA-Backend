/**
 * Test Runner Komprehensif — Pertemuan 7 (Sarah Azkiya - 240160221057)
 * Menguji seluruh skenario Buku (Tugas 5) dan Pengguna (Latihan Individu §11)
 */

import { app } from "./app.ts";
import { prisma } from "./client.ts";
import { app as appLatihan } from "./latihan-individu/latihan.ts";

interface MockResponse {
  statusCode: number;
  body: any;
  success: boolean;
}

function request(appInstance: any, method: string, url: string, body?: any): Promise<MockResponse> {
  return new Promise((resolve, reject) => {
    let resolved = false;

    const [urlPath, queryString] = url.split("?");
    const query: Record<string, string> = {};
    if (queryString) {
      new URLSearchParams(queryString).forEach((val, key) => {
        query[key] = val;
      });
    }

    const req: any = {
      method,
      url,
      originalUrl: url,
      path: urlPath,
      headers: { host: "localhost:3008" },
      body: body,
      params: {},
      query,
    };

    const res: any = {
      statusCode: 200,
      headersSent: false,
      status(code: number) {
        this.statusCode = code;
        return this;
      },
      json(data: any) {
        if (resolved) return this;
        resolved = true;
        this.headersSent = true;
        resolve({
          statusCode: this.statusCode,
          body: data,
          success: data?.success ?? false,
        });
        return this;
      },
      send(data?: any) {
        if (resolved) return this;
        resolved = true;
        this.headersSent = true;
        resolve({
          statusCode: this.statusCode,
          body: data,
          success: this.statusCode >= 200 && this.statusCode < 300,
        });
        return this;
      },
    };

    try {
      appInstance(req, res, (err: any) => {
        if (err) return reject(err);
        if (!resolved) {
          resolved = true;
          resolve({
            statusCode: 404,
            body: { success: false, message: "Route unhandled" },
            success: false,
          });
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}

async function runTestSuite() {
  console.log("============================================================");
  console.log("  PENGUJIAN KOMPREHENSIF PERTEMUAN 7 — SARAH AZKIYA (240160221057)");
  console.log("============================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`[PASS] ${msg}`);
      passed++;
    } else {
      console.error(`[FAIL] ${msg}`);
      failed++;
    }
  }

  try {
    // ------------------------------------------------------------
    // BAGIAN 1: PENGUJIAN TUGAS 5 (RESOURCE BUKU)
    // ------------------------------------------------------------
    console.log("--- PENGUJIAN TUGAS 5: RESOURCE BUKU ---");

    // 0. Bersihkan data buku uji sebelumnya
    await prisma.buku.deleteMany({
      where: {
        judul: {
          in: [
            "Pemrograman Web Lanjut",
            "Sistem Informasi Perpustakaan Modern",
            "Buku Uji Kasus",
          ],
        },
      },
    });

    // 1. GET /buku
    const r1 = await request(app, "GET", "/buku");
    assert(r1.statusCode === 200, "1. GET /buku mengembalikan status 200 OK");
    assert(Array.isArray(r1.body?.data), "   Data buku berbentuk array");

    // 2. GET /buku/:id tidak ditemukan
    const r2 = await request(app, "GET", "/buku/999999");
    assert(r2.statusCode === 404, "2. GET /buku/:id tidak ditemukan mengembalikan 404 Not Found");

    // 3. GET /buku/id-invalid (bukan angka positif)
    const r3 = await request(app, "GET", "/buku/abc");
    assert(r3.statusCode === 400, "3. GET /buku/id-invalid mengembalikan 400 Bad Request");

    // 4. POST /buku judul kosong
    const r4 = await request(app, "POST", "/buku", {
      judul: "   ",
      penulis: "Sarah Azkiya",
      tahun: 2024,
      stok: 5,
    });
    assert(r4.statusCode === 400, "4. POST /buku judul kosong mengembalikan 400 Bad Request");
    assert(Array.isArray(r4.body?.details), "   Terdapat array details kesalahan validasi");

    // 5. POST /buku penulis kosong
    const r5 = await request(app, "POST", "/buku", {
      judul: "Pemrograman Web Lanjut",
      penulis: "",
      tahun: 2024,
      stok: 5,
    });
    assert(r5.statusCode === 400, "5. POST /buku penulis kosong mengembalikan 400 Bad Request");

    // 6. POST /buku tahun invalid (di luar rentang 1000–2100)
    const r6 = await request(app, "POST", "/buku", {
      judul: "Pemrograman Web Lanjut",
      penulis: "Sarah Azkiya",
      tahun: 850,
      stok: 5,
    });
    assert(r6.statusCode === 400, "6. POST /buku tahun invalid (< 1000) mengembalikan 400 Bad Request");

    // 7. POST /buku stok negatif
    const r7 = await request(app, "POST", "/buku", {
      judul: "Pemrograman Web Lanjut",
      penulis: "Sarah Azkiya",
      tahun: 2024,
      stok: -3,
    });
    assert(r7.statusCode === 400, "7. POST /buku stok negatif mengembalikan 400 Bad Request");

    // 8. POST /buku valid
    const r8 = await request(app, "POST", "/buku", {
      judul: "Pemrograman Web Lanjut",
      penulis: "Sarah Azkiya",
      tahun: 2024,
      stok: 10,
    });
    assert(r8.statusCode === 201, "8. POST /buku valid mengembalikan 201 Created");
    assert(r8.body?.success === true, "   Respons memiliki success: true");
    const createdId = r8.body?.data?.id;
    assert(typeof createdId === "number" && createdId > 0, "   Buku tersimpan dengan ID numerik auto-increment");

    // 9. GET /buku/:id valid
    const r9 = await request(app, "GET", `/buku/${createdId}`);
    assert(r9.statusCode === 200, "9. GET /buku/:id valid mengembalikan 200 OK");
    assert(r9.body?.data?.judul === "Pemrograman Web Lanjut", "   Judul sesuai dengan data tersimpan");

    // 10. POST buku kedua untuk filter test
    const r10 = await request(app, "POST", "/buku", {
      judul: "Sistem Informasi Perpustakaan Modern",
      penulis: "Sarah Azkiya",
      tahun: 2023,
      stok: 7,
    });
    const createdId2 = r10.body?.data?.id;
    assert(r10.statusCode === 201, "10. POST /buku kedua berhasil dibuat");

    // 11. GET /buku dengan filter query (?penulis=Sarah &tahun=2024)
    const r11 = await request(app, "GET", "/buku?penulis=Sarah&tahun=2024");
    assert(r11.statusCode === 200, "11. GET /buku dengan filter query mengembalikan 200 OK");
    const filtered = r11.body?.data;
    assert(Array.isArray(filtered) && filtered.some((b: any) => b.id === createdId), "    Hasil filter memuat buku tahun 2024");

    // 12. PATCH /buku/:id valid
    const r12 = await request(app, "PATCH", `/buku/${createdId}`, {
      stok: 18,
      judul: "Pemrograman Web Lanjut (Edisi 2)",
    });
    assert(r12.statusCode === 200, "12. PATCH /buku/:id valid mengembalikan 200 OK");
    assert(r12.body?.data?.stok === 18, "    Stok berhasil diperbarui menjadi 18");
    assert(r12.body?.data?.judul === "Pemrograman Web Lanjut (Edisi 2)", "    Judul berhasil diperbarui");

    // 13. PATCH /buku/:id invalid (body kosong)
    const r13 = await request(app, "PATCH", `/buku/${createdId}`, {});
    assert(r13.statusCode === 400, "13. PATCH /buku/:id body kosong mengembalikan 400 Bad Request");

    // 14. PATCH /buku/:id invalid field (tahun < 1000)
    const r14 = await request(app, "PATCH", `/buku/${createdId}`, { tahun: 500 });
    assert(r14.statusCode === 400, "14. PATCH /buku/:id field invalid mengembalikan 400 Bad Request");

    // 15. PATCH /buku/:id tidak ditemukan
    const r15 = await request(app, "PATCH", "/buku/999999", { stok: 20 });
    assert(r15.statusCode === 404, "15. PATCH /buku/:id tidak ditemukan mengembalikan 404 Not Found");

    // 16. DELETE /buku/:id valid
    const r16 = await request(app, "DELETE", `/buku/${createdId}`);
    assert(r16.statusCode === 204, "16. DELETE /buku/:id valid mengembalikan 204 No Content");

    // 17. DELETE /buku/:id tidak ditemukan (sudah dihapus)
    const r17 = await request(app, "DELETE", `/buku/${createdId}`);
    assert(r17.statusCode === 404, "17. DELETE /buku/:id sudah dihapus mengembalikan 404 Not Found");

    // 18. GET /buku/:id verifikasi setelah dihapus
    const r18 = await request(app, "GET", `/buku/${createdId}`);
    assert(r18.statusCode === 404, "18. GET /buku/:id setelah dihapus mengembalikan 404 Not Found");

    // 19. Endpoint random → 404
    const r19 = await request(app, "GET", "/endpoint-acak-tidak-ada");
    assert(r19.statusCode === 404, "19. Endpoint acak mengembalikan 404 Not Found");

    // 20. Database healthcheck
    const r20 = await request(app, "GET", "/api/health");
    assert(r20.statusCode === 200, "20. GET /api/health mengembalikan 200 OK (Database terhubung)");

    // 21. Persistensi: Buku kedua tetap tersimpan di SQLite
    const r21 = await request(app, "GET", `/buku/${createdId2}`);
    assert(r21.statusCode === 200, "21. Persistensi: Buku kedua tetap tersimpan di SQLite database");

    // Bersihkan buku kedua
    await prisma.buku.delete({ where: { id: createdId2 } });

    // ------------------------------------------------------------
    // BAGIAN 2: PENGUJIAN LATIHAN INDIVIDU §11 (RESOURCE PENGGUNA)
    // ------------------------------------------------------------
    console.log("\n--- PENGUJIAN LATIHAN INDIVIDU §11: RESOURCE PENGGUNA ---");

    // Bersihkan data pengguna uji
    await prisma.pengguna.deleteMany({
      where: { nim: { in: ["240160221057", "240160221999"] } },
    });

    // 22. GET /pengguna
    const r22 = await request(appLatihan, "GET", "/pengguna");
    assert(r22.statusCode === 200, "22. GET /pengguna mengembalikan 200 OK");

    // 23. GET /pengguna/:nim belum ada
    const r23 = await request(appLatihan, "GET", "/pengguna/240160221057");
    assert(r23.statusCode === 404, "23. GET /pengguna/:nim belum ada mengembalikan 404 Not Found");

    // 24. POST /pengguna invalid
    const r24 = await request(appLatihan, "POST", "/pengguna", {
      nim: "",
      nama: "",
      email: "invalid-email",
      role: "",
    });
    assert(r24.statusCode === 400, "24. POST /pengguna invalid mengembalikan 400 Bad Request");
    assert(Array.isArray(r24.body?.details), "    Menyertakan array details kesalahan validasi");

    // 25. POST /pengguna valid
    const r25 = await request(appLatihan, "POST", "/pengguna", {
      nim: "240160221057",
      nama: "Sarah Azkiya",
      email: "sarah.azkiya@mail.com",
      role: "mahasiswa",
    });
    assert(r25.statusCode === 201, "25. POST /pengguna valid mengembalikan 201 Created");
    assert(r25.body?.data?.nim === "240160221057", "    Pengguna tersimpan dengan NIM 240160221057");

    // 26. POST /pengguna duplicate
    const r26 = await request(appLatihan, "POST", "/pengguna", {
      nim: "240160221057",
      nama: "Sarah Azkiya Duplicate",
      email: "sarah.dup@mail.com",
      role: "mahasiswa",
    });
    assert(r26.statusCode === 409, "26. POST /pengguna duplicate mengembalikan 409 Conflict");

    // 27. GET /pengguna/:nim ditemukan
    const r27 = await request(appLatihan, "GET", "/pengguna/240160221057");
    assert(r27.statusCode === 200, "27. GET /pengguna/:nim ditemukan mengembalikan 200 OK");

    // 28. DELETE /pengguna/:nim valid
    const r28 = await request(appLatihan, "DELETE", "/pengguna/240160221057");
    assert(r28.statusCode === 204, "28. DELETE /pengguna/:nim valid mengembalikan 204 No Content");
    assert(!r28.body, "    Respons 204 tidak memiliki response body");

    // 29. DELETE /pengguna/:nim tidak ditemukan
    const r29 = await request(appLatihan, "DELETE", "/pengguna/240160221057");
    assert(r29.statusCode === 404, "29. DELETE /pengguna/:nim tidak ditemukan mengembalikan 404 Not Found");

    // 30. GET /pengguna/:nim setelah dihapus
    const r30 = await request(appLatihan, "GET", "/pengguna/240160221057");
    assert(r30.statusCode === 404, "30. GET /pengguna/:nim setelah dihapus mengembalikan 404 Not Found");

    console.log("\n============================================================");
    console.log(`  HASIL PENGUJIAN AKHIR: ${passed} lolos, ${failed} gagal.`);
    console.log(`  Persentase Keberhasilan: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
    console.log("============================================================\n");
  } finally {
    await prisma.$disconnect();
  }

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});

