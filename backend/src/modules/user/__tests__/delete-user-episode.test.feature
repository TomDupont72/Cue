Feature: DELETE /api/user/series/:seriesId/episode/:episodeId

    Background:
        Given authentication as "user-1"

        And the database with these series:
            | key             | id | numberOfEpisodes | inProduction |
            | watchedSeries   | 1  | 2                | false        |
            | specialSeries   | 2  | 0                | false        |
            | untrackedSeries | 3  | 1                | false        |

        And the database with these episodes:
            | key                 | id | seriesId                | seasonNumber | episodeNumber |
            | firstWatchedEpisode | 1  | @series.watchedSeries   | 1            | 1             |
            | lastWatchedEpisode  | 2  | @series.watchedSeries   | 1            | 2             |
            | notWatchedEpisode   | 3  | @series.watchedSeries   | 1            | 3             |
            | watchedSpecial      | 4  | @series.specialSeries   | 0            | 1             |
            | untrackedEpisode    | 5  | @series.untrackedSeries | 1            | 1             |

        And the database with these user series:
            | userId | seriesId              | status    | watchCount | watchedEpisodeCount | lastWatchedAt            |
            | user-1 | @series.watchedSeries | COMPLETED | 2          | 2                   | 2026-01-20T00:00:00.000Z |
            | user-1 | @series.specialSeries | WATCHING  | 0          | 1                   | 2026-01-25T00:00:00.000Z |

        And the database with these user episodes:
            | userId | episodeId                     | watchedAt                |
            | user-1 | @episodes.firstWatchedEpisode | 2026-01-10T00:00:00.000Z |
            | user-1 | @episodes.lastWatchedEpisode  | 2026-01-20T00:00:00.000Z |
            | user-1 | @episodes.watchedSpecial      | 2026-01-25T00:00:00.000Z |

    Scenario: Delete the latest watched episode
        When I send a DELETE request to "/api/user/series/1/episode/2"

        Then the response status should be 200
        And the database should have these user episodes deleted:
            | key     | userId | episodeId                    |
            | deleted | user-1 | @episodes.lastWatchedEpisode |

        And the database should have these user series fields updated:
            | userId | seriesId              | status   | watchCount | watchedEpisodeCount | lastWatchedAt            |
            | user-1 | @series.watchedSeries | WATCHING | 1          | 1                   | 2026-01-10T00:00:00.000Z |

        And the response body should exactly match this fixture:
            | fixture               |
            | @userEpisodes.deleted |

    Scenario: Delete a watched special episode
        When I send a DELETE request to "/api/user/series/2/episode/4"

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

    Scenario: Delete an episode not watched by the user
        When I send a DELETE request to "/api/user/series/1/episode/3"

        Then the response status should be 404
        And the response body should exactly match:
            | code                   | message                         |
            | USER_EPISODE_NOT_FOUND | Episode for this user not found |

    Scenario: Delete an episode from a series not added by the user
        When I send a DELETE request to "/api/user/series/3/episode/5"

        Then the response status should be 404
        And the response body should exactly match:
            | code                  | message                        |
            | USER_SERIES_NOT_FOUND | Series for this user not found |

    Scenario: Delete a missing episode
        When I send a DELETE request to "/api/user/series/1/episode/99"

        Then the response status should be 404
        And the response body should exactly match:
            | code              | message           |
            | EPISODE_NOT_FOUND | Episode not found |

    Scenario: Delete episode with invalid parameters
        When I send a DELETE request to "/api/user/series/invalid/episode/invalid"

        Then the response status should be 400
