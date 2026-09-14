Feature: POST /api/user/series/:seriesId/episode/:episodeId

    Background:
        Given authentication as "user-1"

        And the current date "2026-02-01T00:00:00.000Z"

        And the database with these series:
            | key             | id | numberOfEpisodes | inProduction |
            | addedSeries     | 1  | 3                | false        |
            | notAddedSeries  | 2  | 4                | false        |
            | completedSeries | 3  | 1                | false        |
            | pausedSeries    | 4  | 1                | true         |
            | watchingSeries  | 5  | 3                | true         |
            | alreadyWatched  | 6  | 1                | false        |

        And the database with these episodes:
            | key                   | id | seriesId                | seasonNumber | episodeNumber | airDate                  |
            | addedEpisode          | 1  | @series.addedSeries     | 1            | 1             | 2026-01-01T00:00:00.000Z |
            | notAddedEpisode       | 2  | @series.addedSeries     | 1            | 2             | 2026-01-10T00:00:00.000Z |
            | notAddedSeries        | 3  | @series.notAddedSeries  | 1            | 1             | 2026-01-15T00:00:00.000Z |
            | specialEpisode        | 4  | @series.notAddedSeries  | 0            | 1             | 2026-01-20T00:00:00.000Z |
            | newSpecialEpisode     | 5  | @series.addedSeries     | 0            | 1             | 2026-01-25T00:00:00.000Z |
            | completedFinalEpisode | 6  | @series.completedSeries | 1            | 1             | 2026-01-25T00:00:00.000Z |
            | pausedFinalEpisode    | 7  | @series.pausedSeries    | 1            | 1             | 2026-01-25T00:00:00.000Z |
            | watchedEpisode        | 8  | @series.watchingSeries  | 1            | 1             | 2026-01-20T00:00:00.000Z |
            | newEpisode            | 9  | @series.watchingSeries  | 1            | 2             | 2026-01-25T00:00:00.000Z |
            | futureWatchingEpisode | 10 | @series.watchingSeries  | 1            | 3             | 2026-02-03T00:00:00.000Z |
            | alreadyWatchedEpisode | 11 | @series.alreadyWatched  | 1            | 1             | 2026-01-25T00:00:00.000Z |
            | todaysEpisode         | 12 | @series.notAddedSeries  | 1            | 2             | 2026-02-01T23:59:59.999Z |
            | futureEpisode         | 13 | @series.notAddedSeries  | 1            | 3             | 2026-02-02T00:00:00.000Z |
            | undatedEpisode        | 14 | @series.notAddedSeries  | 1            | 4             |                          |

        And the database with these user series:
            | userId | seriesId               | lastWatchedAt            | status    | watchCount | watchedEpisodeCount |
            | user-1 | @series.addedSeries    | 2026-01-05T00:00:00.000Z | DROPPED   | 1          | 1                   |
            | user-1 | @series.watchingSeries | 2026-01-20T00:00:00.000Z | WATCHING  | 1          | 1                   |
            | user-1 | @series.alreadyWatched | 2026-01-25T00:00:00.000Z | COMPLETED | 1          | 1                   |

        And the database with these user episodes:
            | key     | userId | episodeId                       | watchedAt                |
            | existed | user-1 | @episodes.addedEpisode          | 2026-02-01T00:00:00.000Z |
            |         | user-1 | @episodes.watchedEpisode        | 2026-01-20T00:00:00.000Z |
            | watched | user-1 | @episodes.alreadyWatchedEpisode | 2026-01-25T00:00:00.000Z |

    Scenario: Post user episode
        When I send a POST request to "/api/user/series/1/episode/2"

        Then the response status should be 200
        And the database should have these user episodes added:
            | key     | userId | episodeId                 | watchedAt                |
            | created | user-1 | @episodes.notAddedEpisode | 2026-02-01T00:00:00.000Z |

        And the database should have these user series fields updated:
            | userId | seriesId            | lastWatchedAt            | status   | watchCount | watchedEpisodeCount |
            | user-1 | @series.addedSeries | 2026-02-01T00:00:00.000Z | WATCHING | 2          | 2                   |

        And the response body should exactly match this fixture:
            | fixture               |
            | @userEpisodes.created |

    Scenario: Post user episode - Not added series
        When I send a POST request to "/api/user/series/2/episode/3"

        Then the response status should be 200
        And the database should have these user episodes added:
            | key     | userId | episodeId                | watchedAt                |
            | created | user-1 | @episodes.notAddedSeries | 2026-02-01T00:00:00.000Z |

        And the database should have these user series added:
            | userId | seriesId               | lastWatchedAt            | status   | watchCount | watchedEpisodeCount |
            | user-1 | @series.notAddedSeries | 2026-02-01T00:00:00.000Z | WATCHING | 1          | 1                   |

        And the response body should exactly match this fixture:
            | fixture               |
            | @userEpisodes.created |

    Scenario: Post user episode - Special episode
        When I send a POST request to "/api/user/series/2/episode/4"

        Then the response status should be 200
        And the database should have these user episodes added:
            | key     | userId | episodeId                | watchedAt                |
            | created | user-1 | @episodes.specialEpisode | 2026-02-01T00:00:00.000Z |

        And the database should have these user series added:
            | userId | seriesId               | lastWatchedAt            | status   | watchCount | watchedEpisodeCount |
            | user-1 | @series.notAddedSeries | 2026-02-01T00:00:00.000Z | WATCHING | 0          | 1                   |

        And the response body should exactly match this fixture:
            | fixture               |
            | @userEpisodes.created |

    Scenario: Post user episode - Special episode on an added series
        When I send a POST request to "/api/user/series/1/episode/5"

        Then the response status should be 200
        And the database should have these user episodes added:
            | key     | userId | episodeId                   | watchedAt                |
            | created | user-1 | @episodes.newSpecialEpisode | 2026-02-01T00:00:00.000Z |

        And the database should have these user series fields updated:
            | userId | seriesId            | lastWatchedAt            | status   | watchedEpisodeCount |
            | user-1 | @series.addedSeries | 2026-02-01T00:00:00.000Z | WATCHING | 2                   |

        And the response body should exactly match this fixture:
            | fixture               |
            | @userEpisodes.created |

    Scenario: Post user episode - Completes a series
        When I send a POST request to "/api/user/series/3/episode/6"

        Then the response status should be 200
        And the database should have these user episodes added:
            | key     | userId | episodeId                       | watchedAt                |
            | created | user-1 | @episodes.completedFinalEpisode | 2026-02-01T00:00:00.000Z |

        And the database should have these user series added:
            | userId | seriesId                | lastWatchedAt            | status    | watchCount | watchedEpisodeCount |
            | user-1 | @series.completedSeries | 2026-02-01T00:00:00.000Z | COMPLETED | 1          | 1                   |

        And the response body should exactly match this fixture:
            | fixture               |
            | @userEpisodes.created |

    Scenario: Post user episode - Pauses an ongoing series
        When I send a POST request to "/api/user/series/4/episode/7"

        Then the response status should be 200
        And the database should have these user episodes added:
            | key     | userId | episodeId                    | watchedAt                |
            | created | user-1 | @episodes.pausedFinalEpisode | 2026-02-01T00:00:00.000Z |

        And the database should have these user series added:
            | userId | seriesId             | lastWatchedAt            | status | watchCount | watchedEpisodeCount |
            | user-1 | @series.pausedSeries | 2026-02-01T00:00:00.000Z | PAUSED | 1          | 1                   |

        And the response body should exactly match this fixture:
            | fixture               |
            | @userEpisodes.created |

    Scenario: Post user episode - Keeps watching a series
        When I send a POST request to "/api/user/series/5/episode/9"

        Then the response status should be 200
        And the database should have these user episodes added:
            | key     | userId | episodeId            | watchedAt                |
            | created | user-1 | @episodes.newEpisode | 2026-02-01T00:00:00.000Z |

        And the database should have these user series fields updated:
            | userId | seriesId               | lastWatchedAt            | watchCount | watchedEpisodeCount |
            | user-1 | @series.watchingSeries | 2026-02-01T00:00:00.000Z | 2          | 2                   |

        And the response body should exactly match this fixture:
            | fixture               |
            | @userEpisodes.created |

    Scenario: Post user episode - Already added
        When I send a POST request to "/api/user/series/1/episode/1"

        Then the response status should be 200
        And the database should contain exactly these user episodes:
            | userId | episodeId                       |
            | user-1 | @episodes.addedEpisode          |
            | user-1 | @episodes.watchedEpisode        |
            | user-1 | @episodes.alreadyWatchedEpisode |

        And the database should contain exactly these user series:
            | userId | seriesId               |
            | user-1 | @series.addedSeries    |
            | user-1 | @series.watchingSeries |
            | user-1 | @series.alreadyWatched |

        And the response body should exactly match this fixture:
            | fixture               |
            | @userEpisodes.existed |

    Scenario: Post user episode - Already added among other episodes
        When I send a POST request to "/api/user/series/6/episode/11"

        Then the response status should be 200
        And the database should contain exactly these user episodes:
            | userId | episodeId                       |
            | user-1 | @episodes.addedEpisode          |
            | user-1 | @episodes.watchedEpisode        |
            | user-1 | @episodes.alreadyWatchedEpisode |

        And the database should contain exactly these user series:
            | userId | seriesId               |
            | user-1 | @series.addedSeries    |
            | user-1 | @series.watchingSeries |
            | user-1 | @series.alreadyWatched |

        And the response body should exactly match this fixture:
            | fixture               |
            | @userEpisodes.watched |

    Scenario: Post user episode - Already watched by another user
        Given authentication as "user-2"

        When I send a POST request to "/api/user/series/1/episode/1"

        Then the response status should be 200
        And the database should have these user episodes added:
            | key     | userId | episodeId              | watchedAt                |
            | created | user-2 | @episodes.addedEpisode | 2026-02-01T00:00:00.000Z |

        And the database should have these user series added:
            | userId | seriesId            | lastWatchedAt            | status   | watchCount | watchedEpisodeCount |
            | user-2 | @series.addedSeries | 2026-02-01T00:00:00.000Z | WATCHING | 1          | 1                   |

        And the response body should exactly match this fixture:
            | fixture               |
            | @userEpisodes.created |

    Scenario: Post user episode - Airing today
        When I send a POST request to "/api/user/series/2/episode/12"

        Then the response status should be 200
        And the database should have these user episodes added:
            | key     | userId | episodeId               | watchedAt                |
            | created | user-1 | @episodes.todaysEpisode | 2026-02-01T00:00:00.000Z |

        And the database should have these user series added:
            | userId | seriesId               | lastWatchedAt            | status   | watchCount | watchedEpisodeCount |
            | user-1 | @series.notAddedSeries | 2026-02-01T00:00:00.000Z | WATCHING | 1          | 1                   |

        And the response body should exactly match this fixture:
            | fixture               |
            | @userEpisodes.created |

    Scenario: Post user episode - Missing series
        When I send a POST request to "/api/user/series/999/episode/1"

        Then the response status should be 404
        And the response body should exactly match:
            | code             | message          |
            | SERIES_NOT_FOUND | Series not found |

    Scenario: Post user episode - Missing episode
        When I send a POST request to "/api/user/series/2/episode/999"

        Then the response status should be 404
        And the response body should exactly match:
            | code              | message           |
            | EPISODE_NOT_FOUND | Episode not found |

    Scenario: Post user episode - Episode belongs to another series
        When I send a POST request to "/api/user/series/2/episode/1"

        Then the response status should be 404
        And the response body should exactly match:
            | code              | message           |
            | EPISODE_NOT_FOUND | Episode not found |

    Scenario: Post user episode - Episode airs tomorrow
        When I send a POST request to "/api/user/series/2/episode/13"

        Then the response status should be 404
        And the response body should exactly match:
            | code              | message           |
            | EPISODE_NOT_FOUND | Episode not found |

    Scenario: Post user episode - Episode has no air date
        When I send a POST request to "/api/user/series/2/episode/14"

        Then the response status should be 404
        And the response body should exactly match:
            | code              | message           |
            | EPISODE_NOT_FOUND | Episode not found |

    Scenario: Post user episode - Invalid parameters
        When I send a POST request to "/api/user/series/invalid/episode/invalid"

        Then the response status should be 400
