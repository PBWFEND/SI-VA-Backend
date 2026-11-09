import { isValidNIM, hashPassword, verifyPassword } from "./latihan-9.ts";

interface TestReport {
  no: number;
  skenario: string;
  expected: string;
  actual: string;
  status: "PASS" | "FAIL";
}

const reports: TestReport[] = [];
let testNo = 1;

function assertTest(skenario: string, expected: string, actual: string, condition: boolean) {
  const isPass = condition;
  reports.push({
    no: testNo++,
    skenario,
    expected,
    actual,
    status: isPass ? "PASS" : "FAIL",
  });
  console.log(`${isPass ? "✔ [PASS]" : "✖ [FAIL]"} #${reports.length} ${skenario} | Hasil: ${actual}`);
}

async function runTests() {
  console.log("================================================================================");
  console.log(" PENGUJIAN LATIHAN INDIVIDU PERTEMUAN 9 — SANDIKA YUSUF PERMANA (240160221044)");
  console.log("================================================================================\n");

  // Bagian 1: Validasi NIM
  console.log("--- PENGUJIAN VALIDASI FORMAT NIM ---");
  {
    const res = isValidNIM("240160221044");
    assertTest("NIM valid 12 digit numerik", "valid", res.valid ? "valid" : "invalid", res.valid === true);
  }
  {
    const res = isValidNIM("24016022ABC");
    assertTest("NIM tidak valid mengandung huruf", "invalid", res.valid ? "valid" : "invalid", res.valid === false);
  }
  {
    const res = isValidNIM("12345");
    assertTest("NIM terlalu pendek (<8 digit)", "invalid", res.valid ? "valid" : "invalid", res.valid === false);
  }
  {
    const res = isValidNIM(1234567890);
    assertTest("NIM tipe data non-string (number)", "invalid", res.valid ? "valid" : "invalid", res.valid === false);
  }

  // Bagian 2: Simulasi Basis Data & Autentikasi
  console.log("\n--- PENGUJIAN ALUR LOGIN & PASSWORD HASHING ---");
  const testPassword = "passwordAkademik#2026";
  const storedHash = await hashPassword(testPassword);

  // Database mock sederhana
  const mockDatabase = [
    {
      id: 1,
      nim: "240160221044",
      nama: "Sandika Yusuf Permana",
      email: "Yusuf@akademik.test",
      passwordHash: storedHash,
    },
  ];

  // Helper login
  const simulateLogin = async (inputEmail: unknown, inputPassword: unknown) => {
    // 1. Validasi tipe data input
    if (typeof inputEmail !== "string" || typeof inputPassword !== "string") {
      return { status: 400, message: "Format input tidak valid (harus string)" };
    }

    // 2. Cari akun
    const user = mockDatabase.find((u) => u.email === inputEmail);
    if (!user) {
      return { status: 401, message: "Email atau kata sandi salah" };
    }

    // 3. Verifikasi hash
    const match = await verifyPassword(inputPassword, user.passwordHash);
    if (!match) {
      return { status: 401, message: "Email atau kata sandi salah" };
    }

    // 4. Return data publik
    return {
      status: 200,
      message: "Login berhasil",
      data: { id: user.id, nim: user.nim, nama: user.nama, email: user.email },
    };
  };

  // Uji 1: Login berhasil
  {
    const res = await simulateLogin("Yusuf@akademik.test", testPassword);
    assertTest(
      "Login kredensial benar",
      "Status 200",
      `Status ${res.status} (${res.message})`,
      res.status === 200 && (res as any).data?.email === "Yusuf@akademik.test"
    );
  }

  // Uji 2: Password salah
  {
    const res = await simulateLogin("Yusuf@akademik.test", "passwordSalah123");
    assertTest(
      "Login password salah",
      "Status 401",
      `Status ${res.status} (${res.message})`,
      res.status === 401 && res.message === "Email atau kata sandi salah"
    );
  }

  // Uji 3: Email tidak terdaftar
  {
    const res = await simulateLogin("tidak-terdaftar@akademik.test", testPassword);
    assertTest(
      "Login email tidak terdaftar",
      "Status 401",
      `Status ${res.status} (${res.message})`,
      res.status === 401 && res.message === "Email atau kata sandi salah"
    );
  }

  // Uji 4: Tipe input salah (email bernilai number)
  {
    const res = await simulateLogin(123456, testPassword);
    assertTest(
      "Login tipe email salah (number)",
      "Status 400",
      `Status ${res.status} (${res.message})`,
      res.status === 400
    );
  }

  // Uji 5: Verifikasi hash tidak bocor ke output
  {
    const res = await simulateLogin("Yusuf@akademik.test", testPassword);
    const hasHash = "passwordHash" in (res as any).data || "password" in (res as any).data;
    assertTest(
      "Response login tidak membocorkan hash atau password",
      "Tidak ada hash/password",
      hasHash ? "Hash bocor!" : "Aman, tanpa hash",
      !hasHash
    );
  }

  console.log("\n================================================================================");
  console.log(" REKAPITULASI PENGUJIAN LATIHAN INDIVIDU SANDIKA");
  console.log("================================================================================");
  const passCount = reports.filter((r) => r.status === "PASS").length;
  console.log(`Total Pengujian : ${reports.length}`);
  console.log(`Lulus (PASS)    : ${passCount}`);
  console.log(`Gagal (FAIL)    : ${reports.length - passCount}`);
  console.log(`Persentase      : ${(passCount / reports.length) * 100}%\n`);

  if (passCount !== reports.length) {
    process.exit(1);
  }
}

runTests().catch(console.error);

