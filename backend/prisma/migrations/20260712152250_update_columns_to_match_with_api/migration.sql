/*
  Warnings:

  - You are about to drop the column `headquarters` on the `Network` table. All the data in the column will be lost.
  - You are about to drop the column `homepage` on the `Network` table. All the data in the column will be lost.
  - You are about to drop the column `biography` on the `People` table. All the data in the column will be lost.
  - You are about to drop the column `birthday` on the `People` table. All the data in the column will be lost.
  - You are about to drop the column `deathday` on the `People` table. All the data in the column will be lost.
  - You are about to drop the column `homepage` on the `People` table. All the data in the column will be lost.
  - You are about to drop the column `placeOfBirth` on the `People` table. All the data in the column will be lost.
  - You are about to drop the column `nextEpisodeToAir` on the `Series` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Network" DROP COLUMN "headquarters",
DROP COLUMN "homepage";

-- AlterTable
ALTER TABLE "People" DROP COLUMN "biography",
DROP COLUMN "birthday",
DROP COLUMN "deathday",
DROP COLUMN "homepage",
DROP COLUMN "placeOfBirth";

-- AlterTable
ALTER TABLE "Series" DROP COLUMN "nextEpisodeToAir",
ADD COLUMN     "lastAirDate" TIMESTAMP(3);
