-- CreateTable
CREATE TABLE "Buku" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "judul" TEXT NOT NULL,
    "penulis" TEXT NOT NULL,
    "tahun" INTEGER NOT NULL,
    "stok" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Anggota" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nama" TEXT NOT NULL,
    "nim" TEXT NOT NULL,
    "jurusan" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Anggota_nim_key" ON "Anggota"("nim");
