/**
 * ============================================================
 * Latihan Individu Pertemuan 1 — API Mahasiswa
 * ============================================================
 * Jalankan dengan:
 *   node latihan.js
 *
 * Uji dengan browser (GET) dan curl (POST):
 *   curl -X POST http://localhost:3001/mahasiswa \
 *     -H "Content-Type: application/json" \
 *     -d '{"nim":"F1D022099","nama":"Nama Anda"}'
 */

const http = require("node:http");

const PORT = 3001;

const mahasiswa = [
  { nim: "240160221044", nama: "Sandika Yusuf Permana" },
  { nim: "240160221028", nama: "Erinda Aprilianti" },
];

function sendJSON(res, statusCode, payload) {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(payload, null, 2));
}

function readBody(req) {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve(null);
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  const { method, url } = req;
  console.log(`${method} ${url}`);

  // =========================================================
  // Endpoint GET /about
  // Kembalikan status 200 dengan JSON:
  //   { success: true, message: "API Pertemuan 1", author: "<NAMA_ANDA>" }
  // =========================================================
  if (method === "GET" && url === "/about") {
    return sendJSON(res, 200, {
      success: true,
      message: "API Pertemuan 1",
      author: "Mahasiswa",
    });
  }

  // =========================================================
  // Endpoint POST /mahasiswa (Create)
  // Langkah:
  //   a. Baca body dengan readBody(req)
  //   b. Jika body kosong / tidak ada 'nim' / tidak ada 'nama'
  //      → balas 400 dengan pesan yang jelas
  //   c. Jika valid → push ke array mahasiswa, balas 201
  //      beserta data yang baru dibuat
  // =========================================================
  if (method === "POST" && url === "/mahasiswa") {
    const body = await readBody(req);
    const { nim, nama } = body || {};

    if (!nim || !nama) {
      return sendJSON(res, 400, {
        success: false,
        message: "Field 'nim' dan 'nama' wajib diisi",
      });
    }

    const baru = { nim, nama };
    mahasiswa.push(baru);
    return sendJSON(res, 201, {
      success: true,
      message: "Mahasiswa berhasil ditambahkan",
      data: baru,
    });
  }

  // =========================================================
  // Endpoint GET /mahasiswa (Read semua)
  // Kembalikan 200 berisi seluruh isi array mahasiswa.
  // =========================================================
  if (method === "GET" && url === "/mahasiswa") {
    return sendJSON(res, 200, {
      success: true,
      total: mahasiswa.length,
      data: mahasiswa,
    });
  }

  // =========================================================
  // Prediksi & uji (tidak perlu kode)
  // Tanpa menjalankan dulu, tulis jawaban Anda untuk:
  //   a. PUT /mahasiswa dengan body {"nama": "Siapa"} → status apa? mengapa?
  //   b. DELETE /mahasiswa/1 → status apa? mengapa?
  //   c. GET /mahasiswa/99 → status apa? mengapa?
  // Setelah itu uji dengan curl/browser dan bandingkan!
  // =========================================================

  // Selain endpoint di atas → 404
  return sendJSON(res, 404, {
    success: false,
    message: `Endpoint ${method} ${url} tidak ditemukan`,
  });
});

server.listen(PORT, () => {
  console.log(`Latihan berjalan di http://localhost:${PORT}`);
  console.log("Kerjakan semua TODO 1-4, lalu uji setiap endpoint.");
});