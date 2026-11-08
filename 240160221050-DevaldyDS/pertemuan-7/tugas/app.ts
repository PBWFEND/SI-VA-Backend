import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import penggunaRoutes from "./src/routes/pengguna.routes.ts";

const app = express();

app.disable("x-powered-by");
app.use(express.json());

// Route utama
app.get("/", (_request: Request, response: Response) => {
  return response.status(200).json({
    success: true,
    message: "REST API Pengguna - Tugas 5",
  });
});

// Routes resource pengguna
app.use("/pengguna", penggunaRoutes);

// Middleware 404 - endpoint tidak ditemukan
app.use((_request: Request, response: Response) => {
  return response.status(404).json({
    success: false,
    message: "Endpoint tidak ditemukan",
  });
});

// Error handler
app.use(
  (
    error: Error,
    _request: Request,
    response: Response,
    _next: NextFunction,
  ) => {
    console.error("Terjadi kesalahan:", error.message);

    return response.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  },
);

export default app;
