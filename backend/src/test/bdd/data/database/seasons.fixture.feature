Feature: Season fixtures

  Scenario: default
    Given the seasons:
      | key        | id | seriesId         | airDate                  | name     | overview          | tmdbId | posterPath     | seasonNumber | voteAverage | createdAt                | updatedAt                |
      | onePieceS1 | 1  | @series.onePiece | 2000-01-01T00:00:00.000Z | Saison 1 | Première saison. | 11     | /op-s1.jpg      | 1            | 8           | 2026-01-01T10:00:00.000Z | 2026-01-01T10:00:00.000Z |
      | narutoS1   | 2  | @series.naruto   | 2001-01-01T00:00:00.000Z | Saison 1 | Première saison. | 21     | /naruto-s1.jpg  | 1            | 7           | 2026-01-01T10:00:00.000Z | 2026-01-01T10:00:00.000Z |