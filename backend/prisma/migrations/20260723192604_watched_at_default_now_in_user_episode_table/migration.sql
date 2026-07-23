/*
  Warnings:

  - Made the column `watchedAt` on table `UserEpisode` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "UserEpisode" ALTER COLUMN "watchedAt" SET NOT NULL,
ALTER COLUMN "watchedAt" SET DEFAULT CURRENT_TIMESTAMP;
