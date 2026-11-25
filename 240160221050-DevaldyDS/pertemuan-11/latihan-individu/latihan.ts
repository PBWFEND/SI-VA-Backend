/**
 * IMPLEMENTASI KEAMANAN API BACKEND
 * Latihan Individu Pertemuan 11
 *
 * Fitur:
 * 1. Rate Limiting khusus POST /api/buku
 * 2. Maksimal 3 request dalam 10 detik
 * 3. Request ke-4 akan mendapatkan HTTP 429
 */

import rateLimit from "express-rate-limit";

// Konfigurasi Rate Limiting
export const strictPostBukuLimiter = rateLimit({
  windowMs: 10 * 1000, // Periode pembatasan: 10 detik
  limit: 3, // Maksimal 3 request
  standardHeaders: "draft-7",
  legacyHeaders: false,

  // Pesan ketika batas request terlampaui
  message: {
    success: false,
    message:
      "Terlalu banyak permintaan penambahan buku. Silakan coba lagi nanti.",
  },
});

// Informasi konfigurasi Rate Limiting
export const rateLimitConfig = {
  endpoint: "POST /api/buku",
  maxRequests: 3,
  windowMs: 10 * 1000,
};

// Fungsi untuk menampilkan informasi konfigurasi
export const getRateLimitInfo = () => {
  return {
    endpoint: rateLimitConfig.endpoint,
    maxRequests: rateLimitConfig.maxRequests,
    windowSeconds: rateLimitConfig.windowMs / 1000,
    description:
      "Membatasi maksimal 3 request dalam waktu 10 detik untuk setiap IP address.",
  };
};
