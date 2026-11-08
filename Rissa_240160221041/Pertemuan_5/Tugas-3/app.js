import express from 'express';

const app = express();

// Disable header X-Powered-By demi keamanan
app.disable('x-powered-by');

// 1. Middleware JSON Parser
app.use(express.json());

// 2. Middleware Logger (Method & URL)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Data Sementara (In-Memory Data Resource Buku)
let dataBuku = [
  { id: 1, judul: "Laskar Pelangi", penulis: "Andrea Hirata", kategori: "Novel", tersedia: true, tahunTerbit: 2005 },
  { id: 2, judul: "Bumi", penulis: "Tere Liye", kategori: "Novel", tersedia: false, tahunTerbit: 2014 },
  { id: 3, judul: "Filosofi Teras", penulis: "Henry Manampiring", kategori: "Pengembangan Diri", tersedia: true, tahunTerbit: 2018 }
];

// Helper Response JSON Konsisten
const sendResponse = (res, statusCode, success, message, data = null) => {
  const responseBody = { success, message };
  if (data !== null) responseBody.data = data;
  return res.status(statusCode).json(responseBody);
};

// ---------------------------------------------------------
// ENDPOINTS
// ---------------------------------------------------------

// Endpoint 1: GET /buku (Collection - Filter dengan 2 Query Parameter: kategori & tersedia)
app.get('/buku', (req, res) => {
  const { kategori, tersedia } = req.query;

  let filtered = [...dataBuku];

  // Query Parameter 1: Filter berdasarkan kategori
  if (kategori !== undefined) {
    filtered = filtered.filter(b => b.kategori.toLowerCase() === String(kategori).toLowerCase());
  }

  // Query Parameter 2: Filter berdasarkan ketersediaan (true/false)
  if (tersedia !== undefined) {
    const isTersedia = tersedia === 'true';
    filtered = filtered.filter(b => b.tersedia === isTersedia);
  }

  return sendResponse(res, 200, true, "Berhasil mengambil daftar buku", filtered);
});

// Endpoint 2: GET /buku/:id (Detail Resource)
app.get('/buku/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const buku = dataBuku.find(b => b.id === id);

  if (!buku) {
    return sendResponse(res, 404, false, "Buku tidak ditemukan");
  }

  return sendResponse(res, 200, true, "Berhasil mengambil detail buku", buku);
});

// Endpoint 3: POST /buku (Create Resource)
app.post('/buku', (req, res) => {
  const { judul, penulis, kategori, tersedia, tahunTerbit } = req.body;

  // Validasi Input (Response 400)
  if (!judul || !penulis || !kategori) {
    return sendResponse(res, 400, false, "Atribut judul, penulis, dan kategori wajib diisi");
  }

  const bukuBaru = {
    id: dataBuku.length > 0 ? Math.max(...dataBuku.map(b => b.id)) + 1 : 1,
    judul,
    penulis,
    kategori,
    tersedia: tersedia !== undefined ? Boolean(tersedia) : true,
    tahunTerbit: tahunTerbit ? Number(tahunTerbit) : new Date().getFullYear()
  };

  dataBuku.push(bukuBaru);
  return sendResponse(res, 201, true, "Buku berhasil ditambahkan", bukuBaru);
});

// Endpoint 4: PUT /buku/:id (Full Update)
app.put('/buku/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = dataBuku.findIndex(b => b.id === id);

  if (index === -1) {
    return sendResponse(res, 404, false, "Buku tidak ditemukan");
  }

  const { judul, penulis, kategori, tersedia, tahunTerbit } = req.body;

  // Validasi Input Lengkap untuk Full Update
  if (!judul || !penulis || !kategori || tersedia === undefined || !tahunTerbit) {
    return sendResponse(res, 400, false, "Seluruh atribut (judul, penulis, kategori, tersedia, tahunTerbit) wajib diisi untuk PUT");
  }

  dataBuku[index] = {
    id,
    judul,
    penulis,
    kategori,
    tersedia: Boolean(tersedia),
    tahunTerbit: Number(tahunTerbit)
  };

  return sendResponse(res, 200, true, "Data buku berhasil diperbarui secara keseluruhan", dataBuku[index]);
});

// Endpoint 5: PATCH /buku/:id (Partial Update)
app.patch('/buku/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = dataBuku.findIndex(b => b.id === id);

  if (index === -1) {
    return sendResponse(res, 404, false, "Buku tidak ditemukan");
  }

  const { judul, penulis, kategori, tersedia, tahunTerbit } = req.body;

  // Cek apakah ada body yang dikirim
  if (Object.keys(req.body).length === 0) {
    return sendResponse(res, 400, false, "Setidaknya kirim satu atribut yang ingin diperbarui");
  }

  if (judul !== undefined) dataBuku[index].judul = judul;
  if (penulis !== undefined) dataBuku[index].penulis = penulis;
  if (kategori !== undefined) dataBuku[index].kategori = kategori;
  if (tersedia !== undefined) dataBuku[index].tersedia = Boolean(tersedia);
  if (tahunTerbit !== undefined) dataBuku[index].tahunTerbit = Number(tahunTerbit);

  return sendResponse(res, 200, true, "Data buku berhasil diperbarui sebagian", dataBuku[index]);
});

// Endpoint 6: DELETE /buku/:id (Delete - Response 204 No Content)
app.delete('/buku/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = dataBuku.findIndex(b => b.id === id);

  if (index === -1) {
    return sendResponse(res, 404, false, "Buku tidak ditemukan");
  }

  dataBuku.splice(index, 1);
  return res.status(204).send(); // Status 204 No Content
});

// ---------------------------------------------------------
// ERROR HANDLERS
// ---------------------------------------------------------

// Handler 404 untuk Route Tidak Ditemukan
app.use((req, res) => {
  sendResponse(res, 404, false, "Endpoint tidak ditemukan");
});

// Global Error Handler (500)
app.use((err, req, res, next) => {
  console.error(err.stack);
  sendResponse(res, 500, false, "Terjadi kesalahan pada internal server");
});

export default app;