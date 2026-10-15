-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Species" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "commonName" TEXT NOT NULL,
    "scientificName" TEXT NOT NULL,
    "family" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "habitat" TEXT NOT NULL,
    "diet" TEXT NOT NULL,
    "lifecycle" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "conservationStatus" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Sighting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "speciesId" INTEGER,
    "photoUrl" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "aiConfidence" REAL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Sighting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Sighting_speciesId_fkey" FOREIGN KEY ("speciesId") REFERENCES "Species" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Challenge" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "targetCount" INTEGER NOT NULL,
    "speciesFamily" TEXT,
    "startsAt" DATETIME NOT NULL,
    "endsAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ChallengeProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "challengeId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "ChallengeProgress_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ChallengeProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ChallengeProgress_challengeId_userId_key" ON "ChallengeProgress"("challengeId", "userId");
