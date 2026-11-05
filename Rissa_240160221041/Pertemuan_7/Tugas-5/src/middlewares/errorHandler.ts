import type { Request, Response, NextFunction } from "express";

// Middleware 404 Route Not Found
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Resource Endpoint ${req.originalUrl} tidak ditemukan`,
  });
};

// Global Error Handler
export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Internal Error:", err);
  res.status(500).json({
    success: false,
    message: "Terjadi kesalahan pada internal server",
    error: err.message || err,
  });
};