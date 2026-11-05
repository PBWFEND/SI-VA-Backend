import { Router } from "express";
import {
  handleGetAll,
  handleGetById,
  handleCreate,
  handleUpdate,
  handleDelete
} from "../controller/buku.controller";

const router = Router();

router.get("/", handleGetAll);
router.get("/:id", handleGetById);
router.post("/", handleCreate);
router.patch("/:id", handleUpdate);
router.delete("/:id", handleDelete);

export default router;