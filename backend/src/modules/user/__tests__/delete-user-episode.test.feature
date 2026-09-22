Feature: DELETE /api/user/series/:seriesId/episode/:episodeId

    Background:
        Given authentication as "user-1"

        And the database with these series:
            | key                 | id | numberOfEpisodes | inProduction |
            | completedSeries     | 1  | 2                | false        |
            | specialSeries       | 2  | 0                | false        |
            | untrackedSeries     | 3  | 1                | false        |
            | singleEpisodeSeries | 4  | 1                | false        |
            | pausedSeries        | 5  | 2                | true         |
            | watchingSeries      | 6  | 3                | true         |
            | mixedSeries         | 7  | 1                | false        |
            | sharedSeries        | 8  | 1                | false        |

        And the database with these episodes:
            | key                | id | seriesId                    | seasonNumber |
            | completedFirst     | 1  | @series.completedSeries     | 1            |
            | completedLatest    | 2  | @series.completedSeries     | 1            |
            | watchedSpecial     | 3  | @series.specialSeries       | 0            |
            | untrackedEpisode   | 4  | @series.untrackedSeries     | 1            |
            | onlyWatchedEpisode | 5  | @series.singleEpisodeSeries | 1            |
            | pausedFirst        | 6  | @series.pausedSeries        | 1            |
            | pausedLatest       | 7  | @series.pausedSeries        | 1            |
            | watchingFirst      | 8  | @series.watchingSeries      | 1            |
            | watchingLatest     | 9  | @series.watchingSeries      | 1            |
            | notWatchedEpisode  | 10 | @series.watchingSeries      | 1            |
            | mixedRegular       | 11 | @series.mixedSeries         | 1            |
            | mixedSpecial       | 12 | @series.mixedSeries         | 0            |
            | watchedByOtherUser | 13 | @series.sharedSeries        | 1            |

        And the database with these user series:
            | userId | seriesId                    | status    | watchCount | watchedEpisodeCount | lastWatchedAt            |
            | user-1 | @series.completedSeries     | COMPLETED | 2          | 2                   | 2026-01-20T00:00:00.000Z |
            | user-1 | @series.specialSeries       | WATCHING  | 0          | 1                   | 2026-01-25T00:00:00.000Z |
            | user-1 | @series.singleEpisodeSeries | COMPLETED | 1          | 1                   | 2026-01-15T00:00:00.000Z |
            | user-1 | @series.pausedSeries        | PAUSED    | 2          | 2                   | 2026-01-20T00:00:00.000Z |
            | user-1 | @series.watchingSeries      | WATCHING  | 2          | 2                   | 2026-01-25T00:00:00.000Z |
            | user-1 | @series.mixedSeries         | COMPLETED | 1          | 2                   | 2026-01-25T00:00:00.000Z |
            | user-1 | @series.sharedSeries        | PLANNED   | 0          | 0                   |                            |
            | user-2 | @series.sharedSeries        | COMPLETED | 1          | 1                   | 2026-01-30T00:00:00.000Z |

        And the database with these user episodes:
            | userId | episodeId                    | watchedAt                |
            | user-1 | @episodes.completedFirst     | 2026-01-10T00:00:00.000Z |
            | user-1 | @episodes.completedLatest    | 2026-01-20T00:00:00.000Z |
            | user-1 | @episodes.watchedSpecial     | 2026-01-25T00:00:00.000Z |
            | user-1 | @episodes.onlyWatchedEpisode | 2026-01-15T00:00:00.000Z |
            | user-1 | @episodes.pausedFirst        | 2026-01-10T00:00:00.000Z |
            | user-1 | @episodes.pausedLatest       | 2026-01-20T00:00:00.000Z |
            | user-1 | @episodes.watchingFirst      | 2026-01-10T00:00:00.000Z |
            | user-1 | @episodes.watchingLatest     | 2026-01-25T00:00:00.000Z |
            | user-1 | @episodes.mixedRegular       | 2026-01-10T00:00:00.000Z |
            | user-1 | @episodes.mixedSpecial       | 2026-01-25T00:00:00.000Z |
            | user-2 | @episodes.watchedByOtherUser | 2026-01-30T00:00:00.000Z |

    Scenario: Delete user episode - Latest from completed
        When I send a DELETE request to "/api/user/series/1/episode/2"

        Then the response status should be 200
        And the database should have these user episodes deleted:
            | key     | userId | episodeId                 |
            | deleted | user-1 | @episodes.completedLatest |

        And the database should have these user series fields updated:
            | userId | seriesId                | status   | watchCount | watchedEpisodeCount | lastWatchedAt            |
            | user-1 | @series.completedSeries | WATCHING | 1          | 1                   | 2026-01-10T00:00:00.000Z |

        And the response body should exactly match this fixture:
            | fixture               |
            | @userEpisodes.deleted |

    Scenario: Delete user episode - Only watched
        When I send a DELETE request to "/api/user/series/4/episode/5"

        Then the response status should be 200
        And the database should have these user episodes deleted:
            | key     | userId | episodeId                    |
            | deleted | user-1 | @episodes.onlyWatchedEpisode |

        And the database should have these user series fields updated:
            | userId | seriesId                    | status  | watchCount | watchedEpisodeCount | lastWatchedAt |
            | user-1 | @series.singleEpisodeSeries | PLANNED | 0          | 0                   |               |

        And the response body should exactly match this fixture:
            | fixture               |
            | @userEpisodes.deleted |

    Scenario: Delete user episode - Latest from paused
        When I send a DELETE request to "/api/user/series/5/episode/7"

        Then the response status should be 200
        And the database should have these user episodes deleted:
            | key     | userId | episodeId              |
            | deleted | user-1 | @episodes.pausedLatest |

        And the database should have these user series fields updated:
            | userId | seriesId            | status   | watchCount | watchedEpisodeCount | lastWatchedAt            |
            | user-1 | @series.pausedSeries | WATCHING | 1          | 1                   | 2026-01-10T00:00:00.000Z |

        And the response body should exactly match this fixture:
            | fixture               |
            | @userEpisodes.deleted |

    Scenario: Delete user episode - Older from watching
        When I send a DELETE request to "/api/user/series/6/episode/8"

        Then the response status should be 200
        And the database should have these user episodes deleted:
            | key     | userId | episodeId               |
            | deleted | user-1 | @episodes.watchingFirst |

        And the database should have these user series fields updated:
            | userId | seriesId               | watchCount | watchedEpisodeCount |
            | user-1 | @series.watchingSeries | 1          | 1                   |

        And the response body should exactly match this fixture:
            | fixture               |
            | @userEpisodes.deleted |

    Scenario: Delete user episode - Only watched special
        When I send a DELETE request to "/api/user/series/2/episode/3"

        Then the response status should be 200
        And the database should have these user episodes deleted:
            | key     | userId | episodeId                |
            | deleted | user-1 | @episodes.watchedSpecial |

        And the database should have these user series fields updated:
            | userId | seriesId              | status  | watchedEpisodeCount | lastWatchedAt |
            | user-1 | @series.specialSeries | PLANNED | 0                   |               |

        And the response body should exactly match this fixture:
            | fixture               |
            | @userEpisodes.deleted |

    Scenario: Delete user episode - Special with regular remaining
        When I send a DELETE request to "/api/user/series/7/episode/12"

        Then the response status should be 200
        And the database should have these user episodes deleted:
            | key     | userId | episodeId              |
            | deleted | user-1 | @episodes.mixedSpecial |

        And the database should have these user series fields updated:
            | userId | seriesId            | watchedEpisodeCount | lastWatchedAt            |
            | user-1 | @series.mixedSeries | 1                   | 2026-01-10T00:00:00.000Z |

        And the response body should exactly match this fixture:
            | fixture               |
            | @userEpisodes.deleted |

    Scenario: Delete user episode - Not watched
        When I send a DELETE request to "/api/user/series/6/episode/10"

        Then the response status should be 404
        And the response body should exactly match:
            | code                   | message                         |
            | USER_EPISODE_NOT_FOUND | Episode for this user not found |

    Scenario: Delete user episode - Watched by another user
        When I send a DELETE request to "/api/user/series/8/episode/13"

        Then the response status should be 404
        And the response body should exactly match:
            | code                   | message                         |
            | USER_EPISODE_NOT_FOUND | Episode for this user not found |

    Scenario: Delete user episode - Series not added
        When I send a DELETE request to "/api/user/series/3/episode/4"

        Then the response status should be 404
        And the response body should exactly match:
            | code                  | message                        |
            | USER_SERIES_NOT_FOUND | Series for this user not found |

    Scenario: Delete user episode - Another series
        When I send a DELETE request to "/api/user/series/2/episode/1"

        Then the response status should be 404
        And the response body should exactly match:
            | code              | message           |
            | EPISODE_NOT_FOUND | Episode not found |

    Scenario: Delete user episode - Missing series
        When I send a DELETE request to "/api/user/series/999/episode/1"

        Then the response status should be 404
        And the response body should exactly match:
            | code              | message           |
            | EPISODE_NOT_FOUND | Episode not found |

    Scenario: Delete user episode - Missing episode
        When I send a DELETE request to "/api/user/series/1/episode/999"

        Then the response status should be 404
        And the response body should exactly match:
            | code              | message           |
            | EPISODE_NOT_FOUND | Episode not found |

    Scenario: Delete user episode - Invalid parameters
        When I send a DELETE request to "/api/user/series/invalid/episode/invalid"

        Then the response status should be 400
