Feature: Episode fixtures

  Scenario: default
    Given the episodes:
      | key        | id | seriesId        | seasonId           | airDate                  | episodeNumber | name      | overview        | tmdbId | stillPath       | runtime | seasonNumber | voteAverage | createdAt                | updatedAt                |
      | onePieceE1 | 1  | @series.onePiece | @seasons.onePieceS1 | 2000-01-01T00:00:00.000Z | 1             | Départ    | Le départ.      | 111    | /op-e1.jpg      | 20      | 1            | 8           | 2026-01-01T10:00:00.000Z | 2026-01-01T10:00:00.000Z |
      | onePieceE2 | 2  | @series.onePiece | @seasons.onePieceS1 | 2000-01-02T00:00:00.000Z | 2             | Rencontre | Une rencontre.  | 112    | /op-e2.jpg      | 20      | 1            | 8           | 2026-01-01T10:00:00.000Z | 2026-01-01T10:00:00.000Z |
      | narutoE1   | 3  | @series.naruto   | @seasons.narutoS1   | 2001-01-01T00:00:00.000Z | 1             | Début     | Le début.       | 211    | /naruto-e1.jpg  | 20      | 1            | 7           | 2026-01-01T10:00:00.000Z | 2026-01-01T10:00:00.000Z |
      | narutoE2   | 4  | @series.naruto   | @seasons.narutoS1   | 2001-01-02T00:00:00.000Z | 2             | Mission   | Une mission.    | 212    | /naruto-e2.jpg  | 20      | 1            | 7           | 2026-01-01T10:00:00.000Z | 2026-01-01T10:00:00.000Z |