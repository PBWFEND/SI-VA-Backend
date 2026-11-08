-- CreateTable
CREATE TABLE "anggota" (
    "id_anggota" TEXT NOT NULL PRIMARY KEY,
    "nim" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "jabatan" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "absensi" (
    "id_absensi" TEXT NOT NULL PRIMARY KEY,
    "id_anggota" TEXT NOT NULL,
    "kegiatan" TEXT NOT NULL,
    "tanggal" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    CONSTRAINT "absensi_id_anggota_fkey" FOREIGN KEY ("id_anggota") REFERENCES "anggota" ("id_anggota") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "anggota_nim_key" ON "anggota"("nim");
