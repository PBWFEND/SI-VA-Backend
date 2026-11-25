import rateLimit from "express-rate-limit";

/**
 * RATE LIMITING KHUSUS POST /buku
 *
 * Maksimal 3 request dalam 10 detik
 * untuk setiap alamat IP.
 */
export const postBukuLimiter = rateLimit({
  windowMs: 10 * 1000,
  limit: 3,
  standardHeaders: "draft-7",
  legacyHeaders: false,

  message: {
    success: false,
    message:
      "Terlalu banyak permintaan penambahan buku. Silakan coba lagi dalam beberapa saat.",
  },
});
