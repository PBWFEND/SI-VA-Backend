/**
 * Test Runner untuk Latihan Individu Pertemuan 9 (§19)
 * Mahasiswa: Sarah Azkiya (NIM: 240160221057)
 * 
 * Menguji 12 Poin Esensial Sesuai Instruksi Resmi:
 * 1. Register valid (201)
 * 2. Register invalid (400)
 * 3. Register duplicate email (409)
 * 4. Register duplicate NIM (409)
 * 5. Login benar (200)
 * 6. Login password salah (401)
 * 7. Login email tidak terdaftar (401)
 * 8. Login tipe field salah (400)
 * 9. Response register tidak mengandung password / passwordHash
 * 10. Response login tidak mengandung password / passwordHash
 * 11. Database menyimpan passwordHash, bukan plaintext
 * 12. Format passwordHash adalah scrypt$salt$derivedKey
 */

import {
  daftarPengguna,
  loginPengguna,
  validasiNim,
  ValidationError,
  ConflictError,
  UnauthorizedError,
  prisma,
} from "./latihan.ts";

async function main() {
  console.log("============================================================");
  console.log("  PENGUJIAN LATIHAN INDIVIDU PERTEMUAN 9 — SARAH AZKIYA");
  console.log("  NIM: 240160221057 | AUTHENTICATION & PASSWORD HASHING");
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

  const testEmail = `sarah.latihan.${Date.now()}@example.test`;
  const testNim = `24016022${Math.floor(1000 + Math.random() * 9000)}`;
  const testPassword = "password-sarah-123";

  try {
    // ------------------------------------------------------------
    // 1. Register valid (201)
    // ------------------------------------------------------------
    const regResult = await daftarPengguna({
      nama: "Sarah Azkiya",
      nim: testNim,
      email: testEmail,
      password: testPassword,
    });
    assert(
      regResult.id > 0 && regResult.email === testEmail && regResult.nim === testNim,
      "1. Register valid berhasil menyimpan akun baru"
    );

    // ------------------------------------------------------------
    // 2. Register invalid (400 ValidationError)
    // ------------------------------------------------------------
    let err2: any = null;
    try {
      await daftarPengguna({
        nama: "",
        nim: "123", // NIM terlalu pendek
        email: "bukan-email",
        password: "pendek", // < 8 karakter
      });
    } catch (e) {
      err2 = e;
    }
    assert(
      err2 instanceof ValidationError && err2.statusCode === 400,
      "2. Register invalid ditolak dengan status 400 ValidationError"
    );

    // ------------------------------------------------------------
    // 3. Register email duplicate (409 ConflictError)
    // ------------------------------------------------------------
    let err3: any = null;
    try {
      await daftarPengguna({
        nama: "Sarah Duplicate Email",
        nim: "240160229999",
        email: testEmail, // email sudah ada
        password: "password-unik-123",
      });
    } catch (e) {
      err3 = e;
    }
    assert(
      err3 instanceof ConflictError && err3.statusCode === 409,
      "3. Register email duplicate ditolak dengan status 409 ConflictError"
    );

    // ------------------------------------------------------------
    // 4. Register NIM duplicate (409 ConflictError)
    // ------------------------------------------------------------
    let err4: any = null;
    try {
      await daftarPengguna({
        nama: "Sarah Duplicate NIM",
        nim: testNim, // NIM sudah ada
        email: `unique.${Date.now()}@example.test`,
        password: "password-unik-123",
      });
    } catch (e) {
      err4 = e;
    }
    assert(
      err4 instanceof ConflictError && err4.statusCode === 409,
      "4. Register NIM duplicate ditolak dengan status 409 ConflictError"
    );

    // ------------------------------------------------------------
    // 5. Login benar (200)
    // ------------------------------------------------------------
    const loginResult = await loginPengguna({
      email: testEmail,
      password: testPassword,
    });
    assert(
      loginResult.id === regResult.id && loginResult.email === testEmail,
      "5. Login benar berhasil mengembalikan profil pengguna"
    );

    // ------------------------------------------------------------
    // 6. Login password salah (401 UnauthorizedError)
    // ------------------------------------------------------------
    let err6: any = null;
    try {
      await loginPengguna({
        email: testEmail,
        password: "password-keliru-total",
      });
    } catch (e) {
      err6 = e;
    }
    assert(
      err6 instanceof UnauthorizedError && err6.statusCode === 401,
      "6. Login password salah ditolak dengan status 401 UnauthorizedError"
    );

    // ------------------------------------------------------------
    // 7. Login email tidak terdaftar (401 UnauthorizedError)
    // ------------------------------------------------------------
    let err7: any = null;
    try {
      await loginPengguna({
        email: "email.gaib@example.test",
        password: testPassword,
      });
    } catch (e) {
      err7 = e;
    }
    assert(
      err7 instanceof UnauthorizedError && err7.statusCode === 401 && err7.message === err6.message,
      "7. Login email tidak terdaftar mengembalikan 401 dengan pesan yang sama generik"
    );

    // ------------------------------------------------------------
    // 8. Login tipe field salah (400 ValidationError)
    // ------------------------------------------------------------
    let err8: any = null;
    try {
      await loginPengguna({
        email: 12345,
        password: "",
      });
    } catch (e) {
      err8 = e;
    }
    assert(
      err8 instanceof ValidationError && err8.statusCode === 400,
      "8. Login tipe field salah ditolak dengan status 400 ValidationError"
    );

    // ------------------------------------------------------------
    // 9. Response register tidak mengandung password / passwordHash
    // ------------------------------------------------------------
    const regKeys = Object.keys(regResult);
    assert(
      !regKeys.includes("password") && !regKeys.includes("passwordHash"),
      "9. Response register HANYA profil publik (tanpa password & passwordHash)"
    );

    // ------------------------------------------------------------
    // 10. Response login tidak mengandung password / passwordHash
    // ------------------------------------------------------------
    const loginKeys = Object.keys(loginResult);
    assert(
      !loginKeys.includes("password") && !loginKeys.includes("passwordHash"),
      "10. Response login HANYA profil publik (tanpa password & passwordHash)"
    );

    // ------------------------------------------------------------
    // 11. Database menyimpan passwordHash, bukan plaintext
    // ------------------------------------------------------------
    const dbRecord = await prisma.pengguna.findUnique({
      where: { email: testEmail },
    });
    assert(
      dbRecord !== null && dbRecord.passwordHash !== testPassword,
      "11. Database SQLite TIDAK menyimpan plaintext password"
    );

    // ------------------------------------------------------------
    // 12. Format passwordHash adalah scrypt$salt$derivedKey
    // ------------------------------------------------------------
    const hashParts = (dbRecord?.passwordHash ?? "").split("$");
    const isScryptFormat =
      hashParts.length === 3 &&
      hashParts[0] === "scrypt" &&
      hashParts[1].length === 32 && // 16 bytes salt = 32 hex chars
      hashParts[2].length === 128; // 64 bytes key = 128 hex chars
    assert(
      isScryptFormat,
      "12. Format passwordHash terverifikasi: scrypt$<salt-hex>$<derived-key-hex>"
    );

    // Cleanup data pengujian
    await prisma.pengguna.deleteMany({
      where: { email: testEmail },
    });
    console.log("[INFO] Pembersihan data pengujian selesai.");

    console.log("\n============================================================");
    console.log(`  HASIL AKHIR PENGUJIAN §19: ${passed} lolos, ${failed} gagal.`);
    console.log(`  Persentase Keberhasilan: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
    console.log("============================================================\n");
  } finally {
    await prisma.$disconnect();
  }

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Test runner error:", err);
  process.exit(1);
});

