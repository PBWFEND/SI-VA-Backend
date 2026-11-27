import helmet from "helmet";
import cors from "cors";
import { rateLimit } from "express-rate-limit";
import { randomUUID } from "node:crypto";
import type { Request, Response, NextFunction } from "express";

// 1. Konfigurasi Security Headers (Helmet)
export const securityHeadersMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  xFrameOptions: { action: "sameorigin" },
  xContentTypeOptions: true,
  hidePoweredBy: true,
});

// 2. Konfigurasi CORS Selektif (Whitelist)
const parseAllowedOrigins = (): string[] => {
  const envOrigins = process.env.CORS_ORIGIN;
  if (!envOrigins || envOrigins.trim() === "") {
    return ["http://localhost:3000", "http://127.0.0.1:3000", "https://akademik.unsap.ac.id"];
  }
  return envOrigins.split(",").map((o) => o.trim()).filter((o) => o.length > 0);
};

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Izinkan request tanpa origin (seperti cURL, mobile native, server-to-server)
    if (!origin) {
      return callback(null, true);
    }
    const allowed = parseAllowedOrigins();
    if (allowed.includes(origin)) {
      return callback(null, true);
    }
    // Origin tidak terdaftar: jangan kirim header Access-Control-Allow-Origin
    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Request-Id"],
  exposedHeaders: ["X-Request-Id"],
  maxAge: 86400, // Cache preflight 24 jam
});

// 3. Middleware Penjejak Request (X-Request-Id)
export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const incomingId = req.headers["x-request-id"];
  const requestId = typeof incomingId === "string" && incomingId.trim() !== "" ? incomingId.trim() : randomUUID();
  res.setHeader("X-Request-Id", requestId);
  (req as any).requestId = requestId;
  next();
};

// 4. Rate Limiter Global (Umum)
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Terlalu banyak permintaan dari IP ini, silakan coba lagi setelah 15 menit",
  },
});

// 5. Rate Limiter Ketat untuk Autentikasi (Cegah Brute Force Login)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 10, // Maksimal 10 percobaan per 15 menit
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Terlalu banyak percobaan autentikasi dari IP ini. Akses dibatasi selama 15 menit demi keamanan.",
  },
});

export const securityMiddlewares = {
  securityHeadersMiddleware,
  corsMiddleware,
  requestIdMiddleware,
  globalLimiter,
  authLimiter,
};

export default securityMiddlewares;

