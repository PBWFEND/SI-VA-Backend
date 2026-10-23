import http from "node:http";
import path from "node:path";
import { readFile } from "node:fs/promises";
import { APP_NAME, PORT } from "./config.js";

const sendJSON = (response, statusCode, payload) => {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
  });

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