/**
 * ============================================================
 * Demo Pertemuan 3 — HTTP Server Node.js tanpa Express
 * ============================================================
 * Tujuan:
 *   1. Menggunakan module bawaan node:http.
 *   2. Membaca environment variable.
 *   3. Menyusun response JSON dengan routing sederhana.
 *   4. Menambahkan endpoint GET /students.
 *
 * Jalankan:
 *   node server.js
 */

import http from "node:http";
import { APP_NAME, PORT, COURSE_CODE } from "./config.js";

const sendJSON = (response, statusCode, payload) => {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
  });

  response.end(JSON.stringify(payload, null, 2));
};

// Data mahasiswa
const students = [
  {
    id: 1,
    nama: "Resa Khoerunnisa",
    nim: "240160221038",
    prodi: "Sistem Informasi",
  },
  {
    id: 2,
    nama: "Andi",
    nim: "240160221039",
    prodi: "Sistem Informasi",
  },
  {
    id: 3,
    nama: "Siti",
    nim: "240160221040",
    prodi: "Sistem Informasi",
  },
];

const server = http.createServer((request, response) => {
  const { method, url } = request;

  console.log(`[${new Date().toISOString()}] ${method} ${url}`);

  // GET /
  if (method === "GET" && url === "/") {
    return sendJSON(response, 200, {
      success: true,
      message: `Selamat datang di ${APP_NAME}`,
      course_code: COURSE_CODE,
      endpoints: ["GET /", "GET /health", "GET /students"],
    });
  }

  // GET /health
  if (method === "GET" && url === "/health") {
    return sendJSON(response, 200, {
      success: true,
      status: "up",
      node: process.version,
    });
  }

  // GET /students
  if (method === "GET" && url === "/students") {
    return sendJSON(response, 200, students);
  }

  // Endpoint tidak ditemukan
  return sendJSON(response, 404, {
    success: false,
    message: `Endpoint ${method} ${url} tidak ditemukan`,
  });
});

server.listen(PORT, () => {
  console.log(`${APP_NAME} berjalan di http://localhost:${PORT}`);
});