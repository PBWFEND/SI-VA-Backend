import { app } from "./app.ts";
import { prisma } from "./client.ts";

interface TestReport {
  no: number;
  skenario: string;
  endpoint: string;
  expectedStatus: number;
  actualStatus: number;
  result: "PASS" | "FAIL";
  keterangan: string;
}

const reports: TestReport[] = [];
let testNo = 1;

function recordTest(
  skenario: string,
  endpoint: string,
  expectedStatus: number,
  actualStatus: number,
  condition: boolean,
  keterangan: string
) {
  const isPass = condition && expectedStatus === actualStatus;
  reports.push({
    no: testNo++,
    skenario,
    endpoint,
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
  console.log(" PENGUJIAN OTOMATIS TUGAS KEAMANAN API — DELLA KARTIKA (240160221008)");
  console.log(" STUDI KASUS: SISTEM INFORMASI ABSENSI MAHASISWA");
  console.log("================================================================================\n");

  const server = app.listen(0);
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Gagal menginisialisasi server pengujian");
  }
  const baseUrl = `http://127.0.0.1:${address.port}`;
  console.log(`[Setup] Server pengujian aktif di ${baseUrl}\n`);

  try {
    // 0. Reset data uji untuk memastikan idempotensi pengujian
    await prisma.absensi.deleteMany({});
    await prisma.pengguna.deleteMany({});

    // 1. Health check
    {
      const res = await fetch(`${baseUrl}/health`);
      const body = (await res.json()) as any;
      recordTest(
        "Pemeriksaan kesehatan server API Keamanan Absensi",
        "GET /health",
        200,
        res.status,
        body.success === true,
        body.message
      );
    }

    // 2. Security Headers (Helmet)
    {
      const res = await fetch(`${baseUrl}/health`);
      const nosniff = res.headers.get("x-content-type-options") === "nosniff";
      const frameOptions = res.headers.get("x-frame-options") === "SAMEORIGIN";
      const noPoweredBy = !res.headers.has("x-powered-by");
      recordTest(
        "Verifikasi Security Headers Helmet (nosniff, SAMEORIGIN, no X-Powered-By)",
        "GET /health",
        200,
        res.status,
        nosniff && frameOptions && noPoweredBy,
        `nosniff: ${nosniff}, SAMEORIGIN: ${frameOptions}, hiddenPoweredBy: ${noPoweredBy}`
      );
    }

    // 3. Request Tracker Header (X-Request-Id)
    {
      const res = await fetch(`${baseUrl}/health`);
      const hasRequestId = res.headers.has("x-request-id") && (res.headers.get("x-request-id")?.length ?? 0) > 10;
      recordTest(
        "Pemasangan header pelacak unik X-Request-Id",
        "GET /health",
        200,
        res.status,
        hasRequestId,
        `X-Request-Id: ${res.headers.get("x-request-id")}`
      );
    }

    // 4. CORS Whitelist: Origin Terdaftar Diizinkan
    {
      const res = await fetch(`${baseUrl}/health`, {
        headers: { Origin: "http://localhost:3000" },
      });
      const allowOrigin = res.headers.get("access-control-allow-origin");
      recordTest(
        "Origin terdaftar (http://localhost:3000) menerima header Access-Control-Allow-Origin",
        "GET /health",
        200,
        res.status,
        allowOrigin === "http://localhost:3000",
        `Header: ${allowOrigin}`
      );
    }

    // 5. CORS Whitelist: Origin Asing Ditolak
    {
      const res = await fetch(`${baseUrl}/health`, {
        headers: { Origin: "http://malicious-attacker.com" },
      });
      const hasCors = res.headers.has("access-control-allow-origin");
      recordTest(
        "Origin tidak terdaftar tidak menerima header Access-Control-Allow-Origin",
        "GET /health",
        200,
        res.status,
        !hasCors,
        `CORS dikirim: ${hasCors}`
      );
    }

    // 6. Pembatasan Ukuran Body (Maksimal 10KB)
    {
      const largePayload = JSON.stringify({ data: "A".repeat(15000) });
      const res = await fetch(`${baseUrl}/absensi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: largePayload,
      });
      const body = (await res.json()) as any;
      recordTest(
        "Penolakan payload request yang melebihi batas 10KB (413 Payload Too Large)",
        "POST /absensi",
        413,
        res.status,
        res.status === 413 && body.success === false,
        body.message
      );
    }

    // 7. Input Validation: NIM mengandung huruf (400)
    {
      const res = await fetch(`${baseUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nim: "240160ABC123",
          nama: "User Tidak Valid",
          email: "salah.nim@unsap.ac.id",
          password: "passwordValid#2026",
        }),
      });
      const body = (await res.json()) as any;
      recordTest(
        "Validasi input registrasi menolak NIM yang mengandung karakter non-angka (400)",
        "POST /auth/register",
        400,
        res.status,
        body.success === false,
        body.message
      );
    }

    // 8. Register Admin & Mahasiswa (Della Kartika) Valid
    let tokenAdmin = "";
    let tokenMhs = "";
    {
      // Register Admin
      await fetch(`${baseUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nim: "000000000002",
          nama: "Admin Absensi",
          email: "admin.absensi@unsap.ac.id",
          password: "adminPassword#2026",
          role: "ADMIN",
        }),
      });

      // Login Admin
      const loginAdminRes = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "admin.absensi@unsap.ac.id", password: "adminPassword#2026" }),
      });
      const loginAdminBody = (await loginAdminRes.json()) as any;
      tokenAdmin = loginAdminBody.token;

      // Register Mahasiswa (Della Kartika)
      await fetch(`${baseUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nim: "240160221008",
          nama: "Della Kartika",
          email: "della.sec@unsap.ac.id",
          password: "passwordDella#2026",
        }),
      });

      // Login Mahasiswa
      const loginMhsRes = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "della.sec@unsap.ac.id", password: "passwordDella#2026" }),
      });
      const loginMhsBody = (await loginMhsRes.json()) as any;
      tokenMhs = loginMhsBody.token;

      recordTest(
        "Autentikasi akun dan penerbitan token JWT aman",
        "POST /auth/login",
        200,
        loginMhsRes.status,
        typeof tokenMhs === "string" && typeof tokenAdmin === "string",
        "Token Admin dan Mahasiswa (Della) berhasil diterbitkan"
      );
    }

    // 9. Validasi Input Absensi: Status tidak valid ('BOLOS') (400)
    {
      const res = await fetch(`${baseUrl}/api/absensi`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenMhs}`,
        },
        body: JSON.stringify({
          kelas: "SI-VA",
          status: "BOLOS",
          keterangan: "Tidak hadir",
        }),
      });
      const body = (await res.json()) as any;
      recordTest(
        "Penolakan input status absensi tidak valid ('BOLOS') (400 Bad Request)",
        "POST /api/absensi",
        400,
        res.status,
        body.success === false && body.errors?.some((e: string) => e.includes("tidak valid")),
        body.errors?.join("; ")
      );
    }

    // 10. Validasi Input Absensi: Field 'kelas' kosong (400)
    {
      const res = await fetch(`${baseUrl}/api/absensi`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenMhs}`,
        },
        body: JSON.stringify({
          kelas: "", // Kosong
          status: "HADIR",
        }),
      });
      const body = (await res.json()) as any;
      recordTest(
        "Penolakan pencatatan absensi tanpa field 'kelas' (400 Bad Request)",
        "POST /api/absensi",
        400,
        res.status,
        body.success === false && body.errors?.some((e: string) => e.includes("kelas")),
        body.errors?.join("; ")
      );
    }

    // 11. Anti-Spoofing Identity Enforcement: Mahasiswa mengirimkan NIM palsu orang lain
    // Sistem harus mengabaikan NIM palsu dan memaksakan NIM & Nama dari JWT (240160221008 - Della Kartika)
    let createdAbsensiId = 0;
    {
      const spoofedNim = "240160221999";
      const spoofedNama = "Mahasiswa Palsu";
      const res = await fetch(`${baseUrl}/api/absensi`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenMhs}`,
        },
        body: JSON.stringify({
          nim: spoofedNim,
          namaMahasiswa: spoofedNama,
          kelas: "SI-VA",
          status: "HADIR",
          keterangan: "Percobaan manipulasi NIM diabaikan sistem",
        }),
      });
      const body = (await res.json()) as any;
      createdAbsensiId = body.data?.id;
      const isAntiSpoofEnforced = body.data?.nim === "240160221008" && body.data?.namaMahasiswa === "Della Kartika";
      recordTest(
        "Anti-Spoofing: Sistem mengabaikan NIM palsu dan mengikat presensi ke identitas JWT yang sah (201)",
        "POST /api/absensi",
        201,
        res.status,
        body.success === true && isAntiSpoofEnforced,
        `Tercatat atas NIM: ${body.data?.nim} (${body.data?.namaMahasiswa})`
      );
    }

    // 12. Parameterized Query Anti-SQL Injection pada Pencarian
    {
      const sqliPayload = "' OR '1'='1";
      const res = await fetch(`${baseUrl}/api/absensi?search=${encodeURIComponent(sqliPayload)}`, {
        headers: { Authorization: `Bearer ${tokenMhs}` },
      });
      const body = (await res.json()) as any;
      recordTest(
        "Pencarian absensi dengan payload SQL Injection dinetralkan oleh query terparameterisasi",
        "GET /api/absensi?search=...",
        200,
        res.status,
        body.success === true && Array.isArray(body.data) && body.total === 0,
        `Data ditemukan: ${body.total} (Payload diperlakukan sebagai literal string)`
      );
    }

    // 13. Proteksi Autentikasi: Akses endpoint absensi tanpa token (401)
    {
      const res = await fetch(`${baseUrl}/api/absensi`);
      const body = (await res.json()) as any;
      recordTest(
        "Penolakan akses endpoint data absensi tanpa token autentikasi (401)",
        "GET /api/absensi",
        401,
        res.status,
        body.success === false,
        body.message
      );
    }

    // 14. Proteksi Otorisasi Role: Mahasiswa dilarang menghapus absensi (403)
    {
      const res = await fetch(`${baseUrl}/api/absensi/${createdAbsensiId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${tokenMhs}` },
      });
      const body = (await res.json()) as any;
      recordTest(
        "Role MAHASISWA dilarang menghapus catatan absensi (403 Forbidden)",
        "DELETE /api/absensi/:id",
        403,
        res.status,
        body.success === false && body.message.includes("Akses terlarang"),
        body.message
      );
    }

    // 15. Admin Berhak Mencatat Absensi Atas Nama Mahasiswa (201 Created)
    let adminCreatedId = 0;
    {
      const res = await fetch(`${baseUrl}/api/absensi`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenAdmin}`,
        },
        body: JSON.stringify({
          nim: "240160221002",
          namaMahasiswa: "Nadya Zahra Aulia",
          kelas: "SI-VA",
          status: "HADIR",
          keterangan: "Dicatat oleh admin secara sah",
        }),
      });
      const body = (await res.json()) as any;
      adminCreatedId = body.data?.id;
      recordTest(
        "Role ADMIN berhasil mencatat data kehadiran mahasiswa (201 Created)",
        "POST /api/absensi",
        201,
        res.status,
        body.success === true && body.data?.nim === "240160221002",
        `Created ID: ${adminCreatedId}`
      );
    }

    // 16. Admin Berhak Menghapus Data Absensi (200 OK)
    {
      const res = await fetch(`${baseUrl}/api/absensi/${adminCreatedId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${tokenAdmin}` },
      });
      const body = (await res.json()) as any;
      recordTest(
        "Role ADMIN berhasil mengeksekusi penghapusan data absensi (200 OK)",
        "DELETE /api/absensi/:id",
        200,
        res.status,
        body.success === true,
        body.message
      );
    }

    // 17. Error Handler Aman: Tidak Membocorkan Stack Trace / Detail Internal
    {
      const res = await fetch(`${baseUrl}/api/absensi`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenAdmin}`,
        },
        body: "bad-json-payload-syntax{",
      });
      const body = (await res.json()) as any;
      const hasStackTrace = "stack" in body || "stackTrace" in body;
      recordTest(
        "Error handler menangani sintaks JSON buruk tanpa membocorkan stack trace (400)",
        "POST /api/absensi",
        400,
        res.status,
        body.success === false && !hasStackTrace,
        body.message
      );
    }
  } finally {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
    await prisma.$disconnect();
  }

  console.log("\n================================================================================");
  console.log(" RINGKASAN PENGUJIAN KEAMANAN API DELLA KARTIKA");
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

