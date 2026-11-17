/**
 * ============================================================
 * Tugas 2 — HTTP Server Sederhana (Tanpa Express.js)
 * ============================================================
 */

import http from "node:http";
import path from "node:path";
import { readFile } from "node:fs/promises";
import { getConfig } from "./config.js";

// Mengambil konfigurasi dari config.js
const config = getConfig();

// Helper untuk mengirim response JSON agar lebih bersih dan rapi
const sendJSON = (res, statusCode, data) => {
    res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(data, null, 2));
};

// Membuat HTTP Server
const server = http.createServer(async (req, res) => {
    const url = req.url;
    const method = req.method;

    // 1. Endpoint GET / (Beranda utama)
    if (url === "/" && method === "GET") {
        return sendJSON(res, 200, {
            success: true,
            message: `Selamat datang di ${config.appName}`,
            courseCode: config.courseCode,
            environment: config.environment
        });
    }

    // 2. Endpoint GET /health (Pemeriksaan kesehatan server)
    if (url === "/health" && method === "GET") {
        return sendJSON(res, 200, {
            success: true,
            status: "OK",
            environment: config.environment,
            timestamp: new Date().toISOString()
        });
    }

    // 3. Endpoint GET /students (Membaca file asynchronous dari folder data/mahasiswa.json)
    if (url === "/students" && method === "GET") {
        try {
            const filePath = path.join(import.meta.dirname, "data", "mahasiswa.json");
            const fileData = await readFile(filePath, "utf8");
            const mahasiswa = JSON.parse(fileData);

            return sendJSON(res, 200, {
                success: true,
                courseCode: config.courseCode,
                total: mahasiswa.length,
                data: mahasiswa
            });
        } catch (error) {
            // Penanganan error jika file gagal dibaca / tidak ditemukan
            return sendJSON(res, 500, {
                success: false,
                message: "Gagal membaca data mahasiswa.",
                error: error.message
            });
        }
    }

    // 4. Response 404 untuk endpoint yang tidak tersedia
    return sendJSON(res, 404, {
        success: false,
        message: `Endpoint ${method} ${url} tidak ditemukan.`
    });
});

// Menjalankan server pada port yang ditentukan
server.listen(config.port, () => {
    console.log(`${config.appName} berjalan di http://localhost:${config.port}`);
    console.log(`COURSE_CODE aktif: ${config.courseCode}`);
});