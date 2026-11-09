import { app } from "./app.ts";
import { prisma } from "./client.ts";

interface MockResponse {
  statusCode: number;
  body: any;
  success: boolean;
}

function request(method: string, url: string, body?: any): Promise<MockResponse> {
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
      app(req, res, (err: any) => {
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

async function runTests() {
  console.log("=== MEMULAI TEST SUITE TUGAS 4 (RESOURCE BUKU) ===");
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
    // 0. Bersihkan data buku uji sebelumnya
    await prisma.buku.deleteMany({
      where: {
        judul: {
          in: [
            "Struktur Data dan Algoritma",
            "Pemrograman TypeScript Lanjut",
            "Buku Uji Coba",
          ],
        },
      },
    });

    // 1. GET / — Root Endpoint Informasi
    const resRoot = await request("GET", "/");
    assert(resRoot.statusCode === 200, "1. GET / mengembalikan status 200");
    assert(resRoot.body?.project?.includes("Tugas 4"), "   Menampilkan identitas proyek Tugas 4");

    // 2. GET /api/health — Pemeriksaan Koneksi Database
    const resHealth = await request("GET", "/api/health");
    assert(resHealth.statusCode === 200, "2. GET /api/health mengembalikan status 200");
    assert(resHealth.body?.success === true, "   Database SQLite terhubung dan query berhasil");

    // 3. GET /buku — Mengambil daftar buku
    const resGetAllInit = await request("GET", "/buku");
    assert(resGetAllInit.statusCode === 200, "3. GET /buku mengembalikan status 200");
    assert(Array.isArray(resGetAllInit.body?.data), "   Data yang dikembalikan berupa array");

    // 4. GET /buku/:id — Buku tidak ada (404)
    const resGetNotFound = await request("GET", "/buku/999999");
    assert(resGetNotFound.statusCode === 404, "4. GET /buku/:id tidak ditemukan mengembalikan status 404");
    assert(resGetNotFound.body?.success === false, "   Respons memiliki success: false");

    // 5. GET /buku/:id — Parameter ID invalid bukan angka (400)
    const resGetBadId = await request("GET", "/buku/abc");
    assert(resGetBadId.statusCode === 400, "5. GET /buku/:id dengan parameter bukan angka mengembalikan 400");

    // 6. POST /buku — Validasi gagal (data kosong / tidak valid)
    const resPostInvalid = await request("POST", "/buku", {
      judul: "",
      penulis: "",
      tahun: 900,
      stok: -5,
    });
    assert(resPostInvalid.statusCode === 400, "6. POST /buku dengan data tidak valid mengembalikan status 400");
    assert(Array.isArray(resPostInvalid.body?.details), "   Terdapat daftar detail kesalahan validasi");
    assert(resPostInvalid.body.details.length >= 4, "   Seluruh 4 aturan validasi terdeteksi");

    // 7. POST /buku — Data valid
    const resPostValid = await request("POST", "/buku", {
      judul: "Struktur Data dan Algoritma",
      penulis: "Sarah Azkiya",
      tahun: 2024,
      stok: 10,
    });
    assert(resPostValid.statusCode === 201, "7. POST /buku valid mengembalikan status 201");
    assert(resPostValid.body?.success === true, "   Respons memiliki success: true");
    const createdId = resPostValid.body?.data?.id;
    assert(typeof createdId === "number" && createdId > 0, "   Buku tersimpan dengan ID numerik auto-increment");

    // 8. GET /buku/:id — Ambil detail buku yang baru dibuat
    const resGetDetail = await request("GET", `/buku/${createdId}`);
    assert(resGetDetail.statusCode === 200, "8. GET /buku/:id mengembalikan status 200");
    assert(resGetDetail.body?.data?.judul === "Struktur Data dan Algoritma", "   Judul sesuai dengan data tersimpan");
    assert(resGetDetail.body?.data?.penulis === "Sarah Azkiya", "   Penulis sesuai dengan data tersimpan");
    assert(resGetDetail.body?.data?.stok === 10, "   Stok awal bernilai 10");

    // 9. POST /buku ke-2 untuk pengujian query filter
    const resPost2 = await request("POST", "/buku", {
      judul: "Pemrograman TypeScript Lanjut",
      penulis: "Sarah Azkiya",
      tahun: 2023,
      stok: 5,
    });
    const createdId2 = resPost2.body?.data?.id;
    assert(resPost2.statusCode === 201, "9. POST /buku kedua berhasil dibuat");

    // 10. GET /buku dengan Filter Query (?penulis=Sarah &tahun=2024)
    const resFilter = await request("GET", "/buku?penulis=Sarah&tahun=2024");
    assert(resFilter.statusCode === 200, "10. GET /buku dengan filter query mengembalikan status 200");
    const filteredItems = resFilter.body?.data;
    assert(Array.isArray(filteredItems) && filteredItems.some((b: any) => b.id === createdId), "    Hasil filter memuat buku tahun 2024");

    // 11. PATCH /buku/:id — Perbarui data stok dan judul (200)
    const resPatch = await request("PATCH", `/buku/${createdId}`, {
      stok: 15,
      judul: "Struktur Data dan Algoritma (Edisi Revisi)",
    });
    assert(resPatch.statusCode === 200, "11. PATCH /buku/:id mengembalikan status 200");
    assert(resPatch.body?.data?.stok === 15, "    Stok berhasil diperbarui menjadi 15");
    assert(resPatch.body?.data?.judul === "Struktur Data dan Algoritma (Edisi Revisi)", "    Judul berhasil diperbarui");

    // 12. PATCH /buku/:id — Body kosong (400)
    const resPatchEmpty = await request("PATCH", `/buku/${createdId}`, {});
    assert(resPatchEmpty.statusCode === 400, "12. PATCH /buku/:id body kosong mengembalikan status 400");

    // 13. PATCH /buku/:id — Buku tidak ditemukan (404)
    const resPatch404 = await request("PATCH", "/buku/999999", { stok: 20 });
    assert(resPatch404.statusCode === 404, "13. PATCH /buku/:id tidak ditemukan mengembalikan status 404");

    // 14. DELETE /buku/:id — Hapus buku pertama (204)
    const resDelete = await request("DELETE", `/buku/${createdId}`);
    assert(resDelete.statusCode === 204, "14. DELETE /buku/:id berhasil mengembalikan status 204");

    // 15. DELETE /buku/:id — Hapus buku yang sudah dihapus (404)
    const resDelete404 = await request("DELETE", `/buku/${createdId}`);
    assert(resDelete404.statusCode === 404, "15. DELETE /buku/:id sudah dihapus mengembalikan status 404");

    // 16. GET /buku/:id — Verifikasi buku sudah benar-benar terhapus (404)
    const resVerifyDeleted = await request("GET", `/buku/${createdId}`);
    assert(resVerifyDeleted.statusCode === 404, "16. GET /buku/:id setelah dihapus mengembalikan status 404");

    // 17. Verifikasi persistensi database: buku kedua tetap ada di SQLite
    const resVerifyPersist = await request("GET", `/buku/${createdId2}`);
    assert(resVerifyPersist.statusCode === 200, "17. Persistensi: Buku kedua tetap tersimpan di SQLite database");

    // Bersihkan buku kedua
    await prisma.buku.delete({ where: { id: createdId2 } });

    console.log(`\n================================`);
    console.log(`Hasil Pengujian Tugas 4: ${passed} lolos, ${failed} gagal.`);
    console.log(`================================`);
  } finally {
    await prisma.$disconnect();
  }

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});

