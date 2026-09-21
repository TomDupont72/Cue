Feature: POST /api/user/:userId/series/reconcile

    Background:
        Given authentication as "user-1"

        And the current date "2026-02-01T00:00:00.000Z"

        And the database with these series:
            | key              | id | numberOfEpisodes | inProduction |
            | watchingSeries   | 1  | 2                | true         |
            | pausedSeries     | 2  | 2                | true         |
            | droppedSeries    | 3  | 2                | true         |
            | unwatchingSeries | 4  | 2                | true         |
            | plannedSeries    | 5  | 0                | false        |
            | completedSeries  | 6  | 1                | false        |
            | outdatedSeries   | 7  | 2                | true         |

        And the database with these episodes:
            | key               | id | seriesId                 | seasonNumber |
            | watchingEpisode   | 1  | @series.watchingSeries   | 1            |
            | pausedEpisode     | 2  | @series.pausedSeries     | 1            |
            | releasedEpisode   | 3  | @series.pausedSeries     | 1            |
            | droppedEpisode    | 4  | @series.droppedSeries    | 1            |
            | unwatchingEpisode | 5  | @series.unwatchingSeries | 1            |
            | completedEpisode  | 6  | @series.completedSeries  | 1            |
            | outdatedEpisode   | 7  | @series.outdatedSeries   | 1            |
            | outdatedSpecial   | 8  | @series.outdatedSeries   | 0            |

        And the database with these user series:
            | userId | seriesId                 | status    | watchCount | watchedEpisodeCount | lastWatchedAt            |
            | user-1 | @series.watchingSeries   | WATCHING  | 1          | 1                   | 2026-01-01T00:00:00.000Z |
            | user-1 | @series.pausedSeries     | PAUSED    | 1          | 1                   | 2026-01-01T00:00:00.000Z |
            | user-1 | @series.droppedSeries    | DROPPED   | 1          | 1                   | 2026-01-01T00:00:00.000Z |
            | user-1 | @series.unwatchingSeries | WATCHING  | 1          | 1                   | 2025-06-01T00:00:00.000Z |
            | user-1 | @series.plannedSeries    | PLANNED   | 0          | 0                   |                          |
            | user-1 | @series.completedSeries  | COMPLETED | 1          | 1                   | 2026-01-01T00:00:00.000Z |
            | user-1 | @series.outdatedSeries   | COMPLETED | 2          | 5                   | 2025-01-01T00:00:00.000Z |

        And the database with these user episodes:
            | userId | episodeId                   | watchedAt                |
            | user-1 | @episodes.watchingEpisode   | 2026-01-01T00:00:00.000Z |
            | user-1 | @episodes.pausedEpisode     | 2026-01-01T00:00:00.000Z |
            | user-1 | @episodes.droppedEpisode    | 2026-01-01T00:00:00.000Z |
            | user-1 | @episodes.unwatchingEpisode | 2025-06-01T00:00:00.000Z |
            | user-1 | @episodes.completedEpisode  | 2026-01-01T00:00:00.000Z |
            | user-1 | @episodes.outdatedEpisode   | 2026-01-10T00:00:00.000Z |
            | user-1 | @episodes.outdatedSpecial   | 2026-01-20T00:00:00.000Z |

    Scenario: Post user series reconcile
        Given called by worker

        When I send a POST request to "/api/user/user-1/series/reconcile"

        Then the response status should be 200
        And the database should contain exactly these user series:
            | userId | seriesId                 | status   | watchCount | watchedEpisodeCount | lastWatchedAt            |
            | user-1 | @series.watchingSeries   | WATCHING | 1          | 1                   | 2026-01-01T00:00:00.000Z |
            | user-1 | @series.pausedSeries     | WATCHING | 1          | 1                   | 2026-01-01T00:00:00.000Z |
            | user-1 | @series.droppedSeries    | DROPPED  | 1          | 1                   | 2026-01-01T00:00:00.000Z |
            | user-1 | @series.unwatchingSeries | DROPPED  | 1          | 1                   | 2025-06-01T00:00:00.000Z |
            | user-1 | @series.plannedSeries    | PLANNED  | 0          | 0                   |                          |
            | user-1 | @series.completedSeries  | COMPLETED | 1          | 1                   | 2026-01-01T00:00:00.000Z |
            | user-1 | @series.outdatedSeries   | WATCHING | 1          | 2                   | 2026-01-20T00:00:00.000Z |

        And the response body should exactly match:
            | updatedCount |
            | 3            |

    Scenario: Post user series reconcile - User without series
        Given called by worker

        When I send a POST request to "/api/user/user-2/series/reconcile"

        Then the response status should be 200
        And the response body should exactly match:
            | updatedCount |
            | 0            |

    Scenario: Post user series reconcile - Not called by worker
        When I send a POST request to "/api/user/user-1/series/reconcile"

        Then the response status should be 401
        And the response body should exactly match:
            | code         | message      |
            | UNAUTHORIZED | Unauthorized |
