ALTER TABLE "UserSeries"
ADD CONSTRAINT "UserSeries_watchedEpisodeCount_non_negative"
CHECK ("watchedEpisodeCount" >= 0);
