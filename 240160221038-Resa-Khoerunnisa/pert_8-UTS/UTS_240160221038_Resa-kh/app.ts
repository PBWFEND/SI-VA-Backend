
import express, { type Request, type Response, type NextFunction } from "express";
export { prisma } from "./client.ts";
import { menuRoutes } from "./src/routes/menu.routes.ts";

const app = express();

app.disable("x-powered-by");
app.use(express.json());

app.use((request: Request, _response: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${request.method} ${request.originalUrl}`);
  next();
});

app.get("/", (_request: Request, response: Response) => {
  response.status(200).json({
    success: true,
    project: "Sistem Informasi Menu Kedai Kopi",
    business: "Baloh Kopi Adhikari",
    creator: {
      nama: "Resa Khoerunnisa",
      nim: "240160221038",
      prodi: "Sistem Informasi"
    },
    message: "UTS Mini Project Backend - Pertemuan 8"
  });
});

app.get("/health", (_request: Request, response: Response) => {
  response.status(200).json({
    success: true,
    message: "API berjalan",
    data: { status: "up" }
  });
});

app.use("/menu", menuRoutes);

app.use((_request: Request, response: Response) => {
  response.status(404).json({
    success: false,
    message: "Endpoint tidak ditemukan"
  });
});

app.use((
  error: Error,
  _request: Request,
  response: Response,
  _next: NextFunction
) => {
  console.error("Kesalahan aplikasi:", error.message);
  response.status(500).json({
    success: false,
    message: "Terjadi kesalahan pada server"
  });
});

export { app };
