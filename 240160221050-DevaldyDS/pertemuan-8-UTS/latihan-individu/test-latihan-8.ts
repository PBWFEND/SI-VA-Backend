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
const JUDUL_UJI = "Buku Uji Pertemuan 8";
const JUDUL_UJI_PATCH = "Buku Uji PATCH Pertemuan 8";

async function runAllTests() {
  const results: TestResult[] = [];
  let testNo = 1;
  let server: ReturnType<typeof app.listen> | undefined;

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

  console.log("==============================================================");
  console.log("PENGUJIAN LATIHAN INDIVIDU PERTEMUAN 8 - REST API BUKU");
  console.log("==============================================================");

  let jumlahAwal = 0;

  try {
    // Hapus sisa data pengujian dari eksekusi sebelumnya.
    await prisma.buku.deleteMany({
      where: {
        judul: { in: [JUDUL_UJI, `${JUDUL_UJI} Terupdate`, JUDUL_UJI_PATCH] },
      },
    });
    jumlahAwal = await prisma.buku.count();

    // Gunakan port otomatis agar tidak bentrok dengan server development.
    server = app.listen(0);
    await new Promise<void>((resolve, reject) => {
      server!.once("listening", resolve);
      server!.once("error", reject);
    });

    const address = server.address();
    if (!address || typeof address === "string") {
      throw new Error("Alamat server pengujian tidak dapat dibaca.");
    }

    const baseUrl = `http://127.0.0.1:${address.port}`;
    console.log(`Server pengujian berjalan di ${baseUrl}\n`);

    // 1. Pemeriksaan endpoint health.
    {
      const response = await fetch(`${baseUrl}/health`);
      let body: any = {};
      if (response.status !== 204) body = await readJson(response);

      record(
        "Memeriksa status API",
        "GET /health",
        200,
        response.status,
        body.success === true,
        body.message ?? "Endpoint health berhasil diakses",
      );
    }

    // 2. Mengambil seluruh data buku.
    {
      const response = await fetch(`${baseUrl}/buku`);
      const body = await readJson(response);

      record(
        "Mengambil seluruh daftar buku",
        "GET /buku",
        200,
        response.status,
        body.success === true && Array.isArray(body.data),
        body.message ?? "Daftar buku diterima",
      );
    }

    // 3. Menambahkan buku dengan data valid.
    let idBuku: number | undefined;
    {
      const response = await fetch(`${baseUrl}/buku`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          judul: JUDUL_UJI,
          penulis: NAMA_PENULIS,
          tahun: 2024,
          stok: 10,
        }),
      });
      const body = await readJson(response);
      idBuku = body.data?.id;

      record(
        "Menambahkan buku dengan data valid",
        "POST /buku",
        201,
        response.status,
        body.success === true &&
          body.data?.judul === JUDUL_UJI &&
          body.data?.penulis === NAMA_PENULIS &&
          typeof idBuku === "number",
        body.message ?? "Pemeriksaan hasil tambah buku",
      );
    }

    // 4. Mengambil detail buku yang baru dibuat.
    if (idBuku !== undefined) {
      const response = await fetch(`${baseUrl}/buku/${idBuku}`);
      const body = await readJson(response);

      record(
        "Mengambil detail buku berdasarkan ID",
        `GET /buku/${idBuku}`,
        200,
        response.status,
        body.success === true && body.data?.id === idBuku,
        body.message ?? "Detail buku diterima",
      );
    }

    // 5. ID tidak valid.
    {
      const response = await fetch(`${baseUrl}/buku/abc`);
      const body = await readJson(response);

      record(
        "Mengakses buku dengan ID bukan angka",
        "GET /buku/abc",
        400,
        response.status,
        body.success === false,
        body.message ?? "ID ditolak",
      );
    }

    // 6. ID valid tetapi buku tidak ditemukan.
    {
      const response = await fetch(`${baseUrl}/buku/999999999`);
      const body = await readJson(response);

      record(
        "Mengakses buku yang tidak ditemukan",
        "GET /buku/999999999",
        404,
        response.status,
        body.success === false,
        body.message ?? "Buku tidak ditemukan",
      );
    }

    // 7. Memperbarui data buku.
    if (idBuku !== undefined) {
      const response = await fetch(`${baseUrl}/buku/${idBuku}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          judul: `${JUDUL_UJI} Terupdate`,
          penulis: NAMA_PENULIS,
          tahun: 2025,
          stok: 15,
        }),
      });
      const body = await readJson(response);

      record(
        "Memperbarui data buku dengan data valid",
        `PATCH /buku/${idBuku}`,
        200,
        response.status,
        body.success === true &&
          body.data?.judul === `${JUDUL_UJI} Terupdate` &&
          body.data?.tahun === 2025 &&
          body.data?.stok === 15,
        body.message ?? "Pemeriksaan hasil update buku",
      );
    }

    // 8. PATCH dengan body kosong.
    if (idBuku !== undefined) {
      const response = await fetch(`${baseUrl}/buku/${idBuku}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const body = await readJson(response);

      record(
        "Menolak PATCH dengan body kosong",
        `PATCH /buku/${idBuku}`,
        400,
        response.status,
        body.success === false,
        body.message ?? "Body kosong ditolak",
      );
    }

    // 9. PATCH dengan field yang tidak diizinkan.
    if (idBuku !== undefined) {
      const response = await fetch(`${baseUrl}/buku/${idBuku}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: 999 }),
      });
      const body = await readJson(response);

      record(
        "Menolak perubahan field ID",
        `PATCH /buku/${idBuku}`,
        400,
        response.status,
        body.success === false,
        body.message ?? "Field ID tidak diizinkan",
      );
    }

    // 10. POST tanpa judul.
    {
      const response = await fetch(`${baseUrl}/buku`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          penulis: NAMA_PENULIS,
          tahun: 2024,
          stok: 5,
        }),
      });
      const body = await readJson(response);

      record(
        "Menolak POST tanpa judul",
        "POST /buku",
        400,
        response.status,
        body.success === false,
        body.message ?? "Judul wajib diisi",
      );
    }

    // 11. POST dengan judul kosong.
    {
      const response = await fetch(`${baseUrl}/buku`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          judul: "   ",
          penulis: NAMA_PENULIS,
          tahun: 2024,
          stok: 5,
        }),
      });
      const body = await readJson(response);

      record(
        "Menolak POST dengan judul kosong",
        "POST /buku",
        400,
        response.status,
        body.success === false,
        body.message ?? "Judul kosong ditolak",
      );
    }

    // 12. POST tanpa penulis.
    {
      const response = await fetch(`${baseUrl}/buku`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          judul: "Buku Tanpa Penulis",
          tahun: 2024,
          stok: 5,
        }),
      });
      const body = await readJson(response);

      record(
        "Menolak POST tanpa penulis",
        "POST /buku",
        400,
        response.status,
        body.success === false,
        body.message ?? "Penulis wajib diisi",
      );
    }

    // 13. POST dengan tahun bertipe string.
    {
      const response = await fetch(`${baseUrl}/buku`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          judul: "Buku Tahun String",
          penulis: NAMA_PENULIS,
          tahun: "2024",
          stok: 5,
        }),
      });
      const body = await readJson(response);

      record(
        "Menolak POST dengan tahun berupa string",
        "POST /buku",
        400,
        response.status,
        body.success === false,
        body.message ?? "Tahun harus berupa angka",
      );
    }

    // 14. POST dengan tahun di luar rentang.
    {
      const response = await fetch(`${baseUrl}/buku`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          judul: "Buku Tahun Tidak Valid",
          penulis: NAMA_PENULIS,
          tahun: 2200,
          stok: 5,
        }),
      });
      const body = await readJson(response);

      record(
        "Menolak POST dengan tahun di luar rentang 1000-2100",
        "POST /buku",
        400,
        response.status,
        body.success === false,
        body.message ?? "Tahun di luar rentang",
      );
    }

    // 15. POST dengan stok negatif.
    {
      const response = await fetch(`${baseUrl}/buku`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          judul: "Buku Stok Negatif",
          penulis: NAMA_PENULIS,
          tahun: 2024,
          stok: -1,
        }),
      });
      const body = await readJson(response);

      record(
        "Menolak POST dengan stok negatif",
        "POST /buku",
        400,
        response.status,
        body.success === false,
        body.message ?? "Stok negatif ditolak",
      );
    }

    // 16. PATCH dengan judul kosong.
    if (idBuku !== undefined) {
      const response = await fetch(`${baseUrl}/buku/${idBuku}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ judul: " " }),
      });
      const body = await readJson(response);

      record(
        "Menolak PATCH dengan judul kosong",
        `PATCH /buku/${idBuku}`,
        400,
        response.status,
        body.success === false,
        body.message ?? "Judul kosong ditolak",
      );
    }

    // 17. PATCH dengan tahun berupa string.
    if (idBuku !== undefined) {
      const response = await fetch(`${baseUrl}/buku/${idBuku}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tahun: "2025" }),
      });
      const body = await readJson(response);

      record(
        "Menolak PATCH dengan tahun berupa string",
        `PATCH /buku/${idBuku}`,
        400,
        response.status,
        body.success === false,
        body.message ?? "Tahun harus berupa angka",
      );
    }

    // 18. PATCH dengan stok negatif.
    if (idBuku !== undefined) {
      const response = await fetch(`${baseUrl}/buku/${idBuku}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stok: -5 }),
      });
      const body = await readJson(response);

      record(
        "Menolak PATCH dengan stok negatif",
        `PATCH /buku/${idBuku}`,
        400,
        response.status,
        body.success === false,
        body.message ?? "Stok negatif ditolak",
      );
    }

    // 19. Menghapus buku yang telah dibuat.
    if (idBuku !== undefined) {
      const response = await fetch(`${baseUrl}/buku/${idBuku}`, {
        method: "DELETE",
      });

      record(
        "Menghapus buku berdasarkan ID",
        `DELETE /buku/${idBuku}`,
        204,
        response.status,
        response.status === 204,
        "Endpoint mengembalikan HTTP 204",
      );
    }

    // 20. Memastikan buku yang dihapus tidak ditemukan.
    if (idBuku !== undefined) {
      const response = await fetch(`${baseUrl}/buku/${idBuku}`);
      const body = await readJson(response);

      record(
        "Memastikan buku yang dihapus sudah tidak tersedia",
        `GET /buku/${idBuku}`,
        404,
        response.status,
        body.success === false,
        body.message ?? "Buku sudah tidak ditemukan",
      );
    }
  } finally {
    // Membersihkan data uji agar database kembali seperti semula.
    await prisma.buku.deleteMany({
      where: {
        judul: {
          in: [JUDUL_UJI, `${JUDUL_UJI} Terupdate`, JUDUL_UJI_PATCH],
        },
      },
    });

    if (server) {
      await new Promise<void>((resolve, reject) => {
        server!.close((error) => (error ? reject(error) : resolve()));
      });
    }
  }

  const jumlahAkhir = await prisma.buku.count();
  const totalLulus = results.filter((item) => item.status === "PASS").length;
  const totalGagal = results.filter((item) => item.status === "FAIL").length;

  console.log(
    "\n==============================================================",
  );
  console.log(`HASIL PENGUJIAN: ${totalLulus}/${results.length} LULUS`);
  console.log(`GAGAL: ${totalGagal}`);
  console.log(`Jumlah data awal: ${jumlahAwal}`);
  console.log(`Jumlah data akhir: ${jumlahAkhir}`);
  console.log("==============================================================");

  if (jumlahAwal !== jumlahAkhir) {
    console.error("PERINGATAN: Jumlah data buku berubah setelah pengujian.");
    process.exitCode = 1;
  }

  if (totalGagal > 0) {
    process.exitCode = 1;
  }
}

runAllTests()
  .catch((error) => {
    console.error("Pengujian gagal dijalankan:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
