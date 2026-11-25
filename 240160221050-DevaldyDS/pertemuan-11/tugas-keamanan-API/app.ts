import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import helmet from "helmet";
import cors, { type CorsOptions } from "cors";

import authRoutes from "./src/auth/auth.routes.js";
import bukuRoutes from "./src/routes/buku.routes.js";

const app = express();

/**
 * 1. SECURITY HEADERS
 * Melindungi aplikasi dengan HTTP security headers.
 */
app.use(helmet());

/**
 * 2. CORS CONFIGURATION
 * Hanya origin yang terdaftar di CORS_ORIGINS
 * yang diizinkan mengakses API melalui browser.
 */
const allowedOrigins = (process.env.CORS_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    // Request tanpa Origin (misalnya Postman) tetap diizinkan.
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Origin tidak diizinkan oleh CORS"));
  },
  methods: ["GET", "POST", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

/**
 * 3. BODY SIZE LIMIT
 * Membatasi ukuran JSON maksimal 10 KB.
 */
app.use(express.json({ limit: "10kb" }));

/**
 * 4. HEALTH CHECK
 */
app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "API berjalan dengan baik",
  });
});

/**
 * 5. RESOURCE ROUTES
 */
app.use("/buku", bukuRoutes);
app.use("/auth", authRoutes);

/**
 * 6. NOT FOUND HANDLER
 */
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint tidak ditemukan",
  });
});

/**
 * 7. CENTRAL ERROR HANDLER
 * Tidak membocorkan detail error internal kepada client.
 */
app.use(
  (
    err: Error & { status?: number; type?: string },
    _req: Request,
    res: Response,
    _next: NextFunction,
  ) => {
    // Detail lengkap hanya dicatat di server.
    console.error("Server Error:", err);

    // Request body melebihi batas 10 KB.
    if (err.status === 413 || err.type === "entity.too.large") {
      return res.status(413).json({
        success: false,
        message: "Ukuran request terlalu besar. Maksimal 10 KB.",
      });
    }

    // JSON tidak valid.
    if (err instanceof SyntaxError && err.status === 400) {
      return res.status(400).json({
        success: false,
        message: "Format JSON tidak valid",
      });
    }

    // Origin tidak diizinkan.
    if (err.message === "Origin tidak diizinkan oleh CORS") {
      return res.status(403).json({
        success: false,
        message: "Origin tidak diizinkan mengakses API",
      });
    }

    // Error umum.
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  },
);

export default app;
