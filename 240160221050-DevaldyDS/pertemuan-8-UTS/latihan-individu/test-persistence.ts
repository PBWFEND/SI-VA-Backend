import app from "../DevaldyDS-240160221050-UTS/app.ts";
import { prisma } from "../DevaldyDS-240160221050-UTS/client.ts";

type TestStatus = "PASS" | "FAIL";

interface TestResult {
  no: number;
  scenario: string;
  endpoint: string;
  expected: number;
  actual: number;
  status: TestStatus;
  note: string;
}

const NAMA_PENULIS = "Devaldy Dzikri Syach Mas'ud";
const JUDUL_UJI = "Buku Uji Pertemuan 8 (Persistence)";

async function runPersistenceTests() {
  const results: TestResult[] = [];
  let testNo = 1;
  let server1: ReturnType<typeof app.listen> | undefined;
  let server2: ReturnType<typeof app.listen> | undefined;

  const record = (
    scenario: string,
    endpoint: string,
    expected: number,
    actual: number,
    condition: boolean,
    note: string,
  ) => {
    const passed = expected === actual && condition;
    results.push({
      no: testNo,
      scenario,
      endpoint,
      expected,
      actual,
      status: passed ? "PASS" : "FAIL",
      note,
    });

    console.log(
      `${passed ? "✔ PASS" : "✖ FAIL"} ${testNo}. ${scenario} | ${endpoint} | HTTP ${actual} (harapan: ${expected})`,
    );
    testNo++;
  };

  const readJson = async (response: Response): Promise<any> => {
    return response.json();
  };

  const startServer = async () => {
    const srv = app.listen(0);
    await new Promise<void>((resolve, reject) => {
      srv.once("listening", resolve);
      srv.once("error", reject);
    });
    const addr = srv.address();
    if (!addr || typeof addr === "string") {
      throw new Error("Alamat server tidak dapat dibaca.");
    }
    return { server: srv, baseUrl: `http://127.0.0.1:${addr.port}` };
  };

  const stopServer = async (srv: ReturnType<typeof app.listen>) => {
    await new Promise<void>((resolve, reject) => {
      srv.close((err) => (err ? reject(err) : resolve()));
    });
  };

  console.log("==============================================================");
  console.log("PENGUJIAN PERSISTENSI DATA (PERSISTENCE TEST) - REST API BUKU");
  console.log("==============================================================");

  let createdId: number | undefined;

  try {
    // 0. Bersihkan data sisa uji sebelumnya
    await prisma.buku.deleteMany({
      where: { judul: JUDUL_UJI },
    });

    // --- SESI 1: Jalankan Server Pertama & Buat Data ---
    console.log("\n--- [Sesi Server 1] Memulai Server Pertama ---");
    const s1 = await startServer();
    server1 = s1.server;
    console.log(`Server 1 berjalan di ${s1.baseUrl}`);

    // Test 1: Tambah buku pada Server 1
    {
      const response = await fetch(`${s1.baseUrl}/buku`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          judul: JUDUL_UJI,
          penulis: NAMA_PENULIS,
          tahun: 2024,
          stok: 12,
        }),
      });
      const body = await readJson(response);
      createdId = body.data?.id;

      record(
        "Menambahkan buku di Server 1",
        "POST /buku",
        201,
        response.status,
        body.success === true && typeof createdId === "number",
        "Buku baru berhasil tersimpan via Server 1",
      );
    }

    // Matikan Server 1 untuk mensimulasikan server restart / stop
    console.log("Mematikan Server 1...");
    await stopServer(server1);
    server1 = undefined;

    // --- SESI 2: Periksa Database Langsung (Prisma Direct Check) ---
    console.log(
      "\n--- [Sesi DB Direct] Verifikasi Persistensi via Prisma Client ---",
    );
    if (createdId !== undefined) {
      const bukuDb = await prisma.buku.findUnique({
        where: { id: createdId },
      });

      record(
        "Memeriksa keberadaan data di database setelah Server 1 mati",
        `Prisma findUnique (ID: ${createdId})`,
        200,
        bukuDb ? 200 : 404,
        bukuDb?.judul === JUDUL_UJI,
        "Data tetap tersimpan di database (persistent)",
      );
    }

    // --- SESI 3: Jalankan Server Kedua & Verifikasi Data ---
    console.log("\n--- [Sesi Server 2] Memulai Server Kedua (Restart) ---");
    const s2 = await startServer();
    server2 = s2.server;
    console.log(`Server 2 berjalan di ${s2.baseUrl}`);

    // Test 3: Ambil detail buku yang dibuat Server 1 melalui Server 2
    if (createdId !== undefined) {
      const response = await fetch(`${s2.baseUrl}/buku/${createdId}`);
      const body = await readJson(response);

      record(
        "Mengakses data lama dari Instance Server Baru (Server 2)",
        `GET /buku/${createdId}`,
        200,
        response.status,
        body.success === true && body.data?.judul === JUDUL_UJI,
        "Server 2 berhasil membaca data yang dibuat oleh Server 1",
      );
    }
  } finally {
    // Bersihkan data uji & matikan server yang masih aktif
    if (createdId !== undefined) {
      await prisma.buku.deleteMany({
        where: { judul: JUDUL_UJI },
      });
    }

    if (server1) await stopServer(server1);
    if (server2) await stopServer(server2);
  }

  const totalLulus = results.filter((item) => item.status === "PASS").length;
  const totalGagal = results.filter((item) => item.status === "FAIL").length;

  console.log(
    "\n==============================================================",
  );
  console.log(
    `HASIL PENGUJIAN PERSISTENSI: ${totalLulus}/${results.length} LULUS`,
  );
  console.log(`GAGAL: ${totalGagal}`);
  console.log("==============================================================");

  if (totalGagal > 0) {
    process.exitCode = 1;
  }
}

runPersistenceTests()
  .catch((error) => {
    console.error("Pengujian persistensi gagal dijalankan:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
