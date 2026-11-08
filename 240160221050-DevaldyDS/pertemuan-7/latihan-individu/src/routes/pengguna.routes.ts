import express from "express";

import {
  getDaftarPengguna,
  postPengguna,
  deletePengguna,
} from "../controller/pengguna.controller.ts";

const penggunaRoutes = express.Router();

// GET /pengguna
penggunaRoutes.get("/", getDaftarPengguna);

// POST /pengguna
penggunaRoutes.post("/", postPengguna);

// DELETE /pengguna/:nim
penggunaRoutes.delete("/:nim", deletePengguna);

export default penggunaRoutes;
