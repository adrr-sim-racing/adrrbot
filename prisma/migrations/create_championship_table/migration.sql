-- Create Championship table
CREATE TABLE "Championship" (
    "id" INTEGER NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "roleId" TEXT
);

-- Create Race table
CREATE TABLE "Race" (
    "id" INTEGER NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "trackName" TEXT NOT NULL,
    "startsAt" DATETIME NOT NULL,
    "championshipId" INTEGER,
    CONSTRAINT "FK_Race_Championship" FOREIGN KEY ("championshipId") REFERENCES "Championship"("id") ON DELETE SET NULL
);
