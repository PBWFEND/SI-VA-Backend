/**
 * Test Runner untuk Tugas Output Pembelajaran Pertemuan 10 (§22)
 * Mahasiswa: Sarah Azkiya (NIM: 240160221057)
 */

import { app } from "./app.ts";
import { prisma } from "./client.ts";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "./src/service/jwt.service.ts";

async function request(
  method: string,
  url: string,
  body?: any,
  customHeaders?: Record<string, string>
): Promise<{ statusCode: number; body: any; success: boolean }> {
  return new Promise((resolve, reject) => {
    let resolved = false;

    const [urlPath, queryString] = url.split("?");
    const query: Record<string, string> = {};
    if (queryString) {
      new URLSearchParams(queryString).forEach((val, key) => {
        query[key] = val;
      });
    }

    const headers: Record<string, string> = {
      host: "localhost:3010",
      "content-type": "application/json",
    };

    if (customHeaders) {
      for (const [k, v] of Object.entries(customHeaders)) {
        headers[k.toLowerCase()] = v;
      }
    }

    const req: any = {
      method,
      url,
      path: urlPath,
      headers,
      query,
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
  console.log("  PENGUJIAN TUGAS PERTEMUAN 10 — SARAH AZKIYA (240160221057)");
  console.log("  SISTEM INFORMASI PERPUSTAKAAN (JWT & ROLE-BASED ACCESS)");
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

  const testEmail = "sarah.tugas.p10@example.test";
  const testNim = "240160221057";
  const testPassword = "password-kuat-123";

  const stafEmail = "staf.tugas.p10@example.test";
  const stafNim = "240160229988";

  try {
    // 1. Root & Health
    const r1 = await request("GET", "/");
    assert(r1.statusCode === 200, "1. GET / mengembalikan 200 OK");

    const r2 = await request("GET", "/api/health");
    assert(r2.statusCode === 200, "2. GET /api/health mengembalikan 200 OK");

    // Cleanup akun uji lama
    await prisma.pengguna.deleteMany({
      where: {
        OR: [{ email: testEmail }, { email: stafEmail }, { nim: testNim }, { nim: stafNim }],
      },
    });

    // 3. Register dengan role 'staf' ditolak (400)
    const r3 = await request("POST", "/auth/register", {
      nama: "Sarah Trying Staf",
      nim: testNim,
      email: testEmail,
      password: testPassword,
      role: "staf",
    });
    assert(r3.statusCode === 400, "3. POST /auth/register dengan 'role': 'staf' ditolak (400 Bad Request)");

    // 4. Register valid -> default role 'mahasiswa' (201)
    const r4 = await request("POST", "/auth/register", {
      nama: "Sarah Azkiya",
      nim: testNim,
      email: testEmail,
      password: testPassword,
    });
    assert(r4.statusCode === 201, "4. POST /auth/register valid mengembalikan 201 Created");
    assert(r4.body?.data?.role === "mahasiswa", "   Role otomatis ditetapkan sebagai 'mahasiswa'");

    // 5. Login kredensial benar -> mengembalikan token JWT (200)
    const r5 = await request("POST", "/auth/login", {
      email: testEmail,
      password: testPassword,
    });
    assert(r5.statusCode === 200, "5. POST /auth/login kredensial benar mengembalikan 200 OK");
    const mhsToken = r5.body?.data?.token;
    assert(typeof mhsToken === "string" && mhsToken.length > 20, "   Token JWT berhasil diterbitkan");

    // 6. Login password salah (401)
    const r6 = await request("POST", "/auth/login", {
      email: testEmail,
      password: "password-salah-total",
    });
    assert(r6.statusCode === 401, "6. POST /auth/login password salah mengembalikan 401 Unauthorized");

    // 7. GET /protected/me — Tanpa token (401)
    const r7 = await request("GET", "/protected/me");
    assert(r7.statusCode === 401, "7. GET /protected/me tanpa token mengembalikan 401 Unauthorized");

    // 8. GET /protected/me — Format header salah (401)
    const r8 = await request("GET", "/protected/me", undefined, {
      authorization: `Token ${mhsToken}`,
    });
    assert(r8.statusCode === 401, "8. GET /protected/me format header bukan Bearer mengembalikan 401 Unauthorized");

    // 9. GET /protected/me — Token rusak (401)
    const r9 = await request("GET", "/protected/me", undefined, {
      authorization: "Bearer token.rusak.acak",
    });
    assert(r9.statusCode === 401, "9. GET /protected/me token rusak mengembalikan 401 Unauthorized");

    // 10. GET /protected/me — Token diubah satu karakter (401)
    const tampered = mhsToken.slice(0, -1) + (mhsToken.endsWith("a") ? "b" : "a");
    const r10 = await request("GET", "/protected/me", undefined, {
      authorization: `Bearer ${tampered}`,
    });
    assert(r10.statusCode === 401, "10. GET /protected/me token tampered mengembalikan 401 Unauthorized");

    // 11. GET /protected/me — Token expired (401)
    const expiredToken = jwt.sign(
      { sub: 999, nama: "User Expired", nim: "12345678", email: "exp@test.com", role: "mahasiswa" },
      getJwtSecret(),
      { expiresIn: 0 }
    );
    const r11 = await request("GET", "/protected/me", undefined, {
      authorization: `Bearer ${expiredToken}`,
    });
    assert(r11.statusCode === 401, "11. GET /protected/me token expired mengembalikan 401 Unauthorized");

    // 12. GET /protected/me — Token valid mahasiswa (200)
    const r12 = await request("GET", "/protected/me", undefined, {
      authorization: `Bearer ${mhsToken}`,
    });
    assert(r12.statusCode === 200, "12. GET /protected/me dengan token valid mengembalikan 200 OK");
    assert(r12.body?.data?.role === "mahasiswa", "    Profil memuat role 'mahasiswa'");
    assert(!("password" in (r12.body?.data ?? {})), "    Response bebas dari field 'password'");

    // 13. GET /protected/peminjaman — Token mahasiswa mengakses endpoint staf (403)
    const r13 = await request("GET", "/protected/peminjaman", undefined, {
      authorization: `Bearer ${mhsToken}`,
    });
    assert(r13.statusCode === 403, "13. GET /protected/peminjaman token mahasiswa ditolak (403 Forbidden)");

    // 14. Provisioning akun staf secara terpercaya di database SQLite
    const mhsRecord = await prisma.pengguna.findUnique({ where: { email: testEmail } });
    await prisma.pengguna.create({
      data: {
        nama: "Staf Perpustakaan Resmi",
        nim: stafNim,
        email: stafEmail,
        passwordHash: mhsRecord!.passwordHash,
        role: "staf",
      },
    });

    // Login staf
    const loginStaf = await request("POST", "/auth/login", {
      email: stafEmail,
      password: testPassword,
    });
    assert(loginStaf.statusCode === 200, "14. Login staf berhasil mengembalikan 200 OK");
    const stafToken = loginStaf.body?.data?.token;

    // 15. GET /protected/peminjaman — Token staf mengakses endpoint staf (200)
    const r15 = await request("GET", "/protected/peminjaman", undefined, {
      authorization: `Bearer ${stafToken}`,
    });
    assert(r15.statusCode === 200, "15. GET /protected/peminjaman token staf diizinkan (200 OK)");
    assert(Array.isArray(r15.body?.data), "    Data transaksi peminjaman dikembalikan");

    // 16. GET /protected/pengguna — Token staf mengakses daftar pengguna (200)
    const r16 = await request("GET", "/protected/pengguna", undefined, {
      authorization: `Bearer ${stafToken}`,
    });
    assert(r16.statusCode === 200, "16. GET /protected/pengguna token staf diizinkan (200 OK)");

    // Cleanup data uji
    await prisma.pengguna.deleteMany({
      where: {
        OR: [{ email: testEmail }, { email: stafEmail }],
      },
    });

    console.log("\n============================================================");
    console.log(`  HASIL AKHIR PENGUJIAN TUGAS P10: ${passed} lolos, ${failed} gagal.`);
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

