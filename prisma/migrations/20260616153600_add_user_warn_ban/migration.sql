/*
  Warnings:

  - Added the required column `simgridId` to the `Championship` table without a default value. This is not possible if the table is not empty.
  - Added the required column `simgridId` to the `Race` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Warn" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "reason" TEXT NOT NULL,
    "issuerId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "issuedAt" DATETIME NOT NULL,
    CONSTRAINT "Warn_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "warns" INTEGER NOT NULL DEFAULT 0,
    "timeouts" INTEGER NOT NULL DEFAULT 0,
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "lastMessageAt" DATETIME,
    "joinedAt" DATETIME NOT NULL,
    "riskScore" INTEGER NOT NULL DEFAULT 0,
    "lastScan" DATETIME,
    "simgridId" TEXT
);

-- CreateTable
CREATE TABLE "Ban" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "reason" TEXT NOT NULL,
    "issuerId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "issuedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Championship" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "simgridId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "roleId" TEXT
);
INSERT INTO "new_Championship" ("id", "image", "name", "roleId") SELECT "id", "image", "name", "roleId" FROM "Championship";
DROP TABLE "Championship";
ALTER TABLE "new_Championship" RENAME TO "Championship";
CREATE INDEX "Championship_simgridId_idx" ON "Championship"("simgridId");
CREATE TABLE "new_Race" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "simgridId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "trackName" TEXT NOT NULL,
    "startsAt" DATETIME NOT NULL,
    "championshipId" INTEGER,
    CONSTRAINT "Race_championshipId_fkey" FOREIGN KEY ("championshipId") REFERENCES "Championship" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Race" ("championshipId", "id", "name", "startsAt", "trackName") SELECT "championshipId", "id", "name", "startsAt", "trackName" FROM "Race";
DROP TABLE "Race";
ALTER TABLE "new_Race" RENAME TO "Race";
CREATE INDEX "Race_simgridId_idx" ON "Race"("simgridId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Warn_targetId_idx" ON "Warn"("targetId");

-- CreateIndex
CREATE INDEX "User_riskScore_idx" ON "User"("riskScore");

-- CreateIndex
CREATE INDEX "Ban_targetId_idx" ON "Ban"("targetId");
