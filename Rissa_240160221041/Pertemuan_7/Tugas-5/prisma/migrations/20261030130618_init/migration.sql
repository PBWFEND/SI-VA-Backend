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
