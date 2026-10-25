/**
 * Pertemuan 4 — Express.js Dasar: konfigurasi aplikasi
 * Tujuan: membuat Express app yang dapat diuji tanpa membuka port.
 * Jalankan: node app.js
 */

import express from "express";

const app = express();
app.disable("x-powered-by");
const mahasiswa = [
    { nim: "F1D022001", nama: "Jhon Doe" },
    { nim: "F1D022002", nama: "Ani Lestari" },
];

app.use(express.json());

app.use((request, response, next) => {
    console.log(`[${new Date().toISOString()}] ${request.method} ${request.originalUrl}`);
    next();
});

app.get("/", (request, response) => {
    response.json({
        success: true,
        message: "API Pertemuan 4 dengan Express.js",
        endpoints: ["GET /", "GET /health", "GET /mahasiswa", "POST /mahasiswa"],
    });
});

app.get("/health", (request, response) => {
    response.status(200).json({ success: true, status: "up" });
});

app.get("/mahasiswa", (request, response) => {
    response.status(200).json({
        success: true,
        total: mahasiswa.length,
        data: mahasiswa,
    });
});

app.post("/mahasiswa", (request, response) => {
    const { nim, nama } = request.body;

    if (!nim || !nama) {
        return response.status(400).json({
            success: false,
            message: "Field nim dan nama wajib diisi",
        });
    }

    const baru = { nim, nama };
    mahasiswa.push(baru);
    return response.status(201).json({ success: true, data: baru });
});

app.use((request, response) => {
    response.status(404).json({
        success: false,
        message: `Endpoint ${request.method} ${request.originalUrl} tidak ditemukan`,
    });
});

app.use((error, request, response, next) => {
    console.error("Kesalahan aplikasi:", error.message);
    response.status(500).json({ success: false, message: "Terjadi kesalahan pada server" });
});

export default app;