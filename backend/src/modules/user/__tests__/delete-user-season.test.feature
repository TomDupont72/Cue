Feature: DELETE /api/user/series/:seriesId/season/:seasonId

    Background:
        Given authentication as "user-1"

        And the database with these series:
            | key               | id | numberOfEpisodes | inProduction |
            | watchedSeries     | 1  | 3                | false        |
            | specialSeries     | 2  | 0                | false        |
            | notWatchedSeries  | 3  | 1                | false        |
            | untrackedSeries   | 4  | 1                | false        |

        And the database with these seasons:
            | key                 | id | seriesId                   | seasonNumber |
            | watchedSeason       | 1  | @series.watchedSeries      | 1            |
            | remainingSeason     | 2  | @series.watchedSeries      | 2            |
            | specialSeason       | 3  | @series.specialSeries      | 0            |
            | notWatchedSeason    | 4  | @series.notWatchedSeries   | 1            |
            | untrackedSeason     | 5  | @series.untrackedSeries    | 1            |

        And the database with these episodes:
            | key                  | id | seriesId                   | seasonId                    | seasonNumber | episodeNumber |
            | deletedFirst         | 1  | @series.watchedSeries      | @seasons.watchedSeason      | 1            | 1             |
            | deletedSecond        | 2  | @series.watchedSeries      | @seasons.watchedSeason      | 1            | 2             |
            | remainingEpisode     | 3  | @series.watchedSeries      | @seasons.remainingSeason    | 2            | 1             |
            | specialEpisode       | 4  | @series.specialSeries      | @seasons.specialSeason      | 0            | 1             |
            | notWatchedEpisode    | 5  | @series.notWatchedSeries   | @seasons.notWatchedSeason   | 1            | 1             |
            | untrackedEpisode     | 6  | @series.untrackedSeries    | @seasons.untrackedSeason    | 1            | 1             |

        And the database with these user series:
            | userId | seriesId                  | status    | watchCount | watchedEpisodeCount | lastWatchedAt            |
            | user-1 | @series.watchedSeries     | COMPLETED | 3          | 3                   | 2026-01-25T00:00:00.000Z |
            | user-1 | @series.specialSeries     | WATCHING  | 0          | 1                   | 2026-01-20T00:00:00.000Z |
            | user-1 | @series.notWatchedSeries  | PLANNED   | 0          | 0                   |                          |

        And the database with these user episodes:
            | userId | episodeId                  | watchedAt                |
            | user-1 | @episodes.deletedFirst     | 2026-01-20T00:00:00.000Z |
            | user-1 | @episodes.deletedSecond    | 2026-01-25T00:00:00.000Z |
            | user-1 | @episodes.remainingEpisode | 2026-01-10T00:00:00.000Z |
            | user-1 | @episodes.specialEpisode   | 2026-01-20T00:00:00.000Z |

    Scenario: Delete a watched season
        When I send a DELETE request to "/api/user/series/1/season/1"

        Then the response status should be 200
        And the database should have these user episodes deleted:
            | key           | userId | episodeId               |
            | deletedFirst  | user-1 | @episodes.deletedFirst  |
            | deletedSecond | user-1 | @episodes.deletedSecond |

        And the database should have these user series fields updated:
            | userId | seriesId              | status   | watchCount | watchedEpisodeCount | lastWatchedAt            |
            | user-1 | @series.watchedSeries | WATCHING | 1          | 1                   | 2026-01-10T00:00:00.000Z |

        And the response array at "$" should exactly match these fixtures:
            | fixture                         |
            | @userEpisodes.deletedFirst      |
            | @userEpisodes.deletedSecond     |

    Scenario: Delete a watched special season
        When I send a DELETE request to "/api/user/series/2/season/3"

        Then the response status should be 200
        And the database should have these user episodes deleted:
            | key     | userId | episodeId                |
            | deleted | user-1 | @episodes.specialEpisode |

        And the database should have these user series fields updated:
            | userId | seriesId             | status  | watchedEpisodeCount | lastWatchedAt |
            | user-1 | @series.specialSeries | PLANNED | 0                   |               |

        And the response array at "$" should exactly match these fixtures:
            | fixture               |
            | @userEpisodes.deleted |

    Scenario: Delete a season not watched by the user
        When I send a DELETE request to "/api/user/series/3/season/4"

        Then the response status should be 404
        And the response body should exactly match:
            | code                   | message                         |
            | USER_EPISODE_NOT_FOUND | Episode for this user not found |

    Scenario: Delete a season from a series not added by the user
        When I send a DELETE request to "/api/user/series/4/season/5"

        Then the response status should be 404
        And the response body should exactly match:
            | code                  | message                        |
            | USER_SERIES_NOT_FOUND | Series for this user not found |

    Scenario: Delete a season without episodes
        When I send a DELETE request to "/api/user/series/1/season/99"

        Then the response status should be 404
        And the response body should exactly match:
            | code               | message            |
            | EPISODES_NOT_FOUND | Episodes not found |

    Scenario: Delete season with invalid parameters
        When I send a DELETE request to "/api/user/series/invalid/season/invalid"

        Then the response status should be 400
