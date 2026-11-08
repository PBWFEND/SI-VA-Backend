-- CreateTable
CREATE TABLE "absensi" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nim" TEXT NOT NULL,
    "namaMahasiswa" TEXT NOT NULL,
    "tanggal" DATETIME NOT NULL,
    "waktuMasuk" TEXT,
    "status" TEXT NOT NULL,
    "keterangan" TEXT
);
