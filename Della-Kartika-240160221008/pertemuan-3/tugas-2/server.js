/**
 * Pertemuan 3 — Tugas 2
 * Sistem Informasi Absensi
 * Node.js HTTP Server tanpa Express.js
 */

import http from "node:http";
import path from "node:path";
import { readFile } from "node:fs/promises";
import { APP_NAME, PORT, NODE_ENV } from "./config.js";

// Helper untuk mengirim response JSON
const sendJSON = (response, statusCode, payload) => {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
  });

  response.end(JSON.stringify(payload, null, 2));
};

// Function untuk membaca file JSON
const bacaJSON = async (namaFile) => {
  const filePath = path.join(import.meta.dirname, namaFile);

  const isiFile = await readFile(filePath, "utf8");

  return JSON.parse(isiFile);
};

// Membuat HTTP Server
const server = http.createServer(async (request, response) => {
  const { method, url } = request;

  console.log(
    `[${new Date().toISOString()}] ${method} ${url}`
  );

  // GET /
  if (method === "GET" && url === "/") {
    return sendJSON(response, 200, {
      success: true,
      message: `Selamat datang di ${APP_NAME}`,
      environment: NODE_ENV,
      endpoints: [
        "GET /",
        "GET /health",
        "GET /students",
      ],
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
    try {
      const students = await bacaJSON("data/students.json");

      return sendJSON(response, 200, {
        success: true,
        data: students,
      });
    } catch (error) {
      console.error(
        "Gagal membaca data students:",
        error.message
      );

      return sendJSON(response, 500, {
        success: false,
        message: "Gagal membaca data students",
      });
    }
  }

  // Endpoint tidak ditemukan
  return sendJSON(response, 404, {
    success: false,
    message: `Endpoint ${method} ${url} tidak ditemukan`,
  });
});

// Menjalankan server
server.listen(PORT, () => {
  console.log(
    `${APP_NAME} berjalan di http://localhost:${PORT}`
  );
});