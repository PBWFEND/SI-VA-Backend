/**
 * Test Runner untuk Latihan Individu Pertemuan 10 (§19)
 * Mahasiswa: Sarah Azkiya (NIM: 240160221057)
 */

import {
  registrasiMahasiswa,
  buatToken,
  aksesEndpointPeminjamanStaf,
  ROLES,
  prisma,
} from "./latihan.ts";

async function main() {
  console.log("============================================================");
  console.log("  PENGUJIAN LATIHAN INDIVIDU PERTEMUAN 10 — SARAH AZKIYA");
  console.log("  NIM: 240160221057 | JWT, ROLE STAF & AUTHORIZATION");
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

  const testEmail = `sarah.p10.${Date.now()}@example.test`;
  const testNim = `24016022${Math.floor(1000 + Math.random() * 9000)}`;

  try {
    // ------------------------------------------------------------
    // 6.1 Role Ketiga: 'staf' & Proteksi Registrasi Publik
    // ------------------------------------------------------------
    // 1. Client mencoba mendaftar dengan role: 'staf' (400)
    const r1 = await registrasiMahasiswa({
      nama: "Sarah Hacker",
      nim: "240160221099",
      email: "hacker@example.test",
      password: "password-kuat-123",
      role: ROLES.STAF,
    });
    assert(r1.status === 400 && !r1.success, "1. Registrasi publik dengan 'role': 'staf' ditolak (400 Bad Request)");

    // 2. Client mendaftar normal -> default role menjadi 'mahasiswa' (201)
    const r2 = await registrasiMahasiswa({
      nama: "Sarah Azkiya",
      nim: testNim,
      email: testEmail,
      password: "password-kuat-123",
    });
    assert(r2.status === 201 && r2.data?.role === ROLES.MAHASISWA, "2. Registrasi publik berhasil dengan default role 'mahasiswa' (201 Created)");

    // Buat token untuk masing-masing role
    const tokenMhs = buatToken({
      sub: r2.data!.id,
      nama: "Sarah Mahasiswa",
      nim: testNim,
      email: testEmail,
      role: ROLES.MAHASISWA,
    });

    const tokenDosen = buatToken({
      sub: 888,
      nama: "Dosen Pembimbing",
      nim: "198501012010121001",
      email: "dosen@univ.test",
      role: ROLES.DOSEN,
    });

    const tokenStaf = buatToken({
      sub: 999,
      nama: "Staf Perpustakaan",
      nim: "199002022015022002",
      email: "staf@univ.test",
      role: ROLES.STAF,
    });

    // ------------------------------------------------------------
    // 6.2 & 6.3 Pengujian Endpoint Khusus Staf (401 vs 403 vs 200)
    // ------------------------------------------------------------
    // 3. Tanpa token (401)
    const a3 = aksesEndpointPeminjamanStaf(undefined);
    assert(a3.status === 401 && !a3.success, "3. Akses tanpa token ditolak (401 Unauthorized)");

    // 4. Format header salah (401)
    const a4 = aksesEndpointPeminjamanStaf(`Basic ${tokenStaf}`);
    assert(a4.status === 401 && !a4.success, "4. Format header bukan 'Bearer' ditolak (401 Unauthorized)");

    // 5. Token rusak (401)
    const a5 = aksesEndpointPeminjamanStaf("Bearer token.rusak.acak");
    assert(a5.status === 401 && !a5.success, "5. Token rusak ditolak (401 Unauthorized)");

    // 6. Token diubah 1 karakter (401)
    const tampered = tokenStaf.slice(0, -1) + (tokenStaf.endsWith("a") ? "b" : "a");
    const a6 = aksesEndpointPeminjamanStaf(`Bearer ${tampered}`);
    assert(a6.status === 401 && !a6.success, "6. Token diubah 1 karakter ditolak (401 Unauthorized)");

    // 7. Token expired (401)
    const tokenExpired = buatToken(
      {
        sub: 123,
        nama: "User Expired",
        nim: "12345678",
        email: "exp@test.com",
        role: ROLES.STAF,
      },
      0 // expires immediately
    );
    const a7 = aksesEndpointPeminjamanStaf(`Bearer ${tokenExpired}`);
    assert(a7.status === 401 && a7.message.includes("kedaluwarsa"), "7. Token kedaluwarsa (expired) ditolak (401 Unauthorized)");

    // 8. Mahasiswa mengakses endpoint staf (403)
    const a8 = aksesEndpointPeminjamanStaf(`Bearer ${tokenMhs}`);
    assert(a8.status === 403 && !a8.success && a8.message.includes("mahasiswa"), "8. Mahasiswa mengakses endpoint staf ditolak (403 Forbidden)");

    // 9. Dosen mengakses endpoint staf (403)
    const a9 = aksesEndpointPeminjamanStaf(`Bearer ${tokenDosen}`);
    assert(a9.status === 403 && !a9.success && a9.message.includes("dosen"), "9. Dosen mengakses endpoint staf ditolak (403 Forbidden)");

    // 10. Staf mengakses endpoint staf (200 OK)
    const a10 = aksesEndpointPeminjamanStaf(`Bearer ${tokenStaf}`);
    assert(a10.status === 200 && a10.success && Array.isArray(a10.data), "10. Staf mengakses endpoint staf diizinkan (200 OK)");

    // 11. Pemeriksaan payload JWT aman (bebas password / passwordHash)
    const decodedParts = JSON.parse(Buffer.from(tokenStaf.split(".")[1], "base64").toString("utf-8"));
    assert(!("password" in decodedParts) && !("passwordHash" in decodedParts), "11. Payload JWT tidak memuat password atau passwordHash");
    assert("exp" in decodedParts && typeof decodedParts.exp === "number", "12. Payload JWT memuat klaim exp (expiration time)");

    // Cleanup data uji
    await prisma.pengguna.deleteMany({
      where: { email: testEmail },
    });

    console.log("\n============================================================");
    console.log(`  HASIL AKHIR LATIHAN INDIVIDU P10: ${passed} lolos, ${failed} gagal.`);
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

