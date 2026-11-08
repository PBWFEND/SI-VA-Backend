-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Pengguna" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nim" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL DEFAULT '',
    "role" TEXT NOT NULL DEFAULT 'user'
);
INSERT INTO "new_Pengguna" ("email", "id", "nama", "nim", "role") SELECT "email", "id", "nama", "nim", "role" FROM "Pengguna";
DROP TABLE "Pengguna";
ALTER TABLE "new_Pengguna" RENAME TO "Pengguna";
CREATE UNIQUE INDEX "Pengguna_nim_key" ON "Pengguna"("nim");
CREATE UNIQUE INDEX "Pengguna_email_key" ON "Pengguna"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
