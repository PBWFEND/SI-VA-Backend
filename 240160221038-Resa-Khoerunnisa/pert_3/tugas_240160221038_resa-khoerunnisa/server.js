/**
 * Tugas 2 — HTTP Server Node.js
 * Tanpa Express.js
 */

import http from "node:http";
import { readFile } from "node:fs/promises";
import { APP_NAME, PORT, COURSE_CODE } from "./config.js";

// Helper untuk mengirim response JSON
const sendJSON = (response, statusCode, payload) => {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
  });

  response.end(JSON.stringify(payload, null, 2));
};

// Membaca data mahasiswa dari file JSON
const bacaStudents = async () => {
  const data = await readFile("./data/students.json", "utf8");
  return JSON.parse(data);
};

// Membuat HTTP Server
const server = http.createServer(async (request, response) => {
  const { method, url } = request;

  console.log(`[${new Date().toISOString()}] ${method} ${url}`);

  // GET /
  if (method === "GET" && url === "/") {
    return sendJSON(response, 200, {
      success: true,
      message: `Selamat datang di ${APP_NAME}`,
      course_code: COURSE_CODE,
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
      const students = await bacaStudents();

      return sendJSON(response, 200, {
        success: true,
        data: students,
      });
    } catch (error) {
      return sendJSON(response, 500, {
        success: false,
        message: "Gagal membaca data mahasiswa",
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
  console.log(`${APP_NAME} berjalan di http://localhost:${PORT}`);
});