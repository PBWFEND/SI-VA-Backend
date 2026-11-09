import { app } from "./app.ts";
import { prisma } from "./client.ts";
import jwt from "jsonwebtoken";

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
  console.log(" PENGUJIAN OTOMATIS TUGAS JWT & AUTHORIZATION — SANDIKA (240160221044)");
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
        "Pemeriksaan kesehatan server API JWT",
        "GET /health",
        200,
        res.status,
        body.success === true,
        body.message
      );
    }

    // 2. Register Akun Mahasiswa
    const mhsUser = {
      nim: "240160221044",
      nama: "Sandika Yusuf Permana",
      email: "sandika.mhs@akademik.id",
      password: "passwordSandika#2026",
    };
    {
      const res = await fetch(`${baseUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mhsUser),
      });
      const body = (await res.json()) as any;
      recordTest(
        "Pendaftaran akun pengguna dengan default role MAHASISWA",
        "POST /auth/register",
        201,
        res.status,
        body.success === true && body.data?.role === "MAHASISWA",
        `ID: ${body.data?.id}, Role: ${body.data?.role}`
      );
    }

    // 3. Register Akun Admin
    const adminUser = {
      nim: "000000000001",
      nama: "Admin Akademik Utama",
      email: "admin@akademik.id",
      password: "adminPassword#2026",
      role: "ADMIN",
    };
    {
      const res = await fetch(`${baseUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(adminUser),
      });
      const body = (await res.json()) as any;
      recordTest(
        "Pendaftaran akun dengan wewenang role ADMIN",
        "POST /auth/register",
        201,
        res.status,
        body.success === true && body.data?.role === "ADMIN",
        `ID: ${body.data?.id}, Role: ${body.data?.role}`
      );
    }

    // 4. Register Akun Staf
    const stafUser = {
      nim: "199003152015031002",
      nama: "Budi Staf Akademik",
      email: "staf.akademik@akademik.id",
      password: "stafPassword#2026",
      role: "STAF",
    };
    {
      const res = await fetch(`${baseUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stafUser),
      });
      const body = (await res.json()) as any;
      recordTest(
        "Pendaftaran akun dengan wewenang role STAF",
        "POST /auth/register",
        201,
        res.status,
        body.success === true && body.data?.role === "STAF",
        `ID: ${body.data?.id}, Role: ${body.data?.role}`
      );
    }

    // 5. Login Mahasiswa (Mendapatkan JWT)
    let tokenMhs = "";
    {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: mhsUser.email, password: mhsUser.password }),
      });
      const body = (await res.json()) as any;
      tokenMhs = body.token;
      recordTest(
        "Login Mahasiswa menghasilkan Access Token JWT",
        "POST /auth/login",
        200,
        res.status,
        body.success === true && typeof body.token === "string" && body.tokenType === "Bearer",
        `Token Type: ${body.tokenType}, ExpiresIn: ${body.expiresIn}`
      );
    }

    // 6. Login Admin (Mendapatkan JWT)
    let tokenAdmin = "";
    {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: adminUser.email, password: adminUser.password }),
      });
      const body = (await res.json()) as any;
      tokenAdmin = body.token;
      recordTest(
        "Login Admin menghasilkan Access Token JWT",
        "POST /auth/login",
        200,
        res.status,
        body.success === true && typeof body.token === "string",
        `Admin: ${body.data?.nama}`
      );
    }

    // 7. Login Staf (Mendapatkan JWT)
    let tokenStaf = "";
    {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: stafUser.email, password: stafUser.password }),
      });
      const body = (await res.json()) as any;
      tokenStaf = body.token;
      recordTest(
        "Login Staf menghasilkan Access Token JWT",
        "POST /auth/login",
        200,
        res.status,
        body.success === true && typeof body.token === "string",
        `Staf: ${body.data?.nama}`
      );
    }

    // 8. Akses `/auth/me` dengan token Mahasiswa valid (200 OK)
    {
      const res = await fetch(`${baseUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${tokenMhs}` },
      });
      const body = (await res.json()) as any;
      const isClean = !("password" in (body.data ?? {})) && !("passwordHash" in (body.data ?? {}));
      recordTest(
        "Akses endpoint terproteksi profil dengan token valid",
        "GET /auth/me",
        200,
        res.status,
        body.success === true && body.data?.email === mhsUser.email && isClean,
        `User ID: ${body.data?.sub}, Role: ${body.data?.role}`
      );
    }

    // 9. Akses `/auth/me` tanpa token (401 Unauthorized)
    {
      const res = await fetch(`${baseUrl}/auth/me`);
      const body = (await res.json()) as any;
      recordTest(
        "Penolakan akses endpoint terproteksi tanpa token (401)",
        "GET /auth/me",
        401,
        res.status,
        body.success === false && body.message.includes("tidak ditemukan"),
        body.message
      );
    }

    // 10. Akses `/auth/me` dengan token palsu / signature salah (401 Unauthorized)
    {
      const tampered = tokenMhs.slice(0, -8) + "xxxxxxxx";
      const res = await fetch(`${baseUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${tampered}` },
      });
      const body = (await res.json()) as any;
      recordTest(
        "Penolakan akses dengan token bertanda-tangan palsu (401)",
        "GET /auth/me",
        401,
        res.status,
        body.success === false,
        body.message
      );
    }

    // 11. Akses `/auth/me` dengan skema salah (bukan Bearer) (401)
    {
      const res = await fetch(`${baseUrl}/auth/me`, {
        headers: { Authorization: `Basic ${tokenMhs}` },
      });
      const body = (await res.json()) as any;
      recordTest(
        "Penolakan akses dengan skema otorisasi salah (Basic) (401)",
        "GET /auth/me",
        401,
        res.status,
        body.success === false && body.message.includes("Bearer"),
        body.message
      );
    }

    // 12. Akses `/auth/me` dengan token kedaluwarsa (401)
    {
      const expiredToken = jwt.sign(
        { sub: 999, email: "expired@test.id", role: "MAHASISWA" },
        process.env.JWT_SECRET || "sandika_academic_jwt_secret_key_super_secure_2026_unsap",
        { expiresIn: "-10s" }
      );
      const res = await fetch(`${baseUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${expiredToken}` },
      });
      const body = (await res.json()) as any;
      recordTest(
        "Penolakan akses dengan token yang telah kedaluwarsa (401)",
        "GET /auth/me",
        401,
        res.status,
        body.success === false && body.message.includes("kedaluwarsa"),
        body.message
      );
    }

    // 13. Otorisasi Role: Staf mengakses `/protected/staf/rekap` (200 OK)
    {
      const res = await fetch(`${baseUrl}/protected/staf/rekap`, {
        headers: { Authorization: `Bearer ${tokenStaf}` },
      });
      const body = (await res.json()) as any;
      recordTest(
        "Role STAF diizinkan mengakses panel rekap staf (200 OK)",
        "GET /protected/staf/rekap",
        200,
        res.status,
        body.success === true && body.authorizedRole === "STAF",
        body.message
      );
    }

    // 14. Otorisasi Role: Mahasiswa mencoba mengakses `/protected/staf/rekap` (403 Forbidden)
    {
      const res = await fetch(`${baseUrl}/protected/staf/rekap`, {
        headers: { Authorization: `Bearer ${tokenMhs}` },
      });
      const body = (await res.json()) as any;
      recordTest(
        "Role MAHASISWA ditolak mengakses panel rekap staf (403 Forbidden)",
        "GET /protected/staf/rekap",
        403,
        res.status,
        body.success === false && body.message.includes("Akses terlarang"),
        body.message
      );
    }

    // 15. Otorisasi Role: Admin mengakses `/protected/admin/audit` (200 OK)
    {
      const res = await fetch(`${baseUrl}/protected/admin/audit`, {
        headers: { Authorization: `Bearer ${tokenAdmin}` },
      });
      const body = (await res.json()) as any;
      recordTest(
        "Role ADMIN diizinkan mengakses audit tingkat tinggi (200 OK)",
        "GET /protected/admin/audit",
        200,
        res.status,
        body.success === true && body.authorizedRole === "ADMIN",
        body.message
      );
    }

    // 16. Otorisasi Role: Staf mencoba mengakses `/protected/admin/audit` (403 Forbidden)
    {
      const res = await fetch(`${baseUrl}/protected/admin/audit`, {
        headers: { Authorization: `Bearer ${tokenStaf}` },
      });
      const body = (await res.json()) as any;
      recordTest(
        "Role STAF ditolak mengakses audit tingkat admin (403 Forbidden)",
        "GET /protected/admin/audit",
        403,
        res.status,
        body.success === false && body.message.includes("Akses terlarang"),
        body.message
      );
    }

    // 17. Domain Mahasiswa: Baca data mahasiswa tanpa token (401)
    {
      const res = await fetch(`${baseUrl}/api/mahasiswa`);
      const body = (await res.json()) as any;
      recordTest(
        "Endpoint domain data mahasiswa terproteksi dari akses anonim (401)",
        "GET /api/mahasiswa",
        401,
        res.status,
        body.success === false,
        body.message
      );
    }

    // 18. Domain Mahasiswa: Baca data mahasiswa dengan token Mahasiswa (200 OK)
    {
      const res = await fetch(`${baseUrl}/api/mahasiswa`, {
        headers: { Authorization: `Bearer ${tokenMhs}` },
      });
      const body = (await res.json()) as any;
      recordTest(
        "Pengguna terautentikasi dapat membaca koleksi mahasiswa (200 OK)",
        "GET /api/mahasiswa",
        200,
        res.status,
        body.success === true && Array.isArray(body.data),
        `Total: ${body.total}`
      );
    }

    // 19. Domain Mahasiswa: Mahasiswa mencoba menambah data mahasiswa baru (403 Forbidden)
    {
      const res = await fetch(`${baseUrl}/api/mahasiswa`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenMhs}`,
        },
        body: JSON.stringify({
          nim: "240160221099",
          nama: "Siswa Baru Ilegal",
          prodi: "Sistem Informasi",
          angkatan: 2026,
        }),
      });
      const body = (await res.json()) as any;
      recordTest(
        "Role MAHASISWA dilarang menambah data mahasiswa baru (403 Forbidden)",
        "POST /api/mahasiswa",
        403,
        res.status,
        body.success === false && body.message.includes("Akses terlarang"),
        body.message
      );
    }

    // 20. Domain Mahasiswa: Staf menambah data mahasiswa baru (201 Created)
    let createdMhsId = 0;
    {
      const res = await fetch(`${baseUrl}/api/mahasiswa`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenStaf}`,
        },
        body: JSON.stringify({
          nim: "240160221088",
          nama: "Mahasiswa Binaan Staf",
          prodi: "Sistem Informasi",
          angkatan: 2026,
        }),
      });
      const body = (await res.json()) as any;
      createdMhsId = body.data?.id;
      recordTest(
        "Role STAF berhak menambah data mahasiswa baru (201 Created)",
        "POST /api/mahasiswa",
        201,
        res.status,
        body.success === true && body.data?.nim === "240160221088",
        `Created ID: ${createdMhsId}`
      );
    }

    // 21. Domain Mahasiswa: Staf mencoba menghapus mahasiswa (403 Forbidden - Khusus Admin)
    {
      const res = await fetch(`${baseUrl}/api/mahasiswa/${createdMhsId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${tokenStaf}` },
      });
      const body = (await res.json()) as any;
      recordTest(
        "Role STAF dilarang menghapus data mahasiswa (403 Forbidden)",
        "DELETE /api/mahasiswa/:id",
        403,
        res.status,
        body.success === false && body.message.includes("Akses terlarang"),
        body.message
      );
    }

    // 22. Domain Mahasiswa: Admin menghapus mahasiswa (200 OK)
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
  } finally {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
    await prisma.$disconnect();
  }

  console.log("\n================================================================================");
  console.log(" RINGKASAN PENGUJIAN TUGAS JWT & AUTHORIZATION SANDIKA");
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

