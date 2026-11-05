import express from 'express';

const app = express();

// 1. Middleware JSON (Point 4)
app.use(express.json());

// 2. Middleware Logger (Point 4)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Data Sementara (In-Memory Data)
let dataBuku = [
  { id: 1, judul: "Laskar Pelangi", penulis: "Andrea Hirata", tersedia: true },
  { id: 2, judul: "Bumi", penulis: "Tere Liye", tersedia: false }
];

// 3. Endpoint 1: GET Daftar Buku (+ Query Parameter) (Point 3 & 5)
app.get('/buku', (req, res) => {
  const { tersedia } = req.query;
  if (tersedia !== undefined) {
    const isTersedia = tersedia === 'true';
    const filtered = dataBuku.filter(b => b.tersedia === isTersedia);
    return res.status(200).json({ success: true, data: filtered });
  }
  res.status(200).json({ success: true, data: dataBuku });
});

// 4. Endpoint 2: GET Detail Buku (+ Route Parameter) (Point 3 & 5)
app.get('/buku/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const buku = dataBuku.find(b => b.id === id);
  if (!buku) {
    return res.status(404).json({ success: false, message: "Buku tidak ditemukan" });
  }
  res.status(200).json({ success: true, data: buku });
});

// 5. Endpoint 3: POST Tambah Buku (Point 3)
app.post('/buku', (req, res) => {
  const { judul, penulis } = req.body;
  if (!judul || !penulis) {
    return res.status(400).json({ success: false, message: "Judul dan penulis wajib diisi" });
  }
  const bukuBaru = {
    id: dataBuku.length + 1,
    judul,
    penulis,
    tersedia: true
  };
  dataBuku.push(bukuBaru);
  res.status(201).json({ success: true, message: "Buku berhasil ditambahkan", data: bukuBaru });
});

// 6. Endpoint 4: DELETE Hapus Buku (Melengkapi syarat minimal 4 endpoint) (Point 3)
app.delete('/buku/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = dataBuku.findIndex(b => b.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Buku tidak ditemukan" });
  }
  const bukuDihapus = dataBuku.splice(index, 1);
  res.status(200).json({ success: true, message: "Buku berhasil dihapus", data: bukuDihapus[0] });
});

// 7. Handler 404 - Route Tidak Ditemukan (Point 7)
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Endpoint tidak ditemukan" });
});

// 8. Global Error Middleware (Point 7)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Terjadi kesalahan pada server" });
});

export default app;