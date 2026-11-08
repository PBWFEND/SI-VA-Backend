
import express from "express";
import absensiRoutes from "./src/routes/absensi.routes.js";

const app = express();

app.disable("x-powered-by");
app.use(express.json());

// Middleware logger
app.use((request, response, next) => {
  console.log(
    `[${new Date().toISOString()}] ${request.method} ${request.originalUrl}`
  );
  next();
});

// Halaman utama
app.get("/", (_request, response) => {
  return response.status(200).json({
    success: true,
    message: "REST API Absensi Organisasi - Tugas 5",
    endpoints: [
      "GET /absensi",
      "GET /absensi/:id",
      "POST /absensi",
      "PATCH /absensi/:id",
      "DELETE /absensi/:id",
    ],
  });
});

// Health check
app.get("/health", (_request, response) => {
  return response.status(200).json({
    success: true,
    message: "API berjalan",
    data: { status: "up" },
  });
});

// Routes absensi
app.use("/absensi", absensiRoutes);

// Middleware 404
app.use((_request, response) => {
  return response.status(404).json({
    success: false,
    message: "Endpoint tidak ditemukan",
  });
});

// Error handler
app.use((error, request, response, next) => {
  console.error("================================");
  console.error("ERROR DETAIL:", error);
  console.error("ERROR MESSAGE:", error.message);
  console.error("ERROR STACK:", error.stack);
  console.error("================================");

  if (response.headersSent) {
    return next(error);
  }

  return response.status(500).json({
    success: false,
    message: "Terjadi kesalahan pada server",
    error: error.message,
  });
});

// WAJIB ADA: export default app
export default app;
