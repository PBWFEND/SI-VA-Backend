import express from "express";
import type { Request, Response } from "express";
import penggunaRoutes from "./routes/pengguna.route.ts";
import { notFoundHandler, globalErrorHandler } from "./middlewares/errorHandler.ts";

const app = express();
const PORT = process.env.PORT || 3009;

app.use(express.json());

// Main Resource Route
app.use("/pengguna", penggunaRoutes);

// Register 404 & Global Error Middleware
app.use(notFoundHandler);
app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`Server Tugas 5 berjalan di http://localhost:${PORT}`);
});