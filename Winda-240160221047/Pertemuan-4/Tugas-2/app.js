/**
 * Tugas 2 — REST Endpoint dengan Express.js (Resource: Buku)
 * Author: Winda - 240160221047
 */

import express from "express";

const app = express();
app.disable("x-powered-by");

// Data dummy untuk resource buku
let bukuList = [
    { id: 1, judul: "Belajar Node.js", penulis: "Winda", tersedia: true },
    { id: 2, judul: "Dasar Express.js", penulis: "Anzar", tersedia: false },
];

// 1. Middleware JSON Parser
app.use(express.json());

// 2. Middleware Logger Sederhana
app.use((request, response, next) => {
    console.log(`[${new Date().toISOString()}] ${request.method} ${request.originalUrl}`);
    next();
});

// Endpoint Utama / Root
app.get("/", (request, response) => {
    response.json({
        success: true,
        message: "API Tugas 2 — REST Endpoint Express.js",
        endpoints: [
            "GET /api/buku (Daftar buku & Query ?tersedia=true/false)",
            "GET /api/buku/:id (Detail buku berdasarkan ID)",
            "POST /api/buku (Tambah buku baru)",
            "DELETE /api/buku/:id (Hapus buku berdasarkan ID)"
        ],
    });
});

// Endpoint Health Check
app.get("/health", (request, response) => {
    response.status(200).json({ success: true, status: "up" });
});

// 3. Endpoint GET: Daftar buku (Mendukung Query Parameter ?tersedia=true/false)
app.get("/api/buku", (request, response) => {
    let hasil = bukuList;
    const { tersedia } = request.query;
    
    if (tersedia !== undefined) {
        const isTersedia = tersedia === 'true';
        hasil = bukuList.filter(b => b.tersedia === isTersedia);
    }

    response.status(200).json({
        success: true,
        total: hasil.length,
        data: hasil,
    });
});

// 4. Endpoint GET: Detail buku berdasarkan ID (Route Parameter)
app.get("/api/buku/:id", (request, response, next) => {
    const id = parseInt(request.params.id);
    const buku = bukuList.find(b => b.id === id);

    if (!buku) {
        const error = new Error("Buku tidak ditemukan");
        error.status = 404;
        return next(error);
    }

    response.status(200).json({
        success: true,
        data: buku,
    });
});

// 5. Endpoint POST: Menambahkan buku baru dengan validasi
app.post("/api/buku", (request, response, next) => {
    const { judul, penulis, tersedia } = request.body;

    if (!judul || !penulis) {
        const error = new Error("Field 'judul' dan 'penulis' wajib diisi!");
        error.status = 400;
        return next(error);
    }

    const bukuBaru = {
        id: bukuList.length > 0 ? bukuList[bukuList.length - 1].id + 1 : 1,
        judul,
        penulis,
        tersedia: tersedia !== undefined ? tersedia : true
    };

    bukuList.push(bukuBaru);
    return response.status(201).json({ 
        success: true, 
        message: "Buku berhasil ditambahkan",
        data: bukuBaru 
    });
});

// 6. Endpoint DELETE: Menghapus buku berdasarkan ID
app.delete("/api/buku/:id", (request, response, next) => {
    const id = parseInt(request.params.id);
    const index = bukuList.findIndex(b => b.id === id);

    if (index === -1) {
        const error = new Error("Buku yang akan dihapus tidak ditemukan");
        error.status = 404;
        return next(error);
    }

    const bukuDihapus = bukuList.splice(index, 1);
    response.status(200).json({
        success: true,
        message: "Buku berhasil dihapus",
        data: bukuDihapus[0]
    });
});

// 7. Handler 404 (Endpoint tidak ditemukan)
app.use((request, response) => {
    response.status(404).json({
        success: false,
        message: `Endpoint ${request.method} ${request.originalUrl} tidak ditemukan`,
    });
});

// 8. Error Handling Middleware
app.use((error, request, response, next) => {
    console.error("Kesalahan aplikasi:", error.message);
    const statusCode = error.status || 500;
    response.status(statusCode).json({ 
        success: false, 
        message: error.message || "Terjadi kesalahan pada server" 
    });
});

export default app;