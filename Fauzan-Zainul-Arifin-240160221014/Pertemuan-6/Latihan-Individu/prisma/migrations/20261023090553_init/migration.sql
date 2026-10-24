-- CreateTable
CREATE TABLE "buku" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "judul" TEXT NOT NULL,
    "penulis" TEXT NOT NULL,
    "tahun" INTEGER NOT NULL,
    "stok" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "pengguna" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nim" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'mahasiswa'
);

-- CreateIndex
CREATE UNIQUE INDEX "pengguna_nim_key" ON "pengguna"("nim");

-- CreateIndex
CREATE UNIQUE INDEX "pengguna_email_key" ON "pengguna"("email");
