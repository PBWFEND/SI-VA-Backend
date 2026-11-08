import express, { type Request, type Response } from "express";
import { prisma } from "./client.ts";
import { bukuRoutes } from "./src/routes/buku.routes.ts";

const app = express();

// Menonaktifkan informasi Express pada response
app.disable("x-powered-by");

// Middleware JSON parser
app.use(express.json());

// Middleware logger
app.use((request: Request, _response: Response, next) => {
  console.log(
    `[${new Date().toISOString()}] ${request.method} ${request.originalUrl}`
  );
  next();
});

// Endpoint informasi API
app.get("/", (_request: Request, response: Response) => {
  response.status(200).json({
    success: true,
    message: "API Sistem Informasi Perpustakaan",
    data: {
      resource: "buku",
      endpoints: [
        "GET /buku",
        "GET /buku/:id",
        "POST /buku",
        "PATCH /buku/:id",
        "DELETE /buku/:id",
      ],
    },
  });
});

// Endpoint health check
app.get("/health", (_request: Request, response: Response) => {
  response.status(200).json({
    success: true,
    message: "API berjalan",
    data: {
      status: "up",
    },
  });
});

// Routes buku
app.use("/buku", bukuRoutes);

// Middleware 404
app.use((_request: Request, response: Response) => {
  response.status(404).json({
    success: false,
    message: "Endpoint tidak ditemukan",
  });
});

// Middleware error handler
app.use(
  (
    error: Error,
    _request: Request,
    response: Response,
    _next: express.NextFunction
  ) => {
    console.error("Kesalahan aplikasi:", error.message);

    response.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
);

export { app, prisma };