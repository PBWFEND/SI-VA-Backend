import http from "node:http";
import { APP_NAME, PORT } from "./config.js";
import { readFile } from "node:fs/promises";
import path from "node:path";

const fileBuku = path.join(
  import.meta.dirname,
  "data",
  "buku.json"
);

const fileAnggota = path.join(
  import.meta.dirname,
  "data",
  "anggota.json"
);

const sendJSON = (response, statusCode, payload) => {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
  });

  response.end(JSON.stringify(payload, null, 2));
};

const server = http.createServer(async (request, response) => {
  const { method, url } = request;

  console.log(`[${new Date().toISOString()}] ${method} ${url}`);

  // GET /
  if (method === "GET" && url === "/") {
    return sendJSON(response, 200, {
      success: true,
      message: `Selamat datang di ${APP_NAME}`,
      endpoints: [
        "GET /",
        "GET /health",
        "GET /buku",
        "GET /anggota",
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

  // GET /buku
  if (method === "GET" && url === "/buku") {
    try {
      const data = await readFile(fileBuku, "utf8");
      const buku = JSON.parse(data);

      return sendJSON(response, 200, {
        success: true,
        data: buku,
      });
    } catch (error) {
      return sendJSON(response, 500, {
        success: false,
        message: "Gagal membaca data buku",
      });
    }
  }

  // GET /anggota
  if (method === "GET" && url === "/anggota") {
    try {
      const data = await readFile(fileAnggota, "utf8");
      const anggota = JSON.parse(data);

      return sendJSON(response, 200, {
        success: true,
        data: anggota,
      });
    } catch (error) {
      return sendJSON(response, 500, {
        success: false,
        message: "Gagal membaca data anggota",
      });
    }
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