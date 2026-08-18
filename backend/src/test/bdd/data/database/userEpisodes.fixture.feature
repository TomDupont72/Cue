Feature: UserEpisode fixtures

  Scenario: default
    Given the user episodes:
      | key             | userId | episodeId           | watchedAt                |
      | user1OnePieceE1 | user-1 | @episodes.onePieceE1 | 2026-08-10T20:00:00.000Z |