-- CreateTable
CREATE TABLE "Provider" (
    "id" SERIAL NOT NULL,
    "tmdbId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "logoPath" TEXT,
    "displayPriority" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Provider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeriesProvider" (
    "seriesId" INTEGER NOT NULL,
    "providerId" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Provider_tmdbId_key" ON "Provider"("tmdbId");

-- CreateIndex
CREATE UNIQUE INDEX "SeriesProvider_seriesId_providerId_key" ON "SeriesProvider"("seriesId", "providerId");

-- AddForeignKey
ALTER TABLE "SeriesProvider" ADD CONSTRAINT "SeriesProvider_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "Series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeriesProvider" ADD CONSTRAINT "SeriesProvider_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;
