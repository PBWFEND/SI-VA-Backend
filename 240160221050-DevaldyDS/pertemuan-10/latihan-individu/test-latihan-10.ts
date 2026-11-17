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
): void {
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
  console.log(
    `${mark} #${reports[reports.length - 1].no} ${skenario} | Status: ${actualStatus} (Expected: ${expectedStatus})`
  );
}

async function runTestSuite(): Promise<void> {
  console.log("================================================================================");
  console.log(" PENGUJIAN LATIHAN INDIVIDU PERTEMUAN 10 — DEVALDY DZIKRI (240160221050)");
  console.log("================================================================================\n");

  const stafUser = MOCK_USERS.find((user) => user.role === "staf");
  const mhsUser = MOCK_USERS.find((user) => user.role === "mahasiswa");
  const dosenUser = MOCK_USERS.find((user) => user.role === "dosen");

  if (!stafUser || !mhsUser || !dosenUser) {
    throw new Error("Data pengguna untuk pengujian tidak lengkap.");
  }

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

  console.log("--- PENGUJIAN AUTENTIKASI DAN AKSES STAF ---");

  // Test 1: Staf dengan token valid dapat mengakses dashboard.
  {
    const req: HttpRequest = {
      headers: { authorization: `Bearer ${stafToken}` },
    };
    const res = stafDashboardEndpoint(req);

    recordTest(
      "Akses endpoint staf dengan token role staf valid",
      200,
      res.status,
      res.body.success === true &&
        (res.body.data as { role?: string })?.role === "staf",
      `Petugas: ${(res.body.data as { petugas?: string })?.petugas}`
    );
  }

  // Test 2: Request tanpa Authorization ditolak.
  {
    const req: HttpRequest = { headers: {} };
    const res = stafDashboardEndpoint(req);

    recordTest(
      "Penolakan akses tanpa header Authorization",
      401,
      res.status,
      res.body.success === false &&
        String(res.body.message).includes("tidak ditemukan"),
      String(res.body.message)
    );
  }

  // Test 3: Skema selain Bearer ditolak.
  {
    const req: HttpRequest = {
      headers: { authorization: `Basic ${stafToken}` },
    };
    const res = stafDashboardEndpoint(req);

    recordTest(
      "Penolakan akses dengan format header Basic",
      401,
      res.status,
      res.body.success === false &&
        String(res.body.message).includes("Bearer"),
      String(res.body.message)
    );
  }

  // Test 4: Signature token yang dimanipulasi ditolak.
  {
    const parts = stafToken.split(".");
    const tamperedToken = `${parts[0]}.${parts[1]}.tampered_signature_xyz`;
    const req: HttpRequest = {
      headers: { authorization: `Bearer ${tamperedToken}` },
    };
    const res = stafDashboardEndpoint(req);

    recordTest(
      "Penolakan token dengan signature palsu atau dimanipulasi",
      401,
      res.status,
      res.body.success === false &&
        res.body.error === "INVALID_SIGNATURE",
      String(res.body.message)
    );
  }

  // Test 5: Token dengan format yang bukan tiga bagian ditolak.
  {
    const req: HttpRequest = {
      headers: { authorization: "Bearer token_acak_satu_bagian" },
    };
    const res = stafDashboardEndpoint(req);

    recordTest(
      "Penolakan token dengan format malformed",
      401,
      res.status,
      res.body.success === false &&
        res.body.error === "INVALID_FORMAT",
      String(res.body.message)
    );
  }

  console.log("\n--- PENGUJIAN AUTHORIZATION BERDASARKAN ROLE ---");

  // Test 6: Mahasiswa tidak boleh mengakses dashboard staf.
  {
    const req: HttpRequest = {
      headers: { authorization: `Bearer ${mhsToken}` },
    };
    const res = stafDashboardEndpoint(req);

    recordTest(
      "Penolakan akses role mahasiswa ke endpoint staf",
      403,
      res.status,
      res.body.success === false &&
        String(res.body.message).includes("Akses ditolak"),
      String(res.body.message)
    );
  }

  // Test 7: Dosen tidak boleh mengakses dashboard staf.
  {
    const req: HttpRequest = {
      headers: { authorization: `Bearer ${dosenToken}` },
    };
    const res = stafDashboardEndpoint(req);

    recordTest(
      "Penolakan akses role dosen ke endpoint staf",
      403,
      res.status,
      res.body.success === false &&
        String(res.body.message).includes("Akses ditolak"),
      String(res.body.message)
    );
  }

  console.log("\n--- PENGUJIAN MASA BERLAKU TOKEN ---");

  // Test 8: Token yang sudah kedaluwarsa harus ditolak.
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
      -10
    );

    const req: HttpRequest = {
      headers: { authorization: `Bearer ${expiredToken}` },
    };
    const res = stafDashboardEndpoint(req);

    recordTest(
      "Penolakan token yang telah kedaluwarsa",
      401,
      res.status,
      res.body.success === false &&
        res.body.error === "TOKEN_EXPIRED",
      String(res.body.message)
    );
  }

  // Test 9: Password tidak boleh dimasukkan ke payload JWT.
  {
    const verifyResult = verifyJwt(stafToken);
    const payload = verifyResult.payload;
    const hasPassword =
      !!payload &&
      ("password" in payload || "passwordHash" in payload);

    recordTest(
      "Verifikasi payload JWT tidak membocorkan informasi password",
      200,
      verifyResult.valid && !hasPassword ? 200 : 500,
      verifyResult.valid && !hasPassword,
      `Klaim sub: ${payload?.sub}, role: ${payload?.role}`
    );
  }

  console.log("\n================================================================================");
  console.log(" REKAPITULASI PENGUJIAN — DEVALDY DZIKRI");
  console.log("================================================================================");

  const passCount = reports.filter((report) => report.result === "PASS").length;
  const failCount = reports.length - passCount;
  const percentage = (passCount / reports.length) * 100;

  console.log(`Total Pengujian : ${reports.length}`);
  console.log(`Lulus (PASS)    : ${passCount}`);
  console.log(`Gagal (FAIL)    : ${failCount}`);
  console.log(`Persentase      : ${percentage.toFixed(2)}%`);

  if (failCount > 0) {
    process.exitCode = 1;
  }
}

runTestSuite().catch((error: unknown) => {
  console.error("Terjadi kesalahan saat menjalankan pengujian:", error);
  process.exitCode = 1;
});
