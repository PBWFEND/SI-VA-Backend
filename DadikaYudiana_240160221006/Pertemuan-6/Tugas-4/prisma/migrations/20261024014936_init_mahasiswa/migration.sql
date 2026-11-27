-- CreateTable
CREATE TABLE "mahasiswa" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nim" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "prodi" TEXT NOT NULL,
    "angkatan" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "mahasiswa_nim_key" ON "mahasiswa"("nim");
