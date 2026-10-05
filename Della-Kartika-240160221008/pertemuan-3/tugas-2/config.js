/**
 * Pertemuan 3 — Tugas 2
 * Konfigurasi aplikasi Node.js
 */

export const APP_NAME =
  process.env.APP_NAME ?? "Sistem Informasi Absensi";

export const PORT =
  Number(process.env.PORT ?? 3004);

export const NODE_ENV =
  process.env.NODE_ENV ?? "development";

export const getConfig = () => ({
  appName: APP_NAME,
  port: PORT,
  environment: NODE_ENV,
});