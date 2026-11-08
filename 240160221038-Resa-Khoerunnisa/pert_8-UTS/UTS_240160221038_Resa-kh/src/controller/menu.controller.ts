
import type { Request, Response, NextFunction } from "express";
import * as menuService from "../service/menu.service.ts";

export const getAllMenu = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await menuService.getAllMenu();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getMenuById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ success: false, message: "ID tidak valid" });
      return;
    }

    const data = await menuService.getMenuById(id);

    if (!data) {
      res.status(404).json({ success: false, message: "Menu tidak ditemukan" });
      return;
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const createMenu = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { nama, kategori, harga, stok, tersedia } = req.body;

    if (
      typeof nama !== "string" || nama.trim() === "" ||
      typeof kategori !== "string" || kategori.trim() === "" ||
      typeof harga !== "number" || !Number.isInteger(harga) || harga <= 0 ||
      typeof stok !== "number" || !Number.isInteger(stok) || stok < 0 ||
      (tersedia !== undefined && typeof tersedia !== "boolean")
    ) {
      res.status(400).json({ success: false, message: "Data menu tidak valid" });
      return;
    }

    const data = await menuService.createMenu({
      nama: nama.trim(),
      kategori: kategori.trim(),
      harga,
      stok,
      tersedia,
    });

    res.status(201).json({ success: true, message: "Menu berhasil ditambahkan", data });
  } catch (error) {
    next(error);
  }
};

export const updateMenu = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ success: false, message: "ID tidak valid" });
      return;
    }

    const { nama, kategori, harga, stok, tersedia } = req.body;
    const dataUpdate: {
      nama?: string;
      kategori?: string;
      harga?: number;
      stok?: number;
      tersedia?: boolean;
    } = {};

    if (nama !== undefined) {
      if (typeof nama !== "string" || nama.trim() === "") {
        res.status(400).json({ success: false, message: "Nama menu tidak valid" });
        return;
      }
      dataUpdate.nama = nama.trim();
    }

    if (kategori !== undefined) {
      if (typeof kategori !== "string" || kategori.trim() === "") {
        res.status(400).json({ success: false, message: "Kategori tidak valid" });
        return;
      }
      dataUpdate.kategori = kategori.trim();
    }

    if (harga !== undefined) {
      if (typeof harga !== "number" || !Number.isInteger(harga) || harga <= 0) {
        res.status(400).json({ success: false, message: "Harga tidak valid" });
        return;
      }
      dataUpdate.harga = harga;
    }

    if (stok !== undefined) {
      if (typeof stok !== "number" || !Number.isInteger(stok) || stok < 0) {
        res.status(400).json({ success: false, message: "Stok tidak valid" });
        return;
      }
      dataUpdate.stok = stok;
    }

    if (tersedia !== undefined) {
      if (typeof tersedia !== "boolean") {
        res.status(400).json({ success: false, message: "Status tersedia tidak valid" });
        return;
      }
      dataUpdate.tersedia = tersedia;
    }

    if (Object.keys(dataUpdate).length === 0) {
      res.status(400).json({ success: false, message: "Tidak ada data untuk diperbarui" });
      return;
    }

    const existing = await menuService.getMenuById(id);

    if (!existing) {
      res.status(404).json({ success: false, message: "Menu tidak ditemukan" });
      return;
    }

    const data = await menuService.updateMenu(id, dataUpdate);

    res.status(200).json({ success: true, message: "Menu berhasil diperbarui", data });
  } catch (error) {
    next(error);
  }
};

export const deleteMenu = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ success: false, message: "ID tidak valid" });
      return;
    }

    const existing = await menuService.getMenuById(id);

    if (!existing) {
      res.status(404).json({ success: false, message: "Menu tidak ditemukan" });
      return;
    }

    await menuService.deleteMenu(id);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
