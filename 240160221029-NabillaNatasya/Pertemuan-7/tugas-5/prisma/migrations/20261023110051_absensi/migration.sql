/*
  Warnings:

  - You are about to drop the `buku` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "buku";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "anggota" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nim" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "prodi" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "absensi" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "anggotaId" INTEGER NOT NULL,
    "tanggal" DATETIME NOT NULL,
    "waktuMasuk" TEXT,
    "status" TEXT NOT NULL,
    "keterangan" TEXT,
    CONSTRAINT "absensi_anggotaId_fkey" FOREIGN KEY ("anggotaId") REFERENCES "anggota" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "anggota_nim_key" ON "anggota"("nim");
