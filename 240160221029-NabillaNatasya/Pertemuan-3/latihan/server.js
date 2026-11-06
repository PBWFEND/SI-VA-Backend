/**
 * ============================================================
 * Demo Pertemuan 3 — HTTP Server Node.js tanpa Express
 * ============================================================
 * Tujuan:
 *   1. Menggunakan module bawaan node:http.
 *   2. Membaca environment variable untuk konfigurasi port.
 *   3. Menyusun response JSON dengan routing sederhana.
 *
 * Jalankan:
 *   node server.js
 *
 * Uji pada terminal lain:
 *   curl http://localhost:3003/
 *   curl http://localhost:3003/health
 *   curl http://localhost:3003/students
 *   curl http://localhost:3003/tidak-ada
 *
 * Hentikan server dengan Ctrl+C.
 */

import http from "node:http";
import path from "node:path";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { APP_NAME, PORT, COURSE_CODE } from "./config.js";

// Menentukan lokasi folder server.js
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sendJSON = (response, statusCode, payload) => {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(payload, null, 2));
};

// Tambahan: membaca file JSON
const bacaJSON = async (namaFile) => {
  try {
    const lokasiFile = path.join(__dirname, namaFile);
    const isiFile = await readFile(lokasiFile, "utf8");

    return JSON.parse(isiFile);
  } catch (error) {
    if (error.code === "ENOENT") {
      console.error(`File ${namaFile} tidak ditemukan.`);
    }

    throw error;
  }
};

const server = http.createServer(async (request, response) => {
  const { method, url } = request;
  console.log(`[${new Date().toISOString()}] ${method} ${url}`);

  if (method === "GET" && url === "/") {
    return sendJSON(response, 200, {
      success: true,
      message: `Selamat datang di ${APP_NAME}`,
      courseCode: COURSE_CODE,
      endpoints: ["GET /", "GET /health", "GET /students"],
    });
  }

  if (method === "GET" && url === "/health") {
    return sendJSON(response, 200, {
      success: true,
      status: "up",
      node: process.version,
    });
  }

  // Tambahan: endpoint GET /students
  if (method === "GET" && url === "/students") {
    try {
      const students = await bacaJSON("students.json");

      if (!Array.isArray(students)) {
        return sendJSON(response, 500, {
          success: false,
          message: "Data mahasiswa harus berupa array.",
        });
      }

      return sendJSON(response, 200, {
        success: true,
        total: students.length,
        data: students,
      });
    } catch (error) {
      return sendJSON(response, 500, {
        success: false,
        message: "Gagal membaca data mahasiswa.",
      });
    }
  }

  // Kode asli dosen: menangani endpoint yang tidak ditemukan
  return sendJSON(response, 404, {
    success: false,
    message: `Endpoint ${method} ${url} tidak ditemukan`,
  });
});

server.listen(PORT, () => {
  console.log(`${APP_NAME} berjalan di http://localhost:${PORT}`);
});