Feature: Series fixtures

  Scenario: default
    Given the series:
      | key      | id | adult | backdropPath   | firstAirDate             | tmdbId | inProduction | lastAirDate              | name      | numberOfEpisodes | numberOfSeasons | originalLanguage | originalName | overview     | popularity | posterPath   | createdAt                | updatedAt                |
      | onePiece | 1  | false | /op-bg.jpg     | 2000-01-01T00:00:00.000Z | 37854  | true         | 2000-01-02T00:00:00.000Z | One Piece | 2                | 1               | ja               | One Piece    | Des pirates. | 10         | /op.jpg      | 2026-01-01T10:00:00.000Z | 2026-01-01T10:00:00.000Z |
      | naruto   | 2  | false | /naruto-bg.jpg | 2001-01-01T00:00:00.000Z | 46260  | false        | 2001-01-02T00:00:00.000Z | Naruto    | 2                | 1               | ja               | Naruto       | Des ninjas.  | 9          | /naruto.jpg  | 2026-01-01T10:00:00.000Z | 2026-01-01T10:00:00.000Z |