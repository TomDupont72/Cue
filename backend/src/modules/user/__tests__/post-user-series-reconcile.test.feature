Feature: POST /api/user/:userId/series/reconcile

    Background:
        Given authentication as "user-1"

        And called by worker

        And the current date "2026-02-01T00:00:00.000Z"

        And the database with these series:
            | key              | id | numberOfEpisodes | inProduction |
            | watchingSeries   | 1  | 2                | true         |
            | pausedSeries     | 2  | 2                | true         |
            | droppedSeries    | 3  | 2                | true         |
            | unwatchingSeries | 4  | 2                | true         |
            | plannedSeries    | 5  | 0                | false        |
            | completedSeries  | 6  | 1                | false        |

        And the database with these episodes:
            | key               | id | seriesId                 | episodeNumber | airDate                  |
            | watchingEpisode   | 1  | @series.watchingSeries   | 1             | 2026-01-01T00:00:00.000Z |
            | pausedEpisode     | 2  | @series.pausedSeries     | 1             | 2026-01-01T00:00:00.000Z |
            | releasedEpisode   | 3  | @series.pausedSeries     | 2             | 2026-02-01T00:00:00.000Z |
            | droppedEpisode    | 4  | @series.droppedSeries    | 1             | 2026-01-01T00:00:00.000Z |
            | unwatchingEpisode | 5  | @series.unwatchingSeries | 1             | 2025-06-01T00:00:00.000Z |
            | completedEpisode  | 6  | @series.completedSeries  | 1             | 2026-01-01T00:00:00.000Z |

        And the database with these user series:
            | userId | seriesId                 | status   | watchCount | watchedEpisodeCount | lastWatchedAt            |
            | user-1 | @series.watchingSeries   | WATCHING | 1          | 1                   | 2026-01-01T00:00:00.000Z |
            | user-1 | @series.pausedSeries     | PAUSED   | 1          | 1                   | 2026-01-01T00:00:00.000Z |
            | user-1 | @series.droppedSeries    | DROPPED  | 1          | 1                   | 2026-01-01T00:00:00.000Z |
            | user-1 | @series.unwatchingSeries | WATCHING | 1          | 1                   | 2025-06-01T00:00:00.000Z |
            | user-1 | @series.plannedSeries    | PLANNED  | 0          | 0                   |                          |
            | user-1 | @series.completedSeries  | COMPLETED | 1         | 1                   | 2026-01-01T00:00:00.000Z |

        And the database with these user episodes:
            | userId | episodeId                   | watchedAt                |
            | user-1 | @episodes.watchingEpisode   | 2026-01-01T00:00:00.000Z |
            | user-1 | @episodes.pausedEpisode     | 2026-01-01T00:00:00.000Z |
            | user-1 | @episodes.droppedEpisode    | 2026-01-01T00:00:00.000Z |
            | user-1 | @episodes.unwatchingEpisode | 2025-06-01T00:00:00.000Z |
            | user-1 | @episodes.completedEpisode  | 2026-01-01T00:00:00.000Z |

    Scenario: Post user series reconcile
        When I send a POST request to "/api/user/user-1/series/reconcile"

        Then the response status should be 200
        And the database should have these user series fields updated:
            | userId | seriesId                 | status   |
            | user-1 | @series.pausedSeries     | WATCHING |
            | user-1 | @series.unwatchingSeries | DROPPED  |

        And the response body should exactly match:
            | updatedCount |
            | 2            |
