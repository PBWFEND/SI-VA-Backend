-- CreateTable
CREATE TABLE "absensi" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nama" TEXT NOT NULL,
    "jabatan" TEXT NOT NULL,
    "tanggal" DATETIME NOT NULL,
    "status" TEXT NOT NULL
);
