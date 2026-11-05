/*
  Warnings:

  - You are about to drop the `Pengguna` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Pengguna";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Buku" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "judul" TEXT NOT NULL,
    "penulis" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "tersedia" BOOLEAN NOT NULL DEFAULT true,
    "tahunTerbit" INTEGER NOT NULL
);
