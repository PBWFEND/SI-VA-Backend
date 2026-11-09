import {
  MOCK_USERS,
  signJwt,
  verifyJwt,
  stafDashboardEndpoint,
  type HttpRequest,
} from "./latihan-10.ts";

interface TestReport {
  no: number;
  skenario: string;
  expectedStatus: number;
  actualStatus: number;
  result: "PASS" | "FAIL";
  keterangan: string;
}

const reports: TestReport[] = [];
let testNo = 1;

function recordTest(
  skenario: string,
  expectedStatus: number,
  actualStatus: number,
  condition: boolean,
  keterangan: string
) {
  const isPass = condition && expectedStatus === actualStatus;
  reports.push({
    no: testNo++,
    skenario,
    expectedStatus,
    actualStatus,
    result: isPass ? "PASS" : "FAIL",
    keterangan,
  });
  const mark = isPass ? "✔ [PASS]" : "✖ [FAIL]";
  console.log(`${mark} #${reports[reports.length - 1].no} ${skenario} | Status: ${actualStatus} (Expected: ${expectedStatus})`);
}

async function runTestSuite() {
  console.log("================================================================================");
  console.log(" PENGUJIAN LATIHAN INDIVIDU PERTEMUAN 10 — SANDIKA YUSUF PERMANA (240160221044)");
  console.log("================================================================================\n");

  const stafUser = MOCK_USERS.find((u) => u.role === "staf")!;
  const mhsUser = MOCK_USERS.find((u) => u.role === "mahasiswa")!;
  const dosenUser = MOCK_USERS.find((u) => u.role === "dosen")!;

  // 1. Penerbitan token role staf yang valid
  const stafToken = signJwt({
    sub: stafUser.id,
    nim: stafUser.nim,
    nama: stafUser.nama,
    email: stafUser.email,
    role: stafUser.role,
  });

  const mhsToken = signJwt({
    sub: mhsUser.id,
    nim: mhsUser.nim,
    nama: mhsUser.nama,
    email: mhsUser.email,
    role: mhsUser.role,
  });

  const dosenToken = signJwt({
    sub: dosenUser.id,
    nim: dosenUser.nim,
    nama: dosenUser.nama,
    email: dosenUser.email,
    role: dosenUser.role,
  });

  console.log("--- PENGUJIAN AKTOR STAF & AKSES SUMBER DAYA ---");

  // Test 1: Staf mengakses endpoint staf dengan token valid
  {
    const req: HttpRequest = {
      headers: { authorization: `Bearer ${stafToken}` },
    };
    const res = stafDashboardEndpoint(req);
    recordTest(
      "Akses endpoint staf dengan token role staf valid (200 OK)",
      200,
      res.status,
      res.body.success === true && res.body.data.role === "staf",
      `Petugas: ${res.body.data?.petugas}`
    );
  }

  // Test 2: Akses tanpa menyertakan header authorization
  {
    const req: HttpRequest = { headers: {} };
    const res = stafDashboardEndpoint(req);
    recordTest(
      "Penolakan akses endpoint staf tanpa header Authorization (401)",
      401,
      res.status,
      res.body.success === false && res.body.message.includes("tidak ditemukan"),
      res.body.message
    );
  }

  // Test 3: Akses dengan format header salah (bukan Bearer)
  {
    const req: HttpRequest = {
      headers: { authorization: `Basic ${stafToken}` },
    };
    const res = stafDashboardEndpoint(req);
    recordTest(
      "Penolakan akses dengan format skema header salah (Basic) (401)",
      401,
      res.status,
      res.body.success === false && res.body.message.includes("Bearer"),
      res.body.message
    );
  }

  // Test 4: Akses dengan token rusak (signature dimanipulasi)
  {
    const parts = stafToken.split(".");
    const tamperedToken = `${parts[0]}.${parts[1]}.tampered_signature_xyz`;
    const req: HttpRequest = {
      headers: { authorization: `Bearer ${tamperedToken}` },
    };
    const res = stafDashboardEndpoint(req);
    recordTest(
      "Penolakan token dengan signature palsu / rusak (401 Unauthorized)",
      401,
      res.status,
      res.body.success === false && res.body.error === "INVALID_SIGNATURE",
      res.body.message
    );
  }

  // Test 5: Akses dengan format string token malformed (bukan 3 bagian)
  {
    const req: HttpRequest = {
      headers: { authorization: `Bearer token_acak_satu_bagian` },
    };
    const res = stafDashboardEndpoint(req);
    recordTest(
      "Penolakan string token malformed (401 Unauthorized)",
      401,
      res.status,
      res.body.success === false && res.body.error === "INVALID_FORMAT",
      res.body.message
    );
  }

  console.log("\n--- PENGUJIAN OTORISASI & PEMBATASAN ROLE ---");

  // Test 6: Mahasiswa mencoba mengakses dashboard staf (403 Forbidden)
  {
    const req: HttpRequest = {
      headers: { authorization: `Bearer ${mhsToken}` },
    };
    const res = stafDashboardEndpoint(req);
    recordTest(
      "Penolakan akses role mahasiswa ke endpoint staf (403 Forbidden)",
      403,
      res.status,
      res.body.success === false && res.body.message.includes("Akses ditolak"),
      res.body.message
    );
  }

  // Test 7: Dosen mencoba mengakses dashboard staf (403 Forbidden)
  {
    const req: HttpRequest = {
      headers: { authorization: `Bearer ${dosenToken}` },
    };
    const res = stafDashboardEndpoint(req);
    recordTest(
      "Penolakan akses role dosen ke endpoint staf (403 Forbidden)",
      403,
      res.status,
      res.body.success === false && res.body.message.includes("Akses ditolak"),
      res.body.message
    );
  }

  console.log("\n--- PENGUJIAN KEDALUWARSAAN TOKEN (EXPIRATION) ---");

  // Test 8: Token kedaluwarsa (masa berlaku -10 detik dari sekarang)
  {
    const expiredToken = signJwt(
      {
        sub: stafUser.id,
        nim: stafUser.nim,
        nama: stafUser.nama,
        email: stafUser.email,
        role: stafUser.role,
      },
      undefined,
      -10 // Expired 10 detik lalu
    );

    const req: HttpRequest = {
      headers: { authorization: `Bearer ${expiredToken}` },
    };
    const res = stafDashboardEndpoint(req);
    recordTest(
      "Penolakan token yang telah kedaluwarsa (401 Unauthorized)",
      401,
      res.status,
      res.body.success === false && res.body.error === "TOKEN_EXPIRED",
      res.body.message
    );
  }

  // Test 9: Verifikasi integritas payload (tanpa password)
  {
    const verifyRes = verifyJwt(stafToken);
    const hasPassword = "password" in (verifyRes.payload ?? {}) || "passwordHash" in (verifyRes.payload ?? {});
    recordTest(
      "Verifikasi payload JWT tidak membocorkan informasi password",
      200,
      verifyRes.valid && !hasPassword ? 200 : 500,
      verifyRes.valid && !hasPassword,
      `Klaim sub: ${verifyRes.payload?.sub}, role: ${verifyRes.payload?.role}`
    );
  }

  console.log("\n================================================================================");
  console.log(" REKAPITULASI PENGUJIAN LATIHAN INDIVIDU PERTEMUAN 10 — SANDIKA");
  console.log("================================================================================");
  const passCount = reports.filter((r) => r.result === "PASS").length;
  console.log(`Total Pengujian : ${reports.length}`);
  console.log(`Lulus (PASS)    : ${passCount}`);
  console.log(`Gagal (FAIL)    : ${reports.length - passCount}`);
  console.log(`Persentase      : ${(passCount / reports.length) * 100}%\n`);

  if (passCount !== reports.length) {
    process.exit(1);
  }
}

runTestSuite().catch(console.error);

