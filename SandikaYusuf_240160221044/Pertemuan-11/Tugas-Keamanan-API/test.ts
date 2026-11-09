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
  console.log(" PENGUJIAN OTOMATIS TUGAS KEAMANAN API — SANDIKA YUSUF PERMANA (240160221044)");
  console.log("================================================================================\n");

  const server = app.listen(0);
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Gagal menginisialisasi server pengujian");
  }
  const baseUrl = `http://127.0.0.1:${address.port}`;
  console.log(`[Setup] Server pengujian aktif di ${baseUrl}\n`);

  try {
    // 0. Reset data uji untuk memastikan idempotensi
    await prisma.mahasiswa.deleteMany({});
    await prisma.pengguna.deleteMany({});

    // 1. Health check
    {
      const res = await fetch(`${baseUrl}/health`);
      const body = (await res.json()) as any;
      recordTest(
        "Pemeriksaan kesehatan server API Keamanan",
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
      const largePayload = JSON.stringify({ data: "X".repeat(15000) });
      const res = await fetch(`${baseUrl}/mahasiswa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: largePayload,
      });
      const body = (await res.json()) as any;
      recordTest(
        "Penolakan payload request yang melebihi batas 10KB (413 Payload Too Large)",
        "POST /mahasiswa",
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
          nama: "User Salah",
          email: "salah.nim@akademik.id",
          password: "passwordValid#2026",
        }),
      });
      const body = (await res.json()) as any;
      recordTest(
        "Validasi input menolak NIM yang mengandung karakter non-angka (400)",
        "POST /auth/register",
        400,
        res.status,
        body.success === false,
        body.message
      );
    }

    // 8. Register Admin & Mahasiswa Valid
    let tokenAdmin = "";
    let tokenMhs = "";
    {
      // Register Admin
      await fetch(`${baseUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nim: "000000000001",
          nama: "Admin Keamanan",
          email: "admin.sec@akademik.id",
          password: "adminPassword#2026",
          role: "ADMIN",
        }),
      });

      // Login Admin
      const loginAdminRes = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "admin.sec@akademik.id", password: "adminPassword#2026" }),
      });
      const loginAdminBody = (await loginAdminRes.json()) as any;
      tokenAdmin = loginAdminBody.token;

      // Register Mahasiswa
      await fetch(`${baseUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nim: "240160221044",
          nama: "Sandika Yusuf Permana",
          email: "sandika.sec@akademik.id",
          password: "passwordSandika#2026",
        }),
      });

      // Login Mahasiswa
      const loginMhsRes = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "sandika.sec@akademik.id", password: "passwordSandika#2026" }),
      });
      const loginMhsBody = (await loginMhsRes.json()) as any;
      tokenMhs = loginMhsBody.token;

      recordTest(
        "Autentikasi akun dan penerbitan token JWT aman",
        "POST /auth/login",
        200,
        loginMhsRes.status,
        typeof tokenMhs === "string" && typeof tokenAdmin === "string",
        "Token Admin dan Mahasiswa berhasil diterbitkan"
      );
    }

    // 9. Validasi Input Domain: Nama terlalu pendek (<3 karakter) (400)
    {
      const res = await fetch(`${baseUrl}/api/mahasiswa`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenAdmin}`,
        },
        body: JSON.stringify({
          nim: "240160221099",
          nama: "Al", // Terlalu pendek
          prodi: "Sistem Informasi",
          angkatan: 2024,
        }),
      });
      const body = (await res.json()) as any;
      recordTest(
        "Penolakan pembuatan mahasiswa dengan nama terlalu pendek (<3 karakter) (400)",
        "POST /api/mahasiswa",
        400,
        res.status,
        body.success === false && body.errors.some((e: string) => e.includes("terlalu pendek")),
        body.errors?.join("; ")
      );
    }

    // 10. Validasi Input Domain: Tahun angkatan tidak valid (400)
    {
      const res = await fetch(`${baseUrl}/api/mahasiswa`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenAdmin}`,
        },
        body: JSON.stringify({
          nim: "240160221099",
          nama: "Budi Siswa",
          prodi: "Sistem Informasi",
          angkatan: 1980, // Tidak wajar
        }),
      });
      const body = (await res.json()) as any;
      recordTest(
        "Penolakan pembuatan mahasiswa dengan tahun angkatan tidak valid (400)",
        "POST /api/mahasiswa",
        400,
        res.status,
        body.success === false && body.errors.some((e: string) => e.includes("angkatan")),
        body.errors?.join("; ")
      );
    }

    // 11. Parameterized Query Anti-SQL Injection
    {
      const sqliPayload = "' OR '1'='1";
      const res = await fetch(`${baseUrl}/api/mahasiswa?search=${encodeURIComponent(sqliPayload)}`, {
        headers: { Authorization: `Bearer ${tokenMhs}` },
      });
      const body = (await res.json()) as any;
      recordTest(
        "Pencarian dengan payload SQL Injection dinetralkan oleh query terparameterisasi",
        "GET /api/mahasiswa?search=...",
        200,
        res.status,
        body.success === true && Array.isArray(body.data) && body.total === 0,
        `Data ditemukan: ${body.total} (Teks diperlakukan harfiah)`
      );
    }

    // 12. Proteksi Autentikasi: Akses data mahasiswa tanpa token (401)
    {
      const res = await fetch(`${baseUrl}/api/mahasiswa`);
      const body = (await res.json()) as any;
      recordTest(
        "Penolakan akses endpoint data mahasiswa tanpa token autentikasi (401)",
        "GET /api/mahasiswa",
        401,
        res.status,
        body.success === false,
        body.message
      );
    }

    // 13. Proteksi Otorisasi Role: Mahasiswa dilarang menambah mahasiswa baru (403)
    {
      const res = await fetch(`${baseUrl}/api/mahasiswa`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenMhs}`,
        },
        body: JSON.stringify({
          nim: "240160221088",
          nama: "Mahasiswa Ilegal",
          prodi: "Sistem Informasi",
          angkatan: 2024,
        }),
      });
      const body = (await res.json()) as any;
      recordTest(
        "Role MAHASISWA ditolak saat mencoba menambah data mahasiswa baru (403)",
        "POST /api/mahasiswa",
        403,
        res.status,
        body.success === false && body.message.includes("Akses terlarang"),
        body.message
      );
    }

    // 14. Admin Berhak Membuat Data Mahasiswa (201 Created)
    let createdMhsId = 0;
    {
      const res = await fetch(`${baseUrl}/api/mahasiswa`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenAdmin}`,
        },
        body: JSON.stringify({
          nim: "240160221077",
          nama: "Mahasiswa Sah Admin",
          prodi: "Sistem Informasi",
          angkatan: 2024,
        }),
      });
      const body = (await res.json()) as any;
      createdMhsId = body.data?.id;
      recordTest(
        "Role ADMIN berhasil membuat data mahasiswa baru secara aman (201 Created)",
        "POST /api/mahasiswa",
        201,
        res.status,
        body.success === true && body.data?.nim === "240160221077",
        `Created ID: ${createdMhsId}`
      );
    }

    // 15. Admin Berhak Menghapus Data Mahasiswa (200 OK)
    {
      const res = await fetch(`${baseUrl}/api/mahasiswa/${createdMhsId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${tokenAdmin}` },
      });
      const body = (await res.json()) as any;
      recordTest(
        "Role ADMIN berhasil mengeksekusi penghapusan data mahasiswa (200 OK)",
        "DELETE /api/mahasiswa/:id",
        200,
        res.status,
        body.success === true,
        body.message
      );
    }

    // 16. Error Handler Aman: Tidak Membocorkan Stack Trace / Internal Path
    {
      const res = await fetch(`${baseUrl}/api/mahasiswa`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenAdmin}`,
        },
        body: "bad-json-syntax{",
      });
      const body = (await res.json()) as any;
      const hasStackTrace = "stack" in body || "stackTrace" in body;
      recordTest(
        "Error handler menangani sintaks JSON buruk tanpa membocorkan stack trace (400)",
        "POST /api/mahasiswa",
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
  console.log(" RINGKASAN PENGUJIAN KEAMANAN API SANDIKA");
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

