import http from "node:http";
import { PORT } from "./config.js";
import { sendJSON } from "./response.js";

const server = http.createServer((request, response) => {
  const { method, url } = request;

  if (method === "GET" && url === "/") {
    return sendJSON(response, 200, {
      success: true,
      message: "Server berjalan",
    });
  }

  if (method === "GET" && url === "/health") {
    return sendJSON(response, 200, {
      success: true,
      status: "up",
    });
  }

  return sendJSON(response, 404, {
    success: false,
    message: `Endpoint ${method} ${url} tidak ditemukan`,
  });
});

server.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});