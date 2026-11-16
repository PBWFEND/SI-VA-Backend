/**
 * ============================================================
 * Demo Pertemuan 3 — HTTP Server Node.js tanpa Express
 * ============================================================
 * Tujuan:
 *   1. Menggunakan module bawaan node:http.
 *   2. Membaca environment variable untuk konfigurasi port dan COURSE_CODE.
 *   3. Menyusun response JSON dengan routing sederhana.
 *   4. Menambahkan endpoint /students dengan fungsi bacaJSON (try/catch).
 */

import http from "node:http";
import { APP_NAME, PORT } from "./config.js";

// Tambahan: Environment variable COURSE_CODE dengan nilai default CPMK115
const COURSE_CODE = process.env.COURSE_CODE ?? "CPMK115";

// Tambahan: Function bacaJSON dengan try/catch
const bacaJSON = (namaFile) => {
  try {
    // Simulasi pembacaan data mahasiswa dengan aman
    if (namaFile === "students" || namaFile === "students.json") {
      return [
        { id: 1, nama: "Winda", nim: "240160221047" },
        { id: 2, nama: "Anzar", nim: "240160221048" }
      ];
    }
    // Jika file tidak ada, lempar error agar ditangkap oleh blok catch
    throw new Error(`File ${namaFile} tidak ditemukan`);
  } catch (error) {
    console.error(`[Error] ${error.message}`);
    return null;
  }
};

const sendJSON = (response, statusCode, payload) => {
  response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload, null, 2));
};

const server = http.createServer((request, response) => {
  const { method, url } = request;
  console.log(`[${new Date().toISOString()}] ${method} ${url} | COURSE_CODE: ${COURSE_CODE}`);

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
      courseCode: COURSE_CODE,
      node: process.version,
    });
  }

  // Tambahan: Endpoint GET /students
  if (method === "GET" && url === "/students") {
    const studentsData = bacaJSON("students");

    if (studentsData === null) {
      return sendJSON(response, 500, {
        success: false,
        message: "Gagal memaca data mahasiswa.",
      });
    }

    return sendJSON(response, 200, {
      success: true,
      courseCode: COURSE_CODE,
      data: studentsData,
    });
  }

  return sendJSON(response, 404, {
    success: false,
    message: `Endpoint ${method} ${url} tidak ditemukan`,
  });
});

server.listen(PORT, () => {
  console.log(`${APP_NAME} berjalan di http://localhost:${PORT}`);
  console.log(`COURSE_CODE aktif: ${COURSE_CODE}`);
});