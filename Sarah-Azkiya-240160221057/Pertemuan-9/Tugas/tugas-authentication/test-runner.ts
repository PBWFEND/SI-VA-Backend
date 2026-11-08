/**
 * Test Runner untuk Tugas Authentication (Pertemuan 9)
 * Mahasiswa: Sarah Azkiya (NIM: 240160221057)
 */

import { app } from "./app.ts";
import { prisma } from "./client.ts";

async function request(
  method: string,
  url: string,
  body?: any
): Promise<{ statusCode: number; body: any; success: boolean }> {
  return new Promise((resolve, reject) => {
    let resolved = false;

    const req: any = {
      method,
      url,
      path: url.split("?")[0],
      headers: {
        "content-type": "application/json",
      },
      query: {},
      params: {},
      body: body ?? {},
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
      end(data?: any) {
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
  console.log("============================================================");
  console.log("  PENGUJIAN TUGAS AUTHENTICATION — SARAH AZKIYA (240160221057)");
  console.log("  SISTEM INFORMASI PERPUSTAKAAN (REGISTER, LOGIN, SCRYPT)");
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

  const testEmail = "sarah.auth.tugas@example.test";
  const testNim = "240160221057";
  const testPassword = "password-kuat-123";

  try {
    // 1. Root & Health Check
    const r1 = await request("GET", "/");
    assert(r1.statusCode === 200, "1. GET / mengembalikan 200 OK");

    const r2 = await request("GET", "/api/health");
    assert(r2.statusCode === 200, "2. GET /api/health mengembalikan 200 OK");

    // Bersihkan pengguna uji lama
    await prisma.pengguna.deleteMany({
      where: {
        OR: [{ email: testEmail }, { nim: testNim }],
      },
    });

    // 3. Register valid (201)
    const r3 = await request("POST", "/auth/register", {
      nama: "Sarah Azkiya",
      nim: testNim,
      email: testEmail,
      password: testPassword,
    });
    assert(r3.statusCode === 201, "3. POST /auth/register valid mengembalikan 201 Created");
    assert(r3.body?.data?.email === testEmail, "   Email terdaftar sesuai");
    assert(r3.body?.data?.nim === testNim, "   NIM terdaftar sesuai");
    assert(!("password" in (r3.body?.data ?? {})), "   Response register TIDAK membocorkan field 'password'");
    assert(!("passwordHash" in (r3.body?.data ?? {})), "   Response register TIDAK membocorkan field 'passwordHash'");

    // 4. Register field kosong (400)
    const r4 = await request("POST", "/auth/register", {
      nama: "",
      nim: "240160221099",
      email: "email@example.test",
      password: "password-kuat-123",
    });
    assert(r4.statusCode === 400, "4. POST /auth/register nama kosong mengembalikan 400 Bad Request");

    // 5. Register NIM invalid (400)
    const r5 = await request("POST", "/auth/register", {
      nama: "Nama Valid",
      nim: "abc",
      email: "email@example.test",
      password: "password-kuat-123",
    });
    assert(r5.statusCode === 400, "5. POST /auth/register NIM invalid mengembalikan 400 Bad Request");

    // 6. Register Email invalid (400)
    const r6 = await request("POST", "/auth/register", {
      nama: "Nama Valid",
      nim: "240160221099",
      email: "bukan-email",
      password: "password-kuat-123",
    });
    assert(r6.statusCode === 400, "6. POST /auth/register email invalid mengembalikan 400 Bad Request");

    // 7. Register Password < 8 karakter (400)
    const r7 = await request("POST", "/auth/register", {
      nama: "Nama Valid",
      nim: "240160221099",
      email: "email2@example.test",
      password: "pendek",
    });
    assert(r7.statusCode === 400, "7. POST /auth/register password < 8 karakter mengembalikan 400 Bad Request");

    // 8. Register Duplicate Email (409)
    const r8 = await request("POST", "/auth/register", {
      nama: "Nama Kloning",
      nim: "240160221099",
      email: testEmail,
      password: "password-kuat-123",
    });
    assert(r8.statusCode === 409, "8. POST /auth/register email duplikat mengembalikan 409 Conflict");

    // 9. Register Duplicate NIM (409)
    const r9 = await request("POST", "/auth/register", {
      nama: "Nama Kloning 2",
      nim: testNim,
      email: "unique@example.test",
      password: "password-kuat-123",
    });
    assert(r9.statusCode === 409, "9. POST /auth/register NIM duplikat mengembalikan 409 Conflict");

    // 10. Login Benar (200)
    const r10 = await request("POST", "/auth/login", {
      email: testEmail,
      password: testPassword,
    });
    assert(r10.statusCode === 200, "10. POST /auth/login kredensial benar mengembalikan 200 OK");
    assert(r10.body?.data?.email === testEmail, "    Profil publik pengguna dikembalikan");
    assert(!("password" in (r10.body?.data ?? {})), "    Response login TIDAK membocorkan field 'password'");
    assert(!("passwordHash" in (r10.body?.data ?? {})), "    Response login TIDAK membocorkan field 'passwordHash'");
    assert(!("token" in (r10.body ?? {})) && !("jwt" in (r10.body ?? {})), "    TIDAK menerbitkan JWT / token (sesuai scope P9)");

    // 11. Login Password Salah (401)
    const r11 = await request("POST", "/auth/login", {
      email: testEmail,
      password: "password-salah-total",
    });
    assert(r11.statusCode === 401, "11. POST /auth/login password salah mengembalikan 401 Unauthorized");

    // 12. Login Email Tidak Terdaftar (401)
    const r12 = await request("POST", "/auth/login", {
      email: "gaib@example.test",
      password: testPassword,
    });
    assert(r12.statusCode === 401, "12. POST /auth/login email tidak terdaftar mengembalikan 401 Unauthorized");
    assert(r11.body?.message === r12.body?.message, "    Pesan error password salah dan email tidak terdaftar seragam (generik)");

    // 13. Login Tipe Field Salah (400)
    const r13 = await request("POST", "/auth/login", {
      email: "",
      password: 12345,
    });
    assert(r13.statusCode === 400, "13. POST /auth/login tipe field salah mengembalikan 400 Bad Request");

    // 14. Keamanan Penyimpanan Database
    const dbRecord = await prisma.pengguna.findUnique({
      where: { email: testEmail },
    });
    assert(dbRecord !== null, "14. Akun tersimpan di database SQLite");
    assert(typeof dbRecord?.passwordHash === "string" && dbRecord.passwordHash.startsWith("scrypt$"), "    Format passwordHash scrypt$salt$derivedKey");
    assert(dbRecord?.passwordHash !== testPassword, "    Plaintext password TIDAK tersimpan di database");

    // 15. Endpoint Acak (404)
    const r15 = await request("GET", "/endpoint-acak-404");
    assert(r15.statusCode === 404, "15. Endpoint acak mengembalikan 404 Not Found");

    // Cleanup pengguna uji
    await prisma.pengguna.deleteMany({
      where: { email: testEmail },
    });

    console.log("\n============================================================");
    console.log(`  HASIL AKHIR PENGUJIAN TUGAS AUTHENTICATION: ${passed} lolos, ${failed} gagal.`);
    console.log(`  Persentase Keberhasilan: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
    console.log("============================================================\n");
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

