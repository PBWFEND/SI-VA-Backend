import {
  isValidNIM,
  register,
  login,
  verifyPassword,
  resetDatabase,
} from "./latihan9.ts";

interface TestReport {
  no: number;
  skenario: string;
  expected: string;
  actual: string;
  status: "PASS" | "FAIL";
}

const reports: TestReport[] = [];
let testNo = 1;

function assertTest(
  skenario: string,
  expected: string,
  actual: string,
  condition: boolean,
) {
  const status = condition ? "PASS" : "FAIL";

  reports.push({
    no: testNo++,
    skenario,
    expected,
    actual,
    status,
  });

  console.log(
    `${condition ? "✔ [PASS]" : "✖ [FAIL]"} #${reports.length} ${skenario} | Hasil: ${actual}`,
  );
}

async function runTests() {
  resetDatabase();

  console.log(
    "================================================================================",
  );
  console.log(" PENGUJIAN LATIHAN INDIVIDU PERTEMUAN 9");
  console.log(" DEVALDY DZIKRI S (240160221050)");
  console.log(
    "================================================================================\n",
  );

  // Bagian 1: Validasi NIM
  console.log("--- PENGUJIAN VALIDASI FORMAT NIM ---");

  {
    const res = isValidNIM("240160221050");
    assertTest(
      "NIM valid 12 digit numerik",
      "valid",
      res.valid ? "valid" : "invalid",
      res.valid,
    );
  }

  {
    const res = isValidNIM("24016022ABC");
    assertTest(
      "NIM mengandung huruf",
      "invalid",
      res.valid ? "valid" : "invalid",
      !res.valid,
    );
  }

  {
    const res = isValidNIM("12345");
    assertTest(
      "NIM kurang dari 8 digit",
      "invalid",
      res.valid ? "valid" : "invalid",
      !res.valid,
    );
  }

  {
    const res = isValidNIM(240160221050);
    assertTest(
      "NIM bertipe number",
      "invalid",
      res.valid ? "valid" : "invalid",
      !res.valid,
    );
  }

  {
    const res = isValidNIM("24016022 1050");
    assertTest(
      "NIM mengandung spasi",
      "invalid",
      res.valid ? "valid" : "invalid",
      !res.valid,
    );
  }

  // Bagian 2: Pengujian Register
  console.log("\n--- PENGUJIAN REGISTER ---");

  const testPassword = "passwordAkademik#2026";

  {
    const res = await register({
      nama: "Devaldy Dzikri S",
      nim: "240160221050",
      email: "devaldymasud12@gmail.com",
      password: testPassword,
    });

    assertTest(
      "Register dengan data valid",
      "Status 201",
      `Status ${res.status} (${res.message})`,
      res.status === 201,
    );
  }

  {
    const res = await register({
      nama: "Pengguna Kedua",
      nim: "240160221050",
      email: "pengguna2@akademik.test",
      password: testPassword,
    });

    assertTest(
      "Register menggunakan NIM duplikat",
      "Status 409",
      `Status ${res.status} (${res.message})`,
      res.status === 409,
    );
  }

  {
    const res = await register({
      nama: "Pengguna Kedua",
      nim: "240160221051",
      email: "devaldymasud12@gmail.com",
      password: testPassword,
    });

    assertTest(
      "Register menggunakan email duplikat",
      "Status 409",
      `Status ${res.status} (${res.message})`,
      res.status === 409,
    );
  }

  {
    const res = await register({
      nama: "Pengguna Baru",
      nim: "12345",
      email: "baru@akademik.test",
      password: testPassword,
    });

    assertTest(
      "Register dengan NIM tidak valid",
      "Status 400",
      `Status ${res.status}`,
      res.status === 400,
    );
  }

  {
    const res = await register({
      nama: "Pengguna Baru",
      nim: 240160221051,
      email: "baru@akademik.test",
      password: testPassword,
    });

    assertTest(
      "Register dengan tipe NIM number",
      "Status 400",
      `Status ${res.status}`,
      res.status === 400,
    );
  }

  // Bagian 3: Pengujian Login
  console.log("\n--- PENGUJIAN LOGIN & PASSWORD HASHING ---");

  {
    const res = await login("devaldymasud12@gmail.com", testPassword);

    assertTest(
      "Login dengan kredensial benar",
      "Status 200",
      `Status ${res.status} (${res.message})`,
      res.status === 200 && res.data?.nim === "240160221050",
    );
  }

  {
    const res = await login("devaldymasud12@gmail.com", "passwordSalah123");

    assertTest(
      "Login dengan password salah",
      "Status 401",
      `Status ${res.status} (${res.message})`,
      res.status === 401 && res.message === "Email atau kata sandi salah",
    );
  }

  {
    const res = await login("tidak-terdaftar@akademik.test", testPassword);

    assertTest(
      "Login dengan email tidak terdaftar",
      "Status 401",
      `Status ${res.status} (${res.message})`,
      res.status === 401 && res.message === "Email atau kata sandi salah",
    );
  }

  {
    const res = await login(240160221050, testPassword);

    assertTest(
      "Login dengan tipe email number",
      "Status 400",
      `Status ${res.status}`,
      res.status === 400,
    );
  }

  {
    const res = await login("devaldymasud12@gmail.com", 12345678);

    assertTest(
      "Login dengan tipe password number",
      "Status 400",
      `Status ${res.status}`,
      res.status === 400,
    );
  }

  // Bagian 4: Keamanan Password
  console.log("\n--- PENGUJIAN KEAMANAN PASSWORD ---");

  {
    const res = await login("devaldymasud12@gmail.com", testPassword);

    const hasSensitiveData =
      res.status === 200 &&
      ("passwordHash" in res.data || "password" in res.data);

    assertTest(
      "Response login tidak membocorkan password/hash",
      "Tidak ada password/hash",
      hasSensitiveData ? "Data sensitif bocor" : "Aman",
      !hasSensitiveData,
    );
  }

  {
    const hash1 = await (async () => {
      const result = await register({
        nama: "Pengguna Ketiga",
        nim: "240160221052",
        email: "pengguna3@akademik.test",
        password: testPassword,
      });
      return result.status;
    })();

    assertTest(
      "Password pengguna berhasil diproses",
      "Status 201",
      `Status ${hash1}`,
      hash1 === 201,
    );
  }

  console.log(
    "\n================================================================================",
  );
  console.log(" REKAPITULASI PENGUJIAN LATIHAN INDIVIDU");
  console.log(
    "================================================================================",
  );

  const passCount = reports.filter((r) => r.status === "PASS").length;

  const failCount = reports.length - passCount;

  console.log(`Total Pengujian : ${reports.length}`);
  console.log(`Lulus (PASS)    : ${passCount}`);
  console.log(`Gagal (FAIL)    : ${failCount}`);
  console.log(
    `Persentase      : ${((passCount / reports.length) * 100).toFixed(2)}%\n`,
  );

  if (failCount > 0) {
    process.exitCode = 1;
  }
}

runTests().catch((error) => {
  console.error("Terjadi kesalahan saat pengujian:", error);
  process.exitCode = 1;
});
