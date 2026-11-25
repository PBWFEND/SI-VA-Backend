/**
 * PENGUJIAN KEAMANAN API BACKEND
 * Latihan Individu Pertemuan 11
 * Pengujian Rate Limiting POST /api/buku
 */

const BASE_URL = "http://localhost:3011/api/buku";

interface TestReport {
  no: number;
  skenario: string;
  expectedStatus: number;
  actualStatus: number;
  result: "PASS" | "FAIL";
}

const reports: TestReport[] = [];

function recordTest(
  skenario: string,
  expectedStatus: number,
  actualStatus: number,
) {
  const isPass = actualStatus === expectedStatus;

  reports.push({
    no: reports.length + 1,
    skenario,
    expectedStatus,
    actualStatus,
    result: isPass ? "PASS" : "FAIL",
  });

  console.log(
    `${isPass ? "✔ [PASS]" : "✖ [FAIL]"} ${skenario} | Status: ${actualStatus} (Expected: ${expectedStatus})`,
  );
}

async function runTest() {
  console.log("================================================");
  console.log(" PENGUJIAN RATE LIMITING POST /api/buku");
  console.log("================================================\n");

  const payload = {
    judul: "Pengujian Rate Limiting",
    penulis: "Devaldy",
    stok: 5,
  };

  // Mengirim 4 request secara berurutan
  for (let i = 1; i <= 4; i++) {
    try {
      const response = await fetch(BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...payload,
          judul: `${payload.judul} ${i}`,
        }),
      });

      console.log(`Request ke-${i}: HTTP ${response.status}`);

      if (i <= 3) {
        recordTest(`Request ke-${i} diizinkan`, 201, response.status);
      } else {
        recordTest(
          "Request ke-4 ditolak oleh Rate Limiter",
          429,
          response.status,
        );

        const body = await response.json();

        console.log("Pesan server:", body.message);
      }
    } catch (error) {
      console.error("Terjadi kesalahan:", error);
      process.exitCode = 1;
      return;
    }
  }

  // Rekapitulasi pengujian
  console.log("\n================================================");
  console.log(" REKAPITULASI HASIL PENGUJIAN");
  console.log("================================================");

  const passCount = reports.filter((report) => report.result === "PASS").length;

  const failCount = reports.length - passCount;

  console.log(`Total Pengujian : ${reports.length}`);
  console.log(`Lulus (PASS)    : ${passCount}`);
  console.log(`Gagal (FAIL)    : ${failCount}`);
  console.log(`Persentase      : ${(passCount / reports.length) * 100}%`);

  console.log("================================================");

  if (failCount > 0) {
    process.exitCode = 1;
  }
}

runTest();
