Feature: DELETE /api/user/series/:seriesId/season/:seasonId

    Background:
        Given authentication as "user-1"

        And the database with these series:
            | key                 | id | numberOfEpisodes | inProduction |
            | completedSeries     | 1  | 3                | false        |
            | specialSeries       | 2  | 0                | false        |
            | notWatchedSeries    | 3  | 1                | false        |
            | untrackedSeries     | 4  | 1                | false        |
            | singleSeasonSeries  | 5  | 2                | false        |
            | pausedSeries        | 6  | 3                | true         |
            | watchingSeries      | 7  | 4                | true         |
            | partialSeries       | 8  | 3                | false        |
            | mixedSeries         | 9  | 1                | false        |
            | sharedSeries        | 10 | 1                | false        |

        And the database with these seasons:
            | key                | id | seriesId                    | seasonNumber |
            | completedDeleted   | 1  | @series.completedSeries     | 1            |
            | completedRemaining | 2  | @series.completedSeries     | 2            |
            | specialSeason      | 3  | @series.specialSeries       | 0            |
            | notWatchedSeason   | 4  | @series.notWatchedSeries    | 1            |
            | untrackedSeason    | 5  | @series.untrackedSeries     | 1            |
            | singleSeason       | 6  | @series.singleSeasonSeries  | 1            |
            | pausedDeleted      | 7  | @series.pausedSeries        | 1            |
            | pausedRemaining    | 8  | @series.pausedSeries        | 2            |
            | watchingOlder      | 9  | @series.watchingSeries      | 1            |
            | watchingLatest     | 10 | @series.watchingSeries      | 2            |
            | partialSeason      | 11 | @series.partialSeries       | 1            |
            | mixedRegular       | 12 | @series.mixedSeries         | 1            |
            | mixedSpecial       | 13 | @series.mixedSeries         | 0            |
            | sharedSeason       | 14 | @series.sharedSeries        | 1            |
            | emptySeason        | 15 | @series.notWatchedSeries    | 2            |

        And the database with these episodes:
            | key                    | id | seriesId                    | seasonId                     | seasonNumber | episodeNumber |
            | completedDeletedFirst  | 1  | @series.completedSeries     | @seasons.completedDeleted    | 1            | 1             |
            | completedDeletedSecond | 2  | @series.completedSeries     | @seasons.completedDeleted    | 1            | 2             |
            | completedRemaining     | 3  | @series.completedSeries     | @seasons.completedRemaining  | 2            | 1             |
            | specialEpisode         | 4  | @series.specialSeries       | @seasons.specialSeason       | 0            | 1             |
            | notWatchedEpisode      | 5  | @series.notWatchedSeries    | @seasons.notWatchedSeason    | 1            | 1             |
            | untrackedEpisode       | 6  | @series.untrackedSeries     | @seasons.untrackedSeason     | 1            | 1             |
            | singleFirst            | 7  | @series.singleSeasonSeries  | @seasons.singleSeason        | 1            | 1             |
            | singleSecond           | 8  | @series.singleSeasonSeries  | @seasons.singleSeason        | 1            | 2             |
            | pausedDeletedFirst     | 9  | @series.pausedSeries        | @seasons.pausedDeleted       | 1            | 1             |
            | pausedDeletedSecond    | 10 | @series.pausedSeries        | @seasons.pausedDeleted       | 1            | 2             |
            | pausedRemaining        | 11 | @series.pausedSeries        | @seasons.pausedRemaining     | 2            | 1             |
            | watchingOlderFirst     | 12 | @series.watchingSeries      | @seasons.watchingOlder       | 1            | 1             |
            | watchingOlderSecond    | 13 | @series.watchingSeries      | @seasons.watchingOlder       | 1            | 2             |
            | watchingLatest         | 14 | @series.watchingSeries      | @seasons.watchingLatest      | 2            | 1             |
            | watchingNotWatched     | 15 | @series.watchingSeries      | @seasons.watchingLatest      | 2            | 2             |
            | partialFirst           | 16 | @series.partialSeries       | @seasons.partialSeason       | 1            | 1             |
            | partialSecond          | 17 | @series.partialSeries       | @seasons.partialSeason       | 1            | 2             |
            | partialNotWatched      | 18 | @series.partialSeries       | @seasons.partialSeason       | 1            | 3             |
            | mixedRegular           | 19 | @series.mixedSeries         | @seasons.mixedRegular        | 1            | 1             |
            | mixedSpecialFirst      | 20 | @series.mixedSeries         | @seasons.mixedSpecial        | 0            | 1             |
            | mixedSpecialSecond     | 21 | @series.mixedSeries         | @seasons.mixedSpecial        | 0            | 2             |
            | watchedByOtherUser     | 22 | @series.sharedSeries        | @seasons.sharedSeason        | 1            | 1             |

        And the database with these user series:
            | userId | seriesId                    | status    | watchCount | watchedEpisodeCount | lastWatchedAt            |
            | user-1 | @series.completedSeries     | COMPLETED | 3          | 3                   | 2026-01-25T00:00:00.000Z |
            | user-1 | @series.specialSeries       | WATCHING  | 0          | 1                   | 2026-01-20T00:00:00.000Z |
            | user-1 | @series.notWatchedSeries    | PLANNED   | 0          | 0                   |                            |
            | user-1 | @series.singleSeasonSeries  | COMPLETED | 2          | 2                   | 2026-01-15T00:00:00.000Z |
            | user-1 | @series.pausedSeries        | PAUSED    | 3          | 3                   | 2026-01-25T00:00:00.000Z |
            | user-1 | @series.watchingSeries      | WATCHING  | 3          | 3                   | 2026-01-25T00:00:00.000Z |
            | user-1 | @series.partialSeries       | WATCHING  | 2          | 2                   | 2026-01-15T00:00:00.000Z |
            | user-1 | @series.mixedSeries         | COMPLETED | 1          | 3                   | 2026-01-25T00:00:00.000Z |
            | user-1 | @series.sharedSeries        | PLANNED   | 0          | 0                   |                            |
            | user-2 | @series.sharedSeries        | COMPLETED | 1          | 1                   | 2026-01-30T00:00:00.000Z |

        And the database with these user episodes:
            | key                    | userId | episodeId                         | watchedAt                |
            | completedDeletedFirst  | user-1 | @episodes.completedDeletedFirst  | 2026-01-20T00:00:00.000Z |
            | completedDeletedSecond | user-1 | @episodes.completedDeletedSecond | 2026-01-25T00:00:00.000Z |
            | completedRemaining     | user-1 | @episodes.completedRemaining     | 2026-01-10T00:00:00.000Z |
            | specialEpisode         | user-1 | @episodes.specialEpisode         | 2026-01-20T00:00:00.000Z |
            | singleFirst            | user-1 | @episodes.singleFirst            | 2026-01-10T00:00:00.000Z |
            | singleSecond           | user-1 | @episodes.singleSecond           | 2026-01-15T00:00:00.000Z |
            | pausedDeletedFirst     | user-1 | @episodes.pausedDeletedFirst     | 2026-01-20T00:00:00.000Z |
            | pausedDeletedSecond    | user-1 | @episodes.pausedDeletedSecond    | 2026-01-25T00:00:00.000Z |
            | pausedRemaining        | user-1 | @episodes.pausedRemaining        | 2026-01-10T00:00:00.000Z |
            | watchingOlderFirst     | user-1 | @episodes.watchingOlderFirst     | 2026-01-10T00:00:00.000Z |
            | watchingOlderSecond    | user-1 | @episodes.watchingOlderSecond    | 2026-01-15T00:00:00.000Z |
            | watchingLatest         | user-1 | @episodes.watchingLatest         | 2026-01-25T00:00:00.000Z |
            | partialFirst           | user-1 | @episodes.partialFirst           | 2026-01-10T00:00:00.000Z |
            | partialSecond          | user-1 | @episodes.partialSecond          | 2026-01-15T00:00:00.000Z |
            | mixedRegular           | user-1 | @episodes.mixedRegular           | 2026-01-10T00:00:00.000Z |
            | mixedSpecialFirst      | user-1 | @episodes.mixedSpecialFirst      | 2026-01-20T00:00:00.000Z |
            | mixedSpecialSecond     | user-1 | @episodes.mixedSpecialSecond     | 2026-01-25T00:00:00.000Z |
            | watchedByOtherUser     | user-2 | @episodes.watchedByOtherUser     | 2026-01-30T00:00:00.000Z |

    Scenario: Delete user season - Latest from completed
        When I send a DELETE request to "/api/user/series/1/season/1"

        Then the response status should be 200
        And the database should have these user episodes deleted:
            | key           | userId | episodeId                         |
            | deletedFirst  | user-1 | @episodes.completedDeletedFirst  |
            | deletedSecond | user-1 | @episodes.completedDeletedSecond |

        And the database should have these user series fields updated:
            | userId | seriesId                | status   | watchCount | watchedEpisodeCount | lastWatchedAt            |
            | user-1 | @series.completedSeries | WATCHING | 1          | 1                   | 2026-01-10T00:00:00.000Z |

        And the response array at "$" should exactly match these fixtures:
            | fixture                     |
            | @userEpisodes.deletedFirst  |
            | @userEpisodes.deletedSecond |

    Scenario: Delete user season - Only watched
        When I send a DELETE request to "/api/user/series/5/season/6"

        Then the response status should be 200
        And the database should have these user episodes deleted:
            | key           | userId | episodeId              |
            | deletedFirst  | user-1 | @episodes.singleFirst  |
            | deletedSecond | user-1 | @episodes.singleSecond |

        And the database should have these user series fields updated:
            | userId | seriesId                   | status  | watchCount | watchedEpisodeCount | lastWatchedAt |
            | user-1 | @series.singleSeasonSeries | PLANNED | 0          | 0                   |               |

        And the response array at "$" should exactly match these fixtures:
            | fixture                     |
            | @userEpisodes.deletedFirst  |
            | @userEpisodes.deletedSecond |

    Scenario: Delete user season - Latest from paused
        When I send a DELETE request to "/api/user/series/6/season/7"

        Then the response status should be 200
        And the database should have these user episodes deleted:
            | key           | userId | episodeId                      |
            | deletedFirst  | user-1 | @episodes.pausedDeletedFirst  |
            | deletedSecond | user-1 | @episodes.pausedDeletedSecond |

        And the database should have these user series fields updated:
            | userId | seriesId            | status   | watchCount | watchedEpisodeCount | lastWatchedAt            |
            | user-1 | @series.pausedSeries | WATCHING | 1          | 1                   | 2026-01-10T00:00:00.000Z |

        And the response array at "$" should exactly match these fixtures:
            | fixture                     |
            | @userEpisodes.deletedFirst  |
            | @userEpisodes.deletedSecond |

    Scenario: Delete user season - Older from watching
        When I send a DELETE request to "/api/user/series/7/season/9"

        Then the response status should be 200
        And the database should have these user episodes deleted:
            | key           | userId | episodeId                      |
            | deletedFirst  | user-1 | @episodes.watchingOlderFirst  |
            | deletedSecond | user-1 | @episodes.watchingOlderSecond |

        And the database should have these user series fields updated:
            | userId | seriesId               | watchCount | watchedEpisodeCount |
            | user-1 | @series.watchingSeries | 1          | 1                   |

        And the response array at "$" should exactly match these fixtures:
            | fixture                     |
            | @userEpisodes.deletedFirst  |
            | @userEpisodes.deletedSecond |

    Scenario: Delete user season - Partially watched
        When I send a DELETE request to "/api/user/series/8/season/11"

        Then the response status should be 200
        And the database should have these user episodes deleted:
            | key           | userId | episodeId               |
            | deletedFirst  | user-1 | @episodes.partialFirst  |
            | deletedSecond | user-1 | @episodes.partialSecond |

        And the database should have these user series fields updated:
            | userId | seriesId              | status  | watchCount | watchedEpisodeCount | lastWatchedAt |
            | user-1 | @series.partialSeries | PLANNED | 0          | 0                   |               |

        And the response array at "$" should exactly match these fixtures:
            | fixture                     |
            | @userEpisodes.deletedFirst  |
            | @userEpisodes.deletedSecond |

    Scenario: Delete user season - Only watched special
        When I send a DELETE request to "/api/user/series/2/season/3"

        Then the response status should be 200
        And the database should have these user episodes deleted:
            | key     | userId | episodeId                |
            | deleted | user-1 | @episodes.specialEpisode |

        And the database should have these user series fields updated:
            | userId | seriesId              | status  | watchedEpisodeCount | lastWatchedAt |
            | user-1 | @series.specialSeries | PLANNED | 0                   |               |

        And the response array at "$" should exactly match these fixtures:
            | fixture               |
            | @userEpisodes.deleted |

    Scenario: Delete user season - Special with regular remaining
        When I send a DELETE request to "/api/user/series/9/season/13"

        Then the response status should be 200
        And the database should have these user episodes deleted:
            | key           | userId | episodeId                    |
            | deletedFirst  | user-1 | @episodes.mixedSpecialFirst  |
            | deletedSecond | user-1 | @episodes.mixedSpecialSecond |

        And the database should have these user series fields updated:
            | userId | seriesId            | watchedEpisodeCount | lastWatchedAt            |
            | user-1 | @series.mixedSeries | 1                   | 2026-01-10T00:00:00.000Z |

        And the response array at "$" should exactly match these fixtures:
            | fixture                     |
            | @userEpisodes.deletedFirst  |
            | @userEpisodes.deletedSecond |

    Scenario: Delete user season - Not watched
        When I send a DELETE request to "/api/user/series/3/season/4"

        Then the response status should be 404
        And the response body should exactly match:
            | code                   | message                         |
            | USER_EPISODE_NOT_FOUND | Episode for this user not found |

    Scenario: Delete user season - Watched by another user
        When I send a DELETE request to "/api/user/series/10/season/14"

        Then the response status should be 404
        And the response body should exactly match:
            | code                   | message                         |
            | USER_EPISODE_NOT_FOUND | Episode for this user not found |

    Scenario: Delete user season - Series not added
        When I send a DELETE request to "/api/user/series/4/season/5"

        Then the response status should be 404
        And the response body should exactly match:
            | code                  | message                        |
            | USER_SERIES_NOT_FOUND | Series for this user not found |

    Scenario: Delete user season - Another series
        When I send a DELETE request to "/api/user/series/1/season/3"

        Then the response status should be 404
        And the response body should exactly match:
            | code              | message           |
            | EPISODE_NOT_FOUND | Episode not found |

    Scenario: Delete user season - Missing series
        When I send a DELETE request to "/api/user/series/999/season/1"

        Then the response status should be 404
        And the response body should exactly match:
            | code              | message           |
            | EPISODE_NOT_FOUND | Episode not found |

    Scenario: Delete user season - Empty
        When I send a DELETE request to "/api/user/series/3/season/15"

        Then the response status should be 404
        And the response body should exactly match:
            | code              | message           |
            | EPISODE_NOT_FOUND | Episode not found |

    Scenario: Delete user season - Missing season
        When I send a DELETE request to "/api/user/series/1/season/999"

        Then the response status should be 404
        And the response body should exactly match:
            | code              | message           |
            | EPISODE_NOT_FOUND | Episode not found |

    Scenario: Delete user season - Invalid parameters
        When I send a DELETE request to "/api/user/series/invalid/season/invalid"

        Then the response status should be 400
