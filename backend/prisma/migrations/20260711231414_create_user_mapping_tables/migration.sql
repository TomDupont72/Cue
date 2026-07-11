-- CreateEnum
CREATE TYPE "UserSeriesStatus" AS ENUM ('PLANNED', 'WATCHING', 'COMPLETED', 'DROPPED', 'PAUSED');

-- CreateTable
CREATE TABLE "UserSeries" (
    "userId" TEXT NOT NULL,
    "seriesId" INTEGER NOT NULL,
    "status" "UserSeriesStatus" NOT NULL DEFAULT 'PLANNED',
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastWatchedAt" TIMESTAMP(3),

    CONSTRAINT "UserSeries_pkey" PRIMARY KEY ("userId","seriesId")
);

-- CreateTable
CREATE TABLE "UserEpisode" (
    "userId" TEXT NOT NULL,
    "episodeId" INTEGER NOT NULL,
    "watched" BOOLEAN NOT NULL DEFAULT false,
    "watchedAt" TIMESTAMP(3),

    CONSTRAINT "UserEpisode_pkey" PRIMARY KEY ("userId","episodeId")
);

-- AddForeignKey
ALTER TABLE "UserSeries" ADD CONSTRAINT "UserSeries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSeries" ADD CONSTRAINT "UserSeries_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "Series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEpisode" ADD CONSTRAINT "UserEpisode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEpisode" ADD CONSTRAINT "UserEpisode_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
