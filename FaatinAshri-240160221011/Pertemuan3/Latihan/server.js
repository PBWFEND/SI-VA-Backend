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
 *   curl http://localhost:3003/healt
 *   curl http://localhost:3003/tidak-ada
 *
 * Hentikan server dengan Ctrl+C.
 */

import http from "node:http";
import { APP_NAME, PORT, COURSE_CODE } from "./config.js";
import path from "node:path";
import { readFile } from "node:fs/promises";


const sendJSON = (response, statusCode, payload) => {
  response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload, null, 2));
};

const bacaJSON = async (namaFile) => {
  try {
    const lokasiFile = path.join(import.meta.dirname, namaFile);
    const isi = await readFile(lokasiFile, "utf8");
    return JSON.parse(isi);
  } catch (error) {
    console.error("File gagal dibaca:", error.message);
    return null;
  }
};

const server = http.createServer(async (request, response) => {
  const { method, url } = request;
  console.log(`[${new Date().toISOString()}] ${method} ${url}`);

  if (method === "GET" && url === "/") {
    return sendJSON(response, 200, {
      success: true,
      message: `Selamat datang di ${APP_NAME}`,
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

if (method === "GET" && url === "/students") {
    const students = await bacaJSON("data/students.json");

    if (!students) {
      return sendJSON(response, 500, {
        success: false,
        message: "Data mahasiswa gagal dibaca",
      });
    }

    return sendJSON(response, 200, {
      success: true,
      courseCode: COURSE_CODE,
      data: students,
    });
  }

  return sendJSON(response, 404, {
    success: false,
    message: `Endpoint ${method} ${url} tidak ditemukan`,
  });
});

server.listen(PORT, () => {
  console.log(`${APP_NAME} berjalan di http://localhost:${PORT}`);
});
