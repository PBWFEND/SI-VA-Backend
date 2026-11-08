
import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { bukuRoutes } from "./src/routes/buku.routes.ts";
import { prisma } from "./client.ts";

const app = express();

app.disable("x-powered-by");
app.use(express.json());

app.get("/", (_request: Request, response: Response) => {
  response.status(200).json({
    success: true,
    message: "CRUD REST API - Pertemuan 7",
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

app.get("/health", (_request: Request, response: Response) => {
  response.status(200).json({
    success: true,
    message: "API berjalan",
    data: { status: "up" },
  });
});

app.use("/buku", bukuRoutes);

app.use((_request: Request, response: Response) => {
  response.status(404).json({
    success: false,
    message: "Endpoint tidak ditemukan",
  });
});

app.use(
  (
    error: Error,
    _request: Request,
    response: Response,
    _next: NextFunction,
  ) => {
    console.error("Kesalahan aplikasi:", error.message);
    response.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  },
);

export { app, prisma };