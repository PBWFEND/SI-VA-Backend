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
  console.log(" PENGUJIAN OTOMATIS TUGAS AUTHENTICATION — SANDIKA YUSUF (240160221044)");
  console.log("================================================================================\n");

  const server = app.listen(0);
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Gagal menginisialisasi server pengujian");
  }
  const baseUrl = `http://127.0.0.1:${address.port}`;
  console.log(`[Setup] Server pengujian aktif di ${baseUrl}\n`);

  try {
    // Reset data uji untuk memastikan idempotensi pengujian berulang
    await prisma.pengguna.deleteMany({
      where: {
        OR: [
          { email: "sandika.test@akademik.id" },
          { nim: "240160221044" },
          { nim: "240160221099" },
          { nim: "240160221088" },
          { nim: "240160221077" },
        ],
      },
    });

    // 1. Health check
    {
      const res = await fetch(`${baseUrl}/health`);
      const body = (await res.json()) as any;
      recordTest(
        "Pemeriksaan kesehatan server API",
        "GET /health",
        200,
        res.status,
        body.success === true,
        body.message
      );
    }

    // 2. Register Akun Valid
    const testUser = {
      nim: "240160221044",
      nama: "Sandika Yusuf Permana",
      email: "sandika.test@akademik.id",
      password: "passwordPermana#2026",
    };

    {
      const res = await fetch(`${baseUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testUser),
      });
      const body = (await res.json()) as any;
      const isClean = !("password" in (body.data ?? {})) && !("passwordHash" in (body.data ?? {}));
      recordTest(
        "Pendaftaran akun pengguna baru dengan kredensial valid",
        "POST /auth/register",
        201,
        res.status,
        body.success === true && body.data?.email === testUser.email && isClean,
        `Akun terdaftar ID: ${body.data?.id}, Hash terlindungi: ${isClean}`
      );
    }

    // 3. Register Duplikasi Email (409)
    {
      const res = await fetch(`${baseUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nim: "240160221099",
          nama: "User Lain",
          email: testUser.email,
          password: "password12345",
        }),
      });
      const body = (await res.json()) as any;
      recordTest(
        "Penolakan pendaftaran dengan email yang sudah ada (409 Conflict)",
        "POST /auth/register",
        409,
        res.status,
        body.success === false && body.message.includes("Email sudah terdaftar"),
        body.message
      );
    }

    // 4. Register Duplikasi NIM (409)
    {
      const res = await fetch(`${baseUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nim: testUser.nim,
          nama: "User Lain Lagi",
          email: "userlain@akademik.id",
          password: "password12345",
        }),
      });
      const body = (await res.json()) as any;
      recordTest(
        "Penolakan pendaftaran dengan NIM yang sudah ada (409 Conflict)",
        "POST /auth/register",
        409,
        res.status,
        body.success === false && body.message.includes("NIM sudah terdaftar"),
        body.message
      );
    }

    // 5. Register Negatif: Password Kurang dari 8 Karakter (400)
    {
      const res = await fetch(`${baseUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nim: "240160221088",
          nama: "Password Pendek",
          email: "pendek@akademik.id",
          password: "pendek",
        }),
      });
      const body = (await res.json()) as any;
      recordTest(
        "Penolakan pendaftaran dengan password kurang dari 8 karakter (400)",
        "POST /auth/register",
        400,
        res.status,
        body.success === false && body.message.includes("minimal harus 8 karakter"),
        body.message
      );
    }

    // 6. Register Negatif: Injeksi Role Mandiri (400)
    {
      const res = await fetch(`${baseUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nim: "240160221077",
          nama: "Hacker Role",
          email: "hacker@akademik.id",
          password: "passwordKuat123",
          role: "admin",
        }),
      });
      const body = (await res.json()) as any;
      recordTest(
        "Penolakan registrasi publik yang mencoba menentukan role (400)",
        "POST /auth/register",
        400,
        res.status,
        body.success === false && body.message.includes("tidak boleh ditentukan melalui registrasi publik"),
        body.message
      );
    }

    // 7. Login Berhasil (200)
    {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password,
        }),
      });
      const body = (await res.json()) as any;
      const isClean = !("password" in (body.data ?? {})) && !("passwordHash" in (body.data ?? {}));
      recordTest(
        "Login pengguna dengan email dan password yang valid (200 OK)",
        "POST /auth/login",
        200,
        res.status,
        body.success === true && body.data?.email === testUser.email && isClean,
        `Login berhasil ID: ${body.data?.id}, Hash terproteksi: ${isClean}`
      );
    }

    // 8. Login Password Salah (401)
    {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: testUser.email,
          password: "passwordSalahTotal123",
        }),
      });
      const body = (await res.json()) as any;
      recordTest(
        "Penolakan login ketika password salah (401 Unauthorized)",
        "POST /auth/login",
        401,
        res.status,
        body.success === false && body.message === "Email atau kata sandi salah",
        body.message
      );
    }

    // 9. Login Email Tidak Terdaftar (401)
    {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "email.tidak.ada@akademik.id",
          password: testUser.password,
        }),
      });
      const body = (await res.json()) as any;
      recordTest(
        "Penolakan login ketika email tidak ditemukan (401 Unauthorized)",
        "POST /auth/login",
        401,
        res.status,
        body.success === false && body.message === "Email atau kata sandi salah",
        body.message
      );
    }

    // 10. Login Format Body Tidak Valid (400)
    {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "",
          password: "",
        }),
      });
      const body = (await res.json()) as any;
      recordTest(
        "Penolakan login ketika body kosong (400 Bad Request)",
        "POST /auth/login",
        400,
        res.status,
        body.success === false,
        body.message
      );
    }

    // 11. Endpoint Domain Mahasiswa Masih Berfungsi (200)
    {
      const res = await fetch(`${baseUrl}/mahasiswa`);
      const body = (await res.json()) as any;
      recordTest(
        "Verifikasi endpoint domain bisnis data mahasiswa tetap aktif",
        "GET /mahasiswa",
        200,
        res.status,
        body.success === true && Array.isArray(body.data),
        `Total data mahasiswa: ${body.total ?? body.data?.length}`
      );
    }
  } finally {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
    await prisma.$disconnect();
  }

  console.log("\n================================================================================");
  console.log(" RINGKASAN PENGUJIAN AUTHENTICATION PERMANA");
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

