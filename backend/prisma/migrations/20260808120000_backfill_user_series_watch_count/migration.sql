-- UserEpisode is the source of truth. Specials (season 0) do not contribute to progress.
BEGIN;

LOCK TABLE "Episode" IN SHARE MODE;
LOCK TABLE "UserEpisode" IN SHARE MODE;
LOCK TABLE "UserSeries" IN SHARE ROW EXCLUSIVE MODE;

UPDATE "UserSeries" AS us
SET "watchCount" = (
  SELECT COUNT(*)::integer
  FROM "UserEpisode" AS ue
  INNER JOIN "Episode" AS e ON e.id = ue."episodeId"
  WHERE ue."userId" = us."userId"
    AND e."seriesId" = us."seriesId"
    AND e."seasonNumber" <> 0
);

ALTER TABLE "UserSeries"
ADD CONSTRAINT "UserSeries_watchCount_non_negative"
CHECK ("watchCount" >= 0);

COMMIT;
