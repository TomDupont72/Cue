-- CreateTable
CREATE TABLE "Series" (
    "id" SERIAL NOT NULL,
    "adult" BOOLEAN NOT NULL,
    "backdropPath" TEXT,
    "firstAirDate" TIMESTAMP(3),
    "tmdbId" INTEGER NOT NULL,
    "inProduction" BOOLEAN NOT NULL,
    "name" TEXT NOT NULL,
    "nextEpisodeToAir" TIMESTAMP(3),
    "numberOfEpisodes" INTEGER NOT NULL,
    "numberOfSeasons" INTEGER NOT NULL,
    "originalLanguage" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "overview" TEXT,
    "popularity" DOUBLE PRECISION NOT NULL,
    "posterPath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Series_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Season" (
    "id" SERIAL NOT NULL,
    "seriesId" INTEGER NOT NULL,
    "airDate" TIMESTAMP(3),
    "name" TEXT NOT NULL,
    "overview" TEXT,
    "tmdbId" INTEGER NOT NULL,
    "posterPath" TEXT,
    "seasonNumber" INTEGER NOT NULL,
    "voteAverage" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Season_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Episode" (
    "id" SERIAL NOT NULL,
    "seriesId" INTEGER NOT NULL,
    "seasonId" INTEGER NOT NULL,
    "airDate" TIMESTAMP(3),
    "episodeNumber" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "overview" TEXT,
    "tmdbId" INTEGER NOT NULL,
    "stillPath" TEXT,
    "seasonNumber" INTEGER NOT NULL,
    "voteAverage" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Episode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Genre" (
    "id" SERIAL NOT NULL,
    "tmdbId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Genre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeriesGenre" (
    "seriesId" INTEGER NOT NULL,
    "genreId" INTEGER NOT NULL,

    CONSTRAINT "SeriesGenre_pkey" PRIMARY KEY ("seriesId","genreId")
);

-- CreateTable
CREATE TABLE "People" (
    "id" SERIAL NOT NULL,
    "adult" BOOLEAN NOT NULL,
    "biography" TEXT,
    "birthday" TIMESTAMP(3) NOT NULL,
    "deathday" TIMESTAMP(3),
    "gender" INTEGER NOT NULL,
    "homepage" TEXT,
    "tmdbId" INTEGER NOT NULL,
    "knownForDepartment" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "placeOfBirth" TEXT NOT NULL,
    "popularity" DOUBLE PRECISION NOT NULL,
    "profilePath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "People_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeriesPeople" (
    "seriesId" INTEGER NOT NULL,
    "peopleId" INTEGER NOT NULL,

    CONSTRAINT "SeriesPeople_pkey" PRIMARY KEY ("seriesId","peopleId")
);

-- CreateTable
CREATE TABLE "Network" (
    "id" SERIAL NOT NULL,
    "headquarters" TEXT NOT NULL,
    "homepage" TEXT,
    "tmdbId" INTEGER NOT NULL,
    "logoPath" TEXT,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Network_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeriesNetwork" (
    "seriesId" INTEGER NOT NULL,
    "networkId" INTEGER NOT NULL,

    CONSTRAINT "SeriesNetwork_pkey" PRIMARY KEY ("seriesId","networkId")
);

-- CreateTable
CREATE TABLE "Character" (
    "id" SERIAL NOT NULL,
    "peopleId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EpisodePeople" (
    "episodeId" INTEGER NOT NULL,
    "peopleId" INTEGER NOT NULL,

    CONSTRAINT "EpisodePeople_pkey" PRIMARY KEY ("episodeId","peopleId")
);

-- CreateTable
CREATE TABLE "EpisodeCharacter" (
    "episodeId" INTEGER NOT NULL,
    "characterId" INTEGER NOT NULL,

    CONSTRAINT "EpisodeCharacter_pkey" PRIMARY KEY ("episodeId","characterId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Series_tmdbId_key" ON "Series"("tmdbId");

-- CreateIndex
CREATE UNIQUE INDEX "Season_tmdbId_key" ON "Season"("tmdbId");

-- CreateIndex
CREATE UNIQUE INDEX "Season_seriesId_seasonNumber_key" ON "Season"("seriesId", "seasonNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Episode_tmdbId_key" ON "Episode"("tmdbId");

-- CreateIndex
CREATE UNIQUE INDEX "Episode_seriesId_seasonNumber_episodeNumber_key" ON "Episode"("seriesId", "seasonNumber", "episodeNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Genre_tmdbId_key" ON "Genre"("tmdbId");

-- CreateIndex
CREATE UNIQUE INDEX "People_tmdbId_key" ON "People"("tmdbId");

-- CreateIndex
CREATE UNIQUE INDEX "Network_tmdbId_key" ON "Network"("tmdbId");

-- CreateIndex
CREATE UNIQUE INDEX "Character_peopleId_name_key" ON "Character"("peopleId", "name");

-- AddForeignKey
ALTER TABLE "Season" ADD CONSTRAINT "Season_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "Series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Episode" ADD CONSTRAINT "Episode_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "Series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Episode" ADD CONSTRAINT "Episode_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeriesGenre" ADD CONSTRAINT "SeriesGenre_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "Series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeriesGenre" ADD CONSTRAINT "SeriesGenre_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "Genre"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeriesPeople" ADD CONSTRAINT "SeriesPeople_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "Series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeriesPeople" ADD CONSTRAINT "SeriesPeople_peopleId_fkey" FOREIGN KEY ("peopleId") REFERENCES "People"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeriesNetwork" ADD CONSTRAINT "SeriesNetwork_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "Series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeriesNetwork" ADD CONSTRAINT "SeriesNetwork_networkId_fkey" FOREIGN KEY ("networkId") REFERENCES "Network"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_peopleId_fkey" FOREIGN KEY ("peopleId") REFERENCES "People"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EpisodePeople" ADD CONSTRAINT "EpisodePeople_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EpisodePeople" ADD CONSTRAINT "EpisodePeople_peopleId_fkey" FOREIGN KEY ("peopleId") REFERENCES "People"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EpisodeCharacter" ADD CONSTRAINT "EpisodeCharacter_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EpisodeCharacter" ADD CONSTRAINT "EpisodeCharacter_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;
