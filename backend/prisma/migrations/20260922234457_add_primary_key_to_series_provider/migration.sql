-- AlterTable
ALTER TABLE "SeriesProvider" ADD CONSTRAINT "SeriesProvider_pkey" PRIMARY KEY ("seriesId", "providerId");

-- DropIndex
DROP INDEX "SeriesProvider_seriesId_providerId_key";
