/**
 * Test Runner untuk UTS Mini Project — Sarah Azkiya (NIM: 240160221057)
 * Menguji seluruh endpoint Buku, Anggota, Healthcheck, Status Code, dan Persistensi Database
 */

import { app } from "./app.ts";
import { prisma } from "./client.ts";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "./src/service/jwt.service.ts";

interface MockResponse {
  statusCode: number;
  body: any;
  success: boolean;
}

function request(
  method: string,
  url: string,
  body?: any,
  customHeaders?: Record<string, string>
): Promise<MockResponse> {
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
      host: "localhost:3008",
    };

    if (customHeaders) {
      for (const [k, v] of Object.entries(customHeaders)) {
        headers[k.toLowerCase()] = v;
      }
    }

    const req: any = {
      method,
      url,
      originalUrl: url,
      path: urlPath,
      headers,
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
  console.log("  PENGUJIAN UTS MINI PROJECT — SARAH AZKIYA (240160221057)");
  console.log("  SISTEM INFORMASI PERPUSTAKAAN (BUKU & ANGGOTA)");
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
    // 0. Bersihkan data uji sebelumnya
    await prisma.buku.deleteMany({
      where: {
        judul: {
          in: ["Buku UTS Sarah", "Buku UTS Cadangan"],
        },
      },
    });
    await prisma.anggota.deleteMany({
      where: {
        nim: { in: ["240160221057-UTS", "240160221999-UTS"] },
      },
    });

    // 1. GET / — Informasi status server API (200)
    const r1 = await request("GET", "/");
    assert(r1.statusCode === 200, "1. GET / mengembalikan 200 OK");
    assert(r1.body?.project === "Sistem Informasi Perpustakaan", "   Identitas proyek: Sistem Informasi Perpustakaan");

    // 2. GET /api/health — Pemeriksaan kesehatan API dan koneksi database (200)
    const r2 = await request("GET", "/api/health");
    assert(r2.statusCode === 200, "2. GET /api/health mengembalikan 200 OK");
    assert(r2.body?.message === "API dan database terhubung", "   Koneksi database SQLite aktif");

    // ============================================================
    // RESOURCE BUKU
    // ============================================================
    console.log("\n--- PENGUJIAN RESOURCE BUKU ---");

    // 3. GET /buku — Mengambil seluruh data buku (200)
    const r3 = await request("GET", "/buku");
    assert(r3.statusCode === 200, "3. GET /buku mengembalikan 200 OK");
    assert(Array.isArray(r3.body?.data), "   Data buku berupa array");

    // 4. GET /buku/:id — Parameter invalid bukan angka positif (400)
    const r4 = await request("GET", "/buku/abc");
    assert(r4.statusCode === 400, "4. GET /buku/abc mengembalikan 400 Bad Request");

    // 5. GET /buku/:id — Buku tidak ditemukan (404)
    const r5 = await request("GET", "/buku/999999");
    assert(r5.statusCode === 404, "5. GET /buku/999999 mengembalikan 404 Not Found");

    // 6. POST /buku — Validasi gagal judul kosong (400)
    const r6 = await request("POST", "/buku", {
      judul: "   ",
      penulis: "Sarah Azkiya",
      tahun: 2024,
      stok: 5,
    });
    assert(r6.statusCode === 400, "6. POST /buku judul kosong mengembalikan 400 Bad Request");

    // 7. POST /buku — Validasi gagal tahun < 1000 (400)
    const r7 = await request("POST", "/buku", {
      judul: "Buku UTS Sarah",
      penulis: "Sarah Azkiya",
      tahun: 500,
      stok: 5,
    });
    assert(r7.statusCode === 400, "7. POST /buku tahun invalid (< 1000) mengembalikan 400 Bad Request");

    // 8. POST /buku — Data valid (201)
    const r8 = await request("POST", "/buku", {
      judul: "Buku UTS Sarah",
      penulis: "Sarah Azkiya",
      tahun: 2024,
      stok: 12,
    });
    assert(r8.statusCode === 201, "8. POST /buku valid mengembalikan 201 Created");
    const bukuId = r8.body?.data?.id;
    assert(typeof bukuId === "number" && bukuId > 0, "   Buku dibuat dengan ID auto-increment");

    // 9. GET /buku/:id — Data ditemukan (200)
    const r9 = await request("GET", `/buku/${bukuId}`);
    assert(r9.statusCode === 200, "9. GET /buku/:id ditemukan mengembalikan 200 OK");
    assert(r9.body?.data?.judul === "Buku UTS Sarah", "   Judul sesuai data tersimpan");

    // 10. PATCH /buku/:id — Update data parsial (200)
    const r10 = await request("PATCH", `/buku/${bukuId}`, {
      stok: 20,
    });
    assert(r10.statusCode === 200, "10. PATCH /buku/:id valid mengembalikan 200 OK");
    assert(r10.body?.data?.stok === 20, "    Stok berhasil diperbarui menjadi 20");

    // 11. PATCH /buku/:id — Body kosong (400)
    const r11 = await request("PATCH", `/buku/${bukuId}`, {});
    assert(r11.statusCode === 400, "11. PATCH /buku/:id body kosong mengembalikan 400 Bad Request");

    // 12. PATCH /buku/:id — Mencoba ubah field 'id' (400)
    const r12 = await request("PATCH", `/buku/${bukuId}`, { id: 999 });
    assert(r12.statusCode === 400, "12. PATCH /buku/:id ubah id ditolak dengan 400 Bad Request");

    // 13. DELETE /buku/:id — Berhasil (204 No Content tanpa body)
    const r13 = await request("DELETE", `/buku/${bukuId}`);
    assert(r13.statusCode === 204, "13. DELETE /buku/:id valid mengembalikan 204 No Content");

    // 14. DELETE /buku/:id — Sudah dihapus (404)
    const r14 = await request("DELETE", `/buku/${bukuId}`);
    assert(r14.statusCode === 404, "14. DELETE /buku/:id sudah dihapus mengembalikan 404 Not Found");

    // ============================================================
    // RESOURCE ANGGOTA
    // ============================================================
    console.log("\n--- PENGUJIAN RESOURCE ANGGOTA ---");

    // 15. GET /anggota — Mengambil seluruh data anggota (200)
    const r15 = await request("GET", "/anggota");
    assert(r15.statusCode === 200, "15. GET /anggota mengembalikan 200 OK");
    assert(Array.isArray(r15.body?.data), "    Data anggota berupa array");

    // 16. POST /anggota — Validasi gagal field kosong (400)
    const r16 = await request("POST", "/anggota", {
      nama: "",
      nim: "",
      jurusan: "",
    });
    assert(r16.statusCode === 400, "16. POST /anggota field kosong mengembalikan 400 Bad Request");

    // 17. POST /anggota — Data valid (201)
    const r17 = await request("POST", "/anggota", {
      nama: "Sarah Azkiya",
      nim: "240160221057-UTS",
      jurusan: "Sistem Informasi",
    });
    assert(r17.statusCode === 201, "17. POST /anggota valid mengembalikan 201 Created");
    const anggotaId = r17.body?.data?.id;
    assert(typeof anggotaId === "number" && anggotaId > 0, "    Anggota dibuat dengan ID auto-increment");

    // 18. POST /anggota — Duplicate NIM (409 Conflict)
    const r18 = await request("POST", "/anggota", {
      nama: "Sarah Clone",
      nim: "240160221057-UTS",
      jurusan: "Sistem Informasi",
    });
    assert(r18.statusCode === 409, "18. POST /anggota duplicate NIM mengembalikan 409 Conflict");

    // 19. GET /anggota/:id — Ditemukan (200)
    const r19 = await request("GET", `/anggota/${anggotaId}`);
    assert(r19.statusCode === 200, "19. GET /anggota/:id ditemukan mengembalikan 200 OK");
    assert(r19.body?.data?.nama === "Sarah Azkiya", "    Nama anggota sesuai");

    // 20. PATCH /anggota/:id — Update jurusan (200)
    const r20 = await request("PATCH", `/anggota/${anggotaId}`, {
      jurusan: "Teknologi Informasi",
    });
    assert(r20.statusCode === 200, "20. PATCH /anggota/:id valid mengembalikan 200 OK");
    assert(r20.body?.data?.jurusan === "Teknologi Informasi", "    Jurusan berhasil diperbarui");

    // 21. DELETE /anggota/:id — Berhasil (204)
    const r21 = await request("DELETE", `/anggota/${anggotaId}`);
    assert(r21.statusCode === 204, "21. DELETE /anggota/:id valid mengembalikan 204 No Content");

    // 22. GET /anggota/:id — Setelah dihapus (404)
    const r22 = await request("GET", `/anggota/${anggotaId}`);
    assert(r22.statusCode === 404, "22. GET /anggota/:id setelah dihapus mengembalikan 404 Not Found");

    // 23. Endpoint acak (404)
    const r23 = await request("GET", "/endpoint-acak-404");
    assert(r23.statusCode === 404, "23. Endpoint acak mengembalikan 404 Not Found");

    // ============================================================
    // RESOURCE AUTHENTICATION (PERTEMUAN 9)
    // ============================================================
    console.log("\n--- PENGUJIAN RESOURCE AUTHENTICATION (PERTEMUAN 9) ---");

    const testNim = "240160221057";
    const testEmail = "sarah.auth@example.test";
    const testPassword = "password-kuat-123";

    // Bersihkan pengguna uji jika sisa pengujian sebelumnya masih ada
    await prisma.pengguna.deleteMany({
      where: {
        OR: [{ email: testEmail }, { nim: testNim }],
      },
    });

    // 24. POST /auth/register — Registrasi valid (201 Created)
    const r24 = await request("POST", "/auth/register", {
      nama: "Sarah Azkiya",
      nim: testNim,
      email: testEmail,
      password: testPassword,
    });
    assert(r24.statusCode === 201, "24. POST /auth/register valid mengembalikan 201 Created");
    assert(r24.body?.data?.email === testEmail, "    Email terdaftar sesuai");
    assert(r24.body?.data?.nim === testNim, "    NIM terdaftar sesuai");
    assert(!("password" in (r24.body?.data ?? {})), "    Response register TIDAK membocorkan field 'password'");
    assert(!("passwordHash" in (r24.body?.data ?? {})), "    Response register TIDAK membocorkan field 'passwordHash'");

    // 25. POST /auth/register — Field nama kosong (400)
    const r25 = await request("POST", "/auth/register", {
      nama: "",
      nim: "240160221099",
      email: "test.nama@example.test",
      password: "password-kuat-123",
    });
    assert(r25.statusCode === 400, "25. POST /auth/register nama kosong mengembalikan 400 Bad Request");

    // 26. POST /auth/register — Format NIM invalid (< 8 digit) (400)
    const r26 = await request("POST", "/auth/register", {
      nama: "Test NIM",
      nim: "123",
      email: "test.nim@example.test",
      password: "password-kuat-123",
    });
    assert(r26.statusCode === 400, "26. POST /auth/register NIM invalid (< 8 digit) mengembalikan 400 Bad Request");

    // 27. POST /auth/register — Format Email invalid (400)
    const r27 = await request("POST", "/auth/register", {
      nama: "Test Email",
      nim: "240160221098",
      email: "bukan-alamat-email",
      password: "password-kuat-123",
    });
    assert(r27.statusCode === 400, "27. POST /auth/register email invalid mengembalikan 400 Bad Request");

    // 28. POST /auth/register — Password terlalu pendek (< 8 karakter) (400)
    const r28 = await request("POST", "/auth/register", {
      nama: "Test Password",
      nim: "240160221097",
      email: "test.pass@example.test",
      password: "pendek",
    });
    assert(r28.statusCode === 400, "28. POST /auth/register password < 8 karakter mengembalikan 400 Bad Request");

    // 29. POST /auth/register — Duplikasi Email (409 Conflict)
    const r29 = await request("POST", "/auth/register", {
      nama: "Sarah Azkiya Clone",
      nim: "240160221088",
      email: testEmail,
      password: "password-baru-123",
    });
    assert(r29.statusCode === 409, "29. POST /auth/register email duplikat mengembalikan 409 Conflict");

    // 30. POST /auth/register — Duplikasi NIM (409 Conflict)
    const r30 = await request("POST", "/auth/register", {
      nama: "Sarah Azkiya Clone 2",
      nim: testNim,
      email: "sarah.other@example.test",
      password: "password-baru-123",
    });
    assert(r30.statusCode === 409, "30. POST /auth/register NIM duplikat mengembalikan 409 Conflict");

    // 31. POST /auth/login — Kredensial benar (200 OK)
    const r31 = await request("POST", "/auth/login", {
      email: testEmail,
      password: testPassword,
    });
    assert(r31.statusCode === 200, "31. POST /auth/login kredensial benar mengembalikan 200 OK");
    assert(
      r31.body?.data?.user?.email === testEmail || r31.body?.data?.email === testEmail,
      "    Profil publik pengguna dikembalikan"
    );
    assert(
      !("password" in (r31.body?.data?.user ?? r31.body?.data ?? {})),
      "    Response login TIDAK membocorkan field 'password'"
    );
    assert(
      !("passwordHash" in (r31.body?.data?.user ?? r31.body?.data ?? {})),
      "    Response login TIDAK membocorkan field 'passwordHash'"
    );
    assert(
      typeof r31.body?.data?.token === "string" && r31.body?.data?.token.length > 20,
      "    Menerbitkan JWT token valid pada properti data.token (Pertemuan 10)"
    );
    const mhsToken = r31.body?.data?.token;

    // 32. POST /auth/login — Password salah (401 Unauthorized)
    const r32 = await request("POST", "/auth/login", {
      email: testEmail,
      password: "password-salah-total",
    });
    assert(r32.statusCode === 401, "32. POST /auth/login password salah mengembalikan 401 Unauthorized");

    // 33. POST /auth/login — Email tidak terdaftar (401 Unauthorized dengan pesan generik)
    const r33 = await request("POST", "/auth/login", {
      email: "tidak-ada@example.test",
      password: testPassword,
    });
    assert(r33.statusCode === 401, "33. POST /auth/login email tidak terdaftar mengembalikan 401 Unauthorized");
    assert(r32.body?.message === r33.body?.message, "    Pesan error login salah password dan email tidak terdaftar sama (tidak membocorkan akun)");

    // 34. POST /auth/login — Tipe field salah / kosong (400 Bad Request)
    const r34 = await request("POST", "/auth/login", {
      email: "",
      password: 12345678,
    });
    assert(r34.statusCode === 400, "34. POST /auth/login tipe field salah mengembalikan 400 Bad Request");

    // 35. Pemeriksaan Integritas Keamanan Database
    const dbUser = await prisma.pengguna.findUnique({
      where: { email: testEmail },
    });
    assert(dbUser !== null, "35. Pengguna tersimpan di database SQLite");
    assert(typeof dbUser?.passwordHash === "string" && dbUser.passwordHash.startsWith("scrypt$"), "    Format passwordHash menggunakan scrypt$salt$derivedKey");
    assert(dbUser?.passwordHash !== testPassword, "    Password plaintext TIDAK tersimpan di database");

    // ============================================================
    // RESOURCE TERLINDUNGI & OTORISASI JWT (PERTEMUAN 10)
    // ============================================================
    console.log("\n--- PENGUJIAN JWT & AUTHORIZATION (PERTEMUAN 10) ---");

    // 36. POST /auth/register — Mencoba memilih role: 'staf' ditolak (400 Bad Request)
    const r36 = await request("POST", "/auth/register", {
      nama: "Sarah Trying Staf",
      nim: "240160221077",
      email: "sarah.hacker@example.test",
      password: "password-kuat-123",
      role: "staf",
    });
    assert(r36.statusCode === 400, "36. POST /auth/register dengan 'role': 'staf' ditolak dengan 400 Bad Request");

    // 37. GET /protected/me — Tanpa header Authorization (401 Unauthorized)
    const r37 = await request("GET", "/protected/me");
    assert(r37.statusCode === 401, "37. GET /protected/me tanpa token mengembalikan 401 Unauthorized");

    // 38. GET /protected/me — Format header bukan 'Bearer <token>' (401 Unauthorized)
    const r38 = await request("GET", "/protected/me", undefined, {
      authorization: `Basic ${mhsToken}`,
    });
    assert(r38.statusCode === 401, "38. GET /protected/me format header salah mengembalikan 401 Unauthorized");

    // 39. GET /protected/me — Token rusak / invalid (401 Unauthorized)
    const r39 = await request("GET", "/protected/me", undefined, {
      authorization: "Bearer token.rusak.acak",
    });
    assert(r39.statusCode === 401, "39. GET /protected/me token rusak mengembalikan 401 Unauthorized");

    // 40. GET /protected/me — Token diubah satu karakter (401 Unauthorized)
    const tamperedToken = mhsToken.slice(0, -1) + (mhsToken.endsWith("a") ? "b" : "a");
    const r40 = await request("GET", "/protected/me", undefined, {
      authorization: `Bearer ${tamperedToken}`,
    });
    assert(r40.statusCode === 401, "40. GET /protected/me token diubah 1 karakter mengembalikan 401 Unauthorized");

    // 41. GET /protected/me — Token kedaluwarsa (401 Unauthorized)
    const expiredToken = jwt.sign(
      { sub: 999, nama: "User Expired", nim: "12345678", email: "exp@test.com", role: "mahasiswa" },
      getJwtSecret(),
      { expiresIn: 0 }
    );
    const r41 = await request("GET", "/protected/me", undefined, {
      authorization: `Bearer ${expiredToken}`,
    });
    assert(r41.statusCode === 401, "41. GET /protected/me token expired mengembalikan 401 Unauthorized");

    // 42. GET /protected/me — Token valid mahasiswa (200 OK)
    const r42 = await request("GET", "/protected/me", undefined, {
      authorization: `Bearer ${mhsToken}`,
    });
    assert(r42.statusCode === 200, "42. GET /protected/me dengan token valid mengembalikan 200 OK");
    assert(r42.body?.data?.email === testEmail, "    Email profil sesuai");
    assert(r42.body?.data?.role === "mahasiswa", "    Role pengguna teridentifikasi sebagai 'mahasiswa'");
    assert(!("password" in (r42.body?.data ?? {})), "    Response profil TIDAK mengandung field 'password'");
    assert(!("passwordHash" in (r42.body?.data ?? {})), "    Response profil TIDAK mengandung field 'passwordHash'");

    // 43. GET /protected/peminjaman — Mahasiswa mengakses endpoint staf (403 Forbidden)
    const r43 = await request("GET", "/protected/peminjaman", undefined, {
      authorization: `Bearer ${mhsToken}`,
    });
    assert(r43.statusCode === 403, "43. GET /protected/peminjaman dengan token mahasiswa ditolak 403 Forbidden");

    // 44. GET /protected/pengguna — Mahasiswa mengakses data pengguna staf (403 Forbidden)
    const r44 = await request("GET", "/protected/pengguna", undefined, {
      authorization: `Bearer ${mhsToken}`,
    });
    assert(r44.statusCode === 403, "44. GET /protected/pengguna dengan token mahasiswa ditolak 403 Forbidden");

    // 45. Provisioning akun 'staf' secara terpercaya pada database SQLite via Prisma
    const stafEmail = "staf.perpus@example.test";
    const stafNim = "240160229988";
    const stafPassword = "password-staf-123";

    await prisma.pengguna.deleteMany({
      where: { OR: [{ email: stafEmail }, { nim: stafNim }] },
    });

    const stafPasswordHash = dbUser!.passwordHash; // reuse valid scrypt hash
    await prisma.pengguna.create({
      data: {
        nama: "Staf Perpustakaan Sarah",
        nim: stafNim,
        email: stafEmail,
        passwordHash: stafPasswordHash,
        role: "staf",
      },
    });

    // Login sebagai staf
    const loginStaf = await request("POST", "/auth/login", {
      email: stafEmail,
      password: testPassword,
    });
    assert(loginStaf.statusCode === 200, "45. Login staf berhasil mengembalikan 200 OK");
    const stafToken = loginStaf.body?.data?.token;
    assert(typeof stafToken === "string" && stafToken.length > 20, "    Token staf berhasil diterbitkan");

    // 46. GET /protected/peminjaman — Staf mengakses endpoint khusus staf (200 OK)
    const r46 = await request("GET", "/protected/peminjaman", undefined, {
      authorization: `Bearer ${stafToken}`,
    });
    assert(r46.statusCode === 200, "46. GET /protected/peminjaman dengan token staf mengembalikan 200 OK");
    assert(Array.isArray(r46.body?.data), "    Data peminjaman buku perpustakaan dikembalikan berupa array");

    // 47. GET /protected/pengguna — Staf mengakses daftar pengguna (200 OK)
    const r47 = await request("GET", "/protected/pengguna", undefined, {
      authorization: `Bearer ${stafToken}`,
    });
    assert(r47.statusCode === 200, "47. GET /protected/pengguna dengan token staf mengembalikan 200 OK");
    assert(Array.isArray(r47.body?.data), "    Daftar pengguna perpustakaan dikembalikan");

    // Cleanup pengguna uji
    await prisma.pengguna.deleteMany({
      where: { OR: [{ email: testEmail }, { email: stafEmail }] },
    });

    console.log("\n============================================================");
    console.log(`  HASIL AKHIR PENGUJIAN UTS: ${passed} lolos, ${failed} gagal.`);
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
