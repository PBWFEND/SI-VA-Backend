-- CreateTable
CREATE TABLE "pengguna" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nim" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MAHASISWA',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "mahasiswa" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nim" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "prodi" TEXT NOT NULL,
    "angkatan" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "pengguna_nim_key" ON "pengguna"("nim");

-- CreateIndex
CREATE UNIQUE INDEX "pengguna_email_key" ON "pengguna"("email");

-- CreateIndex
CREATE UNIQUE INDEX "mahasiswa_nim_key" ON "mahasiswa"("nim");
