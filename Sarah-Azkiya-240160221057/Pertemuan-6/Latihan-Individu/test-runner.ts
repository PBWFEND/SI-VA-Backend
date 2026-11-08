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

    const req: any = {
      method,
      url,
      originalUrl: url,
      headers: { host: "localhost:3009" },
      body: body,
      params: {},
      query: {},
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
  console.log("=== MEMULAI TEST SUITE LATIHAN INDIVIDU ===");
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
      where: { nim: { in: ["240160221057", "240160221999", "240160221000"] } },
    });

    // 1. GET /pengguna — Ambil seluruh data pengguna (200)
    const res1 = await request("GET", "/pengguna");
    assert(res1.statusCode === 200, "1. GET /pengguna mengembalikan status 200");
    assert(res1.success === true, "   Respons memiliki success: true");

    // 2. GET /pengguna/:nim — Belum ada data (404)
    const res2 = await request("GET", "/pengguna/240160221057");
    assert(res2.statusCode === 404, "2. GET /pengguna/:nim mengembalikan 404 jika belum terdaftar");
    assert(res2.success === false, "   Respons memiliki success: false");

    // 3. POST /pengguna — Validasi gagal (data kosong / tidak valid)
    const res3a = await request("POST", "/pengguna", { nim: "", nama: "", email: "bukan-email", role: "" });
    assert(res3a.statusCode === 400, "3. POST /pengguna dengan field kosong mengembalikan status 400");
    assert(res3a.success === false, "   Respons memiliki success: false");
    assert(Array.isArray(res3a.body?.details) && res3a.body.details.length >= 4, "   Menampilkan daftar detail error validasi");

    // 4. POST /pengguna — Valid (Sarah Azkiya)
    const res4 = await request("POST", "/pengguna", {
      nim: "240160221057",
      nama: "Sarah Azkiya",
      email: "sarah@mail.com",
      role: "mahasiswa",
    });
    assert(res4.statusCode === 201, "4. POST /pengguna valid mengembalikan status 201");
    assert(res4.success === true, "   Respons memiliki success: true");
    assert(res4.body?.data?.nim === "240160221057", "   Data yang dibuat memiliki NIM 240160221057");
    assert(res4.body?.data?.nama === "Sarah Azkiya", "   Data yang dibuat memiliki nama Sarah Azkiya");

    // 5. POST /pengguna — Duplikasi NIM (409)
    const res5 = await request("POST", "/pengguna", {
      nim: "240160221057",
      nama: "Sarah Azkiya 2",
      email: "sarah_lain@mail.com",
      role: "mahasiswa",
    });
    assert(res5.statusCode === 409, "5. POST /pengguna dengan NIM duplikat mengembalikan status 409");

    // 6. GET /pengguna/:nim — Ditemukan (200)
    const res6 = await request("GET", "/pengguna/240160221057");
    assert(res6.statusCode === 200, "6. GET /pengguna/:nim mengembalikan status 200 ketika ditemukan");
    assert(res6.body?.data?.nama === "Sarah Azkiya", "   Nama pengguna sesuai dengan data");
    assert(res6.body?.data?.role === "mahasiswa", "   Role pengguna awal adalah mahasiswa");

    // 7. PATCH /pengguna/:nim — Ubah nama, email, role (200)
    const res7 = await request("PATCH", "/pengguna/240160221057", {
      nama: "Sarah Azkiya Pustakawan",
      email: "sarah.azkiya@perpustakaan.ac.id",
      role: "pustakawan",
    });
    assert(res7.statusCode === 200, "7. PATCH /pengguna/:nim mengembalikan status 200");
    assert(res7.body?.data?.nama === "Sarah Azkiya Pustakawan", "   Nama berhasil diperbarui");
    assert(res7.body?.data?.email === "sarah.azkiya@perpustakaan.ac.id", "   Email berhasil diperbarui");
    assert(res7.body?.data?.role === "pustakawan", "   Role berhasil diperbarui menjadi pustakawan");

    // 8. PATCH /pengguna/:nim — Body kosong (400)
    const res8 = await request("PATCH", "/pengguna/240160221057", {});
    assert(res8.statusCode === 400, "8. PATCH /pengguna/:nim tanpa data mengembalikan status 400");

    // 9. PATCH /pengguna/:nim — Format email salah (400)
    const res9 = await request("PATCH", "/pengguna/240160221057", { email: "email_salah" });
    assert(res9.statusCode === 400, "9. PATCH /pengguna/:nim format email salah mengembalikan status 400");

    // 10. PATCH /pengguna/:nim — Pengguna tidak ada (404)
    const res10 = await request("PATCH", "/pengguna/240160221999", { role: "dosen" });
    assert(res10.statusCode === 404, "10. PATCH /pengguna/:nim data tidak ada mengembalikan status 404");

    // 11. DELETE /pengguna/:nim — Berhasil (204)
    const res11 = await request("DELETE", "/pengguna/240160221057");
    assert(res11.statusCode === 204, "11. DELETE /pengguna/:nim berhasil mengembalikan status 204");

    // 12. DELETE /pengguna/:nim — Sudah terhapus (404)
    const res12 = await request("DELETE", "/pengguna/240160221057");
    assert(res12.statusCode === 404, "12. DELETE /pengguna/:nim data yang sudah dihapus mengembalikan status 404");

    // 13. GET /pengguna/:nim — Verifikasi terhapus (404)
    const res13 = await request("GET", "/pengguna/240160221057");
    assert(res13.statusCode === 404, "13. GET /pengguna/:nim setelah dihapus mengembalikan status 404");

    console.log(`\n================================`);
    console.log(`Hasil: ${passed} uji lolos, ${failed} uji gagal.`);
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
