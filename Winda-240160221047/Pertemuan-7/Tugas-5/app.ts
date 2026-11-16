
import express, {
  type Request,
  type Response,
  type NextFunction
} from "express";

import { bukuRoutes } from "./src/routes/buku.routes.ts";

const app = express();

app.disable("x-powered-by");
app.use(express.json());

app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`
  );
  next();
});

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "CRUD REST API Tugas 5",
    endpoints: {
      getAll: "GET /buku",
      getDetail: "GET /buku/:id",
      create: "POST /buku",
      update: "PATCH /buku/:id",
      delete: "DELETE /buku/:id"
    }
  });
});

app.use("/buku", bukuRoutes);

// Middleware 404
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Endpoint tidak ditemukan"
  });
});

// Error handler
app.use((
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error("Kesalahan aplikasi:", error.message);

  res.status(500).json({
    success: false,
    message: "Terjadi kesalahan pada server"
  });
});

export { app };
