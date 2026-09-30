import http from "node:http";
import { APP_NAME, PORT } from "./config.js";
import { readFile } from "node:fs/promises";
import path from "node:path";

const fileMahasiswa = path.join(import.meta.dirname, "data", "mahasiswa.json");

const sendJSON = (response, statusCode, payload) => {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
  });

  response.end(JSON.stringify(payload, null, 2));
};

const server = http.createServer(async (request, response) => {
  const { method, url } = request;

  console.log(`[${new Date().toISOString()}] ${method} ${url}`);

  if (method === "GET" && url === "/ ") {
    return sendJSON(response, 200, {
      success: true,
      message: `Selamat datang di ${APP_NAME}`,
      endpoints: ["GET /", "GET /health", "GET /mahasiswa"],
    });
  }

  if (method === "GET" && url === "/health") {
    return sendJSON(response, 200, {
      success: true,
      status: "up",
      node: process.version,
    });
  }

  if (method === "GET" && url === "/mahasiswa") {
    try {
      const data = await readFile(fileMahasiswa, "utf8");
      const mahasiswa = JSON.parse(data);

      return sendJSON(response, 200, {
        success: true,
        data: mahasiswa,
      });
    } catch (error) {
      return sendJSON(response, 500, {
        success: false,
        message: "Gagal membaca data mahasiswa",
      });
    }
  }

  return sendJSON(response, 404, {
    success: false,
    message: `Endpoint ${method} ${url} tidak ditemukan`,
  });
});

server.listen(PORT, () => {
  console.log(`${APP_NAME} berjalan di http://localhost:${PORT}`);
});
