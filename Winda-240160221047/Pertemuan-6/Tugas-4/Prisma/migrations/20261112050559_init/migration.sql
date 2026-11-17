-- CreateTable
CREATE TABLE "buku" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "judul" TEXT NOT NULL,
    "penulis" TEXT NOT NULL,
    "tahun" INTEGER NOT NULL,
    "stok" INTEGER NOT NULL DEFAULT 0
);
