import { app } from "./latihan.ts";
import { prisma } from "./client.ts";

async function runTests() {
  console.log("=== MEMULAI PENGUJIAN INTEGRASI API PENGGUNA ===");
  
  // Bersihkan data pengguna sebelum uji
  await prisma.pengguna.deleteMany({});
  console.log("[Setup] Database pengguna dibersihkan.");

  const server = app.listen(0);
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Gagal menginisialisasi test server");
  }
  const port = address.port;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`[Setup] Server pengujian berjalan pada port ${port}`);

  let passedTests = 0;
  let totalTests = 0;

  const assert = (condition: boolean, testName: string, detail?: unknown) => {
    totalTests++;
    if (condition) {
      console.log(`✔ [PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`✖ [FAIL] ${testName}`, detail ?? "");
    }
  };

  try {
    // 1. GET / (Health / Info endpoint)
    {
      const res = await fetch(`${baseUrl}/`);
      const body = await res.json() as any;
      assert(res.status === 200 && body.success === true, "GET / - Status 200 & info resource pengguna", body);
    }

    // 2. GET /pengguna (Kondisi awal kosong)
    {
      const res = await fetch(`${baseUrl}/pengguna`);
      const body = await res.json() as any;
      assert(res.status === 200 && Array.isArray(body.data) && body.data.length === 0, "GET /pengguna (Awal) - Status 200 & data kosong", body);
    }

    // 3. POST /pengguna (Validasi: Data tidak lengkap / 400 Bad Request)
    {
      const res = await fetch(`${baseUrl}/pengguna`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nim: "240160221001" }), // missing nama & email
      });
      const body = await res.json() as any;
      assert(res.status === 400 && body.success === false, "POST /pengguna (Field kurang) - Status 400 Bad Request", body);
    }

    // 4. POST /pengguna (Validasi: Format email salah / 400 Bad Request)
    {
      const res = await fetch(`${baseUrl}/pengguna`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nim: "240160221001",
          nama: "Aldi Restu Fauzi",
          email: "bukan-email-valid",
        }),
      });
      const body = await res.json() as any;
      assert(res.status === 400 && body.success === false, "POST /pengguna (Email invalid) - Status 400 Bad Request", body);
    }

    // 5. POST /pengguna (TODO 2 & TODO 3: Berhasil membuat pengguna / 201 Created)
    let createdPengguna: any = null;
    {
      const res = await fetch(`${baseUrl}/pengguna`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nim: "240160221001",
          nama: "Aldi Restu Fauzi",
          email: "aldi@example.com",
          role: "mahasiswa",
        }),
      });
      const body = await res.json() as any;
      createdPengguna = body.data;
      assert(
        res.status === 201 &&
        body.success === true &&
        body.data.nim === "240160221001" &&
        body.data.role === "mahasiswa",
        "POST /pengguna (Valid) - Status 201 Created & data sesuai",
        body
      );
    }

    // 6. POST /pengguna (Duplikasi NIM / 409 Conflict)
    {
      const res = await fetch(`${baseUrl}/pengguna`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nim: "240160221001",
          nama: "Aldi Lain",
          email: "aldi2@example.com",
        }),
      });
      const body = await res.json() as any;
      assert(res.status === 409 && body.success === false, "POST /pengguna (Duplikasi NIM) - Status 409 Conflict", body);
    }

    // 7. POST /pengguna (Duplikasi Email / 409 Conflict)
    {
      const res = await fetch(`${baseUrl}/pengguna`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nim: "240160221099",
          nama: "Pengguna Baru",
          email: "adli@example.com", // email sudah ada
        }),
      });
      const body = await res.json() as any;
      assert(res.status === 409 && body.success === false, "POST /pengguna (Duplikasi Email) - Status 409 Conflict", body);
    }

    // 8. GET /pengguna (TODO 1: Mengambil daftar pengguna / 200 OK)
    {
      const res = await fetch(`${baseUrl}/pengguna`);
      const body = await res.json() as any;
      assert(
        res.status === 200 &&
        Array.isArray(body.data) &&
        body.data.length === 1 &&
        body.data[0].nim === "240160221001",
        "GET /pengguna - Status 200 OK & menampilkan data pengguna",
        body
      );
    }

    // 9. GET /pengguna?nim=240160221001 (TODO 1: Filter NIM cocok / 200 OK)
    {
      const res = await fetch(`${baseUrl}/pengguna?nim=240160221001`);
      const body = await res.json() as any;
      assert(
        res.status === 200 &&
        Array.isArray(body.data) &&
        body.data.length === 1 &&
        body.data[0].nim === "240160221001",
        "GET /pengguna?nim=... - Status 200 OK & filter NIM sesuai",
        body
      );
    }

    // 10. GET /pengguna?nim=999999999999 (TODO 1: Filter NIM tidak ditemukan / 200 OK & kosong)
    {
      const res = await fetch(`${baseUrl}/pengguna?nim=999999999999`);
      const body = await res.json() as any;
      assert(
        res.status === 200 &&
        Array.isArray(body.data) &&
        body.data.length === 0,
        "GET /pengguna?nim=999999999999 - Status 200 OK & hasil kosong",
        body
      );
    }

    // 11. GET /pengguna/:nim (Detail pengguna ada / 200 OK)
    {
      const res = await fetch(`${baseUrl}/pengguna/240160221001`);
      const body = await res.json() as any;
      assert(
        res.status === 200 &&
        body.success === true &&
        body.data.nim === "240160221001",
        "GET /pengguna/:nim - Status 200 OK & detail data sesuai",
        body
      );
    }

    // 12. GET /pengguna/:nim (Detail tidak ada / 404 Not Found)
    {
      const res = await fetch(`${baseUrl}/pengguna/999999999999`);
      const body = await res.json() as any;
      assert(
        res.status === 404 &&
        body.success === false,
        "GET /pengguna/:nim (Tidak Ada) - Status 404 Not Found",
        body
      );
    }

    // 13. DELETE /pengguna/:nim (TODO 4: Hapus pengguna yang ada / 204 No Content)
    {
      const res = await fetch(`${baseUrl}/pengguna/240160221001`, {
        method: "DELETE",
      });
      assert(res.status === 204, "DELETE /pengguna/:nim (Ada) - Status 204 No Content");
    }

    // 14. DELETE /pengguna/:nim (TODO 4: Hapus yang sudah terhapus / tidak ada -> 404 Not Found)
    {
      const res = await fetch(`${baseUrl}/pengguna/240160221001`, {
        method: "DELETE",
      });
      const body = await res.json() as any;
      assert(
        res.status === 404 &&
        body.success === false,
        "DELETE /pengguna/:nim (Tidak Ada) - Status 404 Not Found",
        body
      );
    }

    // 15. Verifikasi database kembali bersih (0 baris)
    const countAkhir = await prisma.pengguna.count();
    assert(countAkhir === 0, "Verifikasi Database - 0 baris tersisa setelah pengujian");

    console.log(`\n=== HASIL: ${passedTests}/${totalTests} UJI BERHASIL ===`);
    if (passedTests !== totalTests) {
      process.exitCode = 1;
    }
  } finally {
    server.close();
    await prisma.$disconnect();
    process.exit(passedTests === totalTests ? 0 : 1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});

