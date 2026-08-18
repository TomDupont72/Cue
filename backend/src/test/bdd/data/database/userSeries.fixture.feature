Feature: UserSeries fixtures

  Scenario: default
    Given the user series:
      | key           | userId | seriesId        | status   | isFavorite | watchCount | watchedEpisodeCount | addedAt                  | lastWatchedAt             |
      | user1OnePiece | user-1 | @series.onePiece | WATCHING | true       | 1          | 1                   | 2026-06-01T10:00:00.000Z | 2026-08-10T20:00:00.000Z |
      | user1Naruto   | user-1 | @series.naruto   | PLANNED  | false      | 0          | 0                   | 2026-07-01T10:00:00.000Z | null                      |