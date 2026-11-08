-- CreateTable
CREATE TABLE "absensi" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nim" TEXT NOT NULL,
    "namaMahasiswa" TEXT NOT NULL,
    "kelas" TEXT NOT NULL,
    "tanggal" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    "keterangan" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
