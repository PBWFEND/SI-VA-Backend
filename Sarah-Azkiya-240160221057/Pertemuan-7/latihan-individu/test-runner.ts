import { app } from "./latihan.ts";
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
      headers: { host: "localhost:3009" },
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
  console.log("=== MEMULAI TEST SUITE LATIHAN INDIVIDU §11 (PERTEMUAN 7) ===");
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
    // 0. Bersihkan database dari data uji sebelumnya
    await prisma.pengguna.deleteMany({
      where: { nim: { in: ["240160221057", "240160221999", "240160221001"] } },
    });

    // 1. GET / — Root info
    const resRoot = await request("GET", "/");
    assert(resRoot.statusCode === 200, "1. GET / mengembalikan status 200");
    assert(resRoot.body?.nim === "240160221057", "   Menampilkan identitas mahasiswa Sarah Azkiya");

    // 2. TODO 1: ambilDaftarPengguna (GET /pengguna)
    const resGet1 = await request("GET", "/pengguna");
    assert(resGet1.statusCode === 200, "2. TODO 1: GET /pengguna mengembalikan status 200");
    assert(Array.isArray(resGet1.body?.data), "   Data pengguna berbentuk array");

    // 3. GET /pengguna/:nim — belum ada data (404)
    const resGetNotFound = await request("GET", "/pengguna/240160221057");
    assert(resGetNotFound.statusCode === 404, "3. GET /pengguna/:nim belum ada mengembalikan status 404");

    // 4. TODO 2 & 3: validasiPengguna & POST /pengguna dengan input invalid (400)
    const resPostInvalid = await request("POST", "/pengguna", {
      nim: "",
      nama: "",
      email: "invalid-email-format",
      role: "",
    });
    assert(resPostInvalid.statusCode === 400, "4. TODO 2 & 3: POST /pengguna dengan field invalid mengembalikan status 400");
    assert(Array.isArray(resPostInvalid.body?.details), "   Error validasi dikumpulkan dalam array details");
    assert(resPostInvalid.body.details.length >= 4, "   Seluruh 4 error validasi terdeteksi");

    // 5. TODO 2 & 3: buatPengguna & POST /pengguna data valid (201)
    const resPostValid = await request("POST", "/pengguna", {
      nim: "240160221057",
      nama: "Sarah Azkiya",
      email: "sarah.azkiya@mail.com",
      role: "mahasiswa",
    });
    assert(resPostValid.statusCode === 201, "5. TODO 2 & 3: POST /pengguna valid mengembalikan status 201");
    assert(resPostValid.body?.success === true, "   Respons memiliki success: true");
    assert(resPostValid.body?.data?.nim === "240160221057", "   Pengguna tersimpan dengan NIM 240160221057");

    // 6. POST /pengguna duplicate NIM (409)
    const resPostDup = await request("POST", "/pengguna", {
      nim: "240160221057",
      nama: "Sarah Azkiya Clone",
      email: "sarah.clone@mail.com",
      role: "mahasiswa",
    });
    assert(resPostDup.statusCode === 409, "6. POST /pengguna duplicate NIM mengembalikan status 409");

    // 7. TODO 1 dengan filter NIM (GET /pengguna?nim=240160221057)
    const resGetFiltered = await request("GET", "/pengguna?nim=240160221057");
    assert(resGetFiltered.statusCode === 200, "7. TODO 1: GET /pengguna?nim=... mengembalikan status 200");
    assert(resGetFiltered.body?.data?.length === 1, "   Filter berhasil mengembalikan 1 pengguna sesuai NIM");

    // 8. GET /pengguna/:nim — Ditemukan (200)
    const resGetDetail = await request("GET", "/pengguna/240160221057");
    assert(resGetDetail.statusCode === 200, "8. GET /pengguna/:nim mengembalikan status 200");
    assert(resGetDetail.body?.data?.nama === "Sarah Azkiya", "   Nama pengguna sesuai");

    // 9. TODO 4: DELETE /pengguna/:nim valid (204 No Content tanpa body)
    const resDelete = await request("DELETE", "/pengguna/240160221057");
    assert(resDelete.statusCode === 204, "9. TODO 4: DELETE /pengguna/:nim berhasil mengembalikan status 204");
    assert(!resDelete.body, "   Respons status 204 tidak memiliki response body");

    // 10. TODO 4: DELETE /pengguna/:nim tidak ditemukan (404)
    const resDelete404 = await request("DELETE", "/pengguna/240160221057");
    assert(resDelete404.statusCode === 404, "10. TODO 4: DELETE /pengguna/:nim tidak ditemukan mengembalikan status 404");

    // 11. GET /pengguna/:nim setelah dihapus (404)
    const resVerifyDeleted = await request("GET", "/pengguna/240160221057");
    assert(resVerifyDeleted.statusCode === 404, "11. GET /pengguna/:nim setelah dihapus mengembalikan status 404");

    // 12. Endpoint acak / tidak terdaftar (404)
    const resRandom = await request("GET", "/endpoint-acak-tidak-ada");
    assert(resRandom.statusCode === 404, "12. Endpoint acak mengembalikan status 404");

    console.log(`\n================================`);
    console.log(`Hasil Test Latihan Individu §11: ${passed} lolos, ${failed} gagal.`);
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

