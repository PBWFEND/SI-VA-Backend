import {
  postAbsensiSecureEndpoint,
  strictPostAbsensiLimiter,
  searchAbsensiParameterized,
  type RequestContext,
} from "./latihan-11.ts";

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
  console.log(" PENGUJIAN LATIHAN INDIVIDU PERTEMUAN 11 — DELLA KARTIKA (240160221008)");
  console.log("================================================================================\n");

  // Reset limiter sebelum pengujian
  strictPostAbsensiLimiter.reset();
  const testIp = "192.168.1.88";

  console.log("--- 1. PENGUJIAN VALIDASI INPUT ABSENSI ---");

  // Test 1: Validasi status absensi tidak valid
  {
    const req: RequestContext = {
      ip: testIp,
      headers: {},
      body: {
        nim: "240160221008",
        namaMahasiswa: "Della Kartika",
        mataKuliah: "Pemrograman Backend",
        status: "BOLOS", // Tidak valid
        keterangan: "Tidak ada kabar",
      },
    };
    const res = postAbsensiSecureEndpoint(req);
    recordTest(
      "Penolakan input status absensi tidak valid ('BOLOS') (400 Bad Request)",
      400,
      res.status,
      res.body.success === false && res.body.errors.some((e: string) => e.includes("tidak valid")),
      res.body.errors.join("; ")
    );
  }

  // Test 2: Validasi format NIM salah (mengandung karakter non-angka)
  {
    const req: RequestContext = {
      ip: testIp,
      headers: {},
      body: {
        nim: "240160221XYZ",
        namaMahasiswa: "Della Kartika",
        mataKuliah: "Pemrograman Backend",
        status: "HADIR",
      },
    };
    const res = postAbsensiSecureEndpoint(req);
    recordTest(
      "Penolakan input format NIM bukan angka murni (400 Bad Request)",
      400,
      res.status,
      res.body.success === false && res.body.errors.some((e: string) => e.includes("digit angka")),
      res.body.errors.join("; ")
    );
  }

  // Test 3: Validasi Mata Kuliah terlalu pendek (<3 karakter)
  {
    const req: RequestContext = {
      ip: testIp,
      headers: {},
      body: {
        nim: "240160221008",
        namaMahasiswa: "Della Kartika",
        mataKuliah: "PB", // Terlalu pendek
        status: "HADIR",
      },
    };
    const res = postAbsensiSecureEndpoint(req);
    recordTest(
      "Penolakan nama mata kuliah terlalu pendek (<3 karakter) (400 Bad Request)",
      400,
      res.status,
      res.body.success === false && res.body.errors.some((e: string) => e.includes("mataKuliah")),
      res.body.errors.join("; ")
    );
  }

  console.log("\n--- 2. PENGUJIAN CORS & SECURITY HEADERS ---");
  strictPostAbsensiLimiter.reset();

  // Test 4: Origin terdaftar diizinkan (CORS header dikirim)
  {
    const req: RequestContext = {
      ip: testIp,
      headers: { origin: "http://localhost:3000" },
      body: {
        nim: "240160221008",
        namaMahasiswa: "Della Kartika",
        mataKuliah: "Pemrograman Backend",
        status: "HADIR",
        keterangan: "Presensi tepat waktu",
      },
    };
    const res = postAbsensiSecureEndpoint(req);
    recordTest(
      "Pengiriman header CORS untuk Origin terdaftar (http://localhost:3000)",
      201,
      res.status,
      res.headers["Access-Control-Allow-Origin"] === "http://localhost:3000",
      `Header Allow-Origin: ${res.headers["Access-Control-Allow-Origin"]}`
    );
  }

  // Test 5: Origin tidak terdaftar ditolak (Header CORS tidak dikirim)
  {
    const req: RequestContext = {
      ip: testIp,
      headers: { origin: "http://attacker-evil-site.com" },
      body: {
        nim: "240160221008",
        namaMahasiswa: "Della Kartika",
        mataKuliah: "Pemrograman Backend",
        status: "HADIR",
      },
    };
    const res = postAbsensiSecureEndpoint(req);
    const hasCors = "Access-Control-Allow-Origin" in res.headers;
    recordTest(
      "Origin tidak terdaftar tidak menerima header Access-Control-Allow-Origin",
      201,
      res.status,
      !hasCors,
      `CORS Header dikirim: ${hasCors}`
    );
  }

  // Test 6: Verifikasi Security Headers (Helmet standard)
  {
    const req: RequestContext = { ip: testIp, headers: {} };
    const res = postAbsensiSecureEndpoint(req);
    const hasNosniff = res.headers["X-Content-Type-Options"] === "nosniff";
    const hasFrameOptions = res.headers["X-Frame-Options"] === "SAMEORIGIN";
    recordTest(
      "Verifikasi keberadaan Security Headers (nosniff & SAMEORIGIN)",
      200,
      hasNosniff && hasFrameOptions ? 200 : 500,
      hasNosniff && hasFrameOptions,
      `X-Content-Type-Options: ${res.headers["X-Content-Type-Options"]}, X-Frame-Options: ${res.headers["X-Frame-Options"]}`
    );
  }

  console.log("\n--- 3. PENGUJIAN RATE LIMITING KETAT ---");
  strictPostAbsensiLimiter.reset();

  // Test 7: Memicu Rate Limit (Request ke-4 dengan batas 3)
  {
    const limiterIp = "10.0.0.88";
    // Request 1, 2, 3 masih diizinkan
    for (let i = 1; i <= 3; i++) {
      postAbsensiSecureEndpoint({
        ip: limiterIp,
        headers: {},
        body: {
          nim: "240160221008",
          namaMahasiswa: "Della Kartika",
          mataKuliah: "Pemrograman Backend",
          status: "HADIR",
        },
      });
    }

    // Request ke-4 harus ditolak dengan 429 Too Many Requests
    const req4: RequestContext = {
      ip: limiterIp,
      headers: {},
      body: {
        nim: "240160221008",
        namaMahasiswa: "Della Kartika",
        mataKuliah: "Pemrograman Backend",
        status: "HADIR",
      },
    };
    const res4 = postAbsensiSecureEndpoint(req4);
    recordTest(
      "Pemicuan Rate Limiter menghasilkan 429 Too Many Requests",
      429,
      res4.status,
      res4.body.success === false && "Retry-After" in res4.headers,
      `Retry-After: ${res4.headers["Retry-After"]}s, Pesan: ${res4.body.message}`
    );
  }

  console.log("\n--- 4. PENGUJIAN ANTI-SQL INJECTION ---");

  // Test 8: Query terparameterisasi menangani payload SQL injection sebagai string harfiah
  {
    const sqliPayload = "' OR '1'='1";
    const searchResults = searchAbsensiParameterized(sqliPayload);
    // Tidak boleh mengembalikan seluruh tabel basis data
    recordTest(
      "Query terparameterisasi menetralkan payload SQL Injection (' OR '1'='1)",
      200,
      searchResults.length === 0 ? 200 : 500,
      searchResults.length === 0,
      `Data bocor: ${searchResults.length} baris (Harus 0 baris)`
    );
  }

  console.log("\n================================================================================");
  console.log(" REKAPITULASI PENGUJIAN LATIHAN INDIVIDU PERTEMUAN 11 — DELLA KARTIKA");
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

