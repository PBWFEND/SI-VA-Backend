-- CreateTable
CREATE TABLE "Anggota" (
    "id_anggota" TEXT NOT NULL PRIMARY KEY,
    "nama" TEXT NOT NULL,
    "nim" TEXT NOT NULL,
    "jabatan" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Absensi" (
    "id_absensi" TEXT NOT NULL PRIMARY KEY,
    "id_anggota" TEXT NOT NULL,
    "kegiatan" TEXT NOT NULL,
    "tanggal" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    CONSTRAINT "Absensi_id_anggota_fkey" FOREIGN KEY ("id_anggota") REFERENCES "Anggota" ("id_anggota") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Anggota_nim_key" ON "Anggota"("nim");
