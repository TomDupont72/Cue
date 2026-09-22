Feature: POST /api/user/series/:seriesId/season/:seasonId

    Background:
        Given authentication as "user-1"

        And the current date "2026-02-01T00:00:00.000Z"

        And the database with these series:
            | key                | id | numberOfEpisodes | inProduction |
            | addedSeries        | 1  | 3                | false        |
            | notAddedSeries     | 2  | 2                | false        |
            | specialSeries      | 3  | 0                | false        |
            | alreadyAddedSeries | 4  | 2                | false        |
            | pausedSeries       | 5  | 1                | true         |
            | watchingSeries     | 6  | 3                | true         |
            | releaseSeries      | 7  | 3                | false        |

        And the database with these seasons:
            | key                | id | seriesId                   | seasonNumber |
            | addedSeason        | 1  | @series.addedSeries        | 1            |
            | notAddedSeason     | 2  | @series.notAddedSeries     | 1            |
            | specialSeason      | 3  | @series.specialSeries      | 0            |
            | alreadyAddedSeason | 4  | @series.alreadyAddedSeries | 1            |
            | addedSpecialSeason | 5  | @series.addedSeries        | 0            |
            | pausedSeason       | 6  | @series.pausedSeries       | 1            |
            | watchingSeason     | 7  | @series.watchingSeries     | 1            |
            | todaySeason        | 8  | @series.releaseSeries      | 1            |
            | futureSeason       | 9  | @series.releaseSeries      | 2            |
            | undatedSeason      | 10 | @series.releaseSeries      | 3            |
            | emptySeason        | 11 | @series.releaseSeries      | 4            |

        And the database with these episodes:
            | key                  | id | seriesId                   | seasonId                    | seasonNumber | airDate                  |
            | addedSeasonFirst     | 1  | @series.addedSeries        | @seasons.addedSeason        | 1            | 2026-01-01T00:00:00.000Z |
            | addedSeasonSecond    | 2  | @series.addedSeries        | @seasons.addedSeason        | 1            | 2026-01-10T00:00:00.000Z |
            | addedSeasonUpcoming  | 3  | @series.addedSeries        | @seasons.addedSeason        | 1            | 2026-02-03T00:00:00.000Z |
            | notAddedSeasonFirst  | 4  | @series.notAddedSeries     | @seasons.notAddedSeason     | 1            | 2026-01-15T00:00:00.000Z |
            | notAddedSeasonSecond | 5  | @series.notAddedSeries     | @seasons.notAddedSeason     | 1            | 2026-01-20T00:00:00.000Z |
            | specialEpisode       | 6  | @series.specialSeries      | @seasons.specialSeason      | 0            | 2026-01-20T00:00:00.000Z |
            | alreadyAddedFirst    | 7  | @series.alreadyAddedSeries | @seasons.alreadyAddedSeason | 1            | 2026-01-01T00:00:00.000Z |
            | alreadyAddedSecond   | 8  | @series.alreadyAddedSeries | @seasons.alreadyAddedSeason | 1            | 2026-01-10T00:00:00.000Z |
            | addedSpecialEpisode  | 9  | @series.addedSeries        | @seasons.addedSpecialSeason | 0            | 2026-01-25T00:00:00.000Z |
            | pausedFinalEpisode   | 10 | @series.pausedSeries       | @seasons.pausedSeason       | 1            | 2026-01-25T00:00:00.000Z |
            | watchedWatching      | 11 | @series.watchingSeries     | @seasons.watchingSeason     | 1            | 2026-01-20T00:00:00.000Z |
            | newWatching          | 12 | @series.watchingSeries     | @seasons.watchingSeason     | 1            | 2026-01-25T00:00:00.000Z |
            | futureWatching       | 13 | @series.watchingSeries     | @seasons.watchingSeason     | 1            | 2026-02-03T00:00:00.000Z |
            | todaysEpisode        | 14 | @series.releaseSeries      | @seasons.todaySeason        | 1            | 2026-02-01T23:59:59.999Z |
            | tomorrowEpisode      | 15 | @series.releaseSeries      | @seasons.futureSeason       | 2            | 2026-02-02T00:00:00.000Z |
            | undatedEpisode       | 16 | @series.releaseSeries      | @seasons.undatedSeason      | 3            |                          |

        And the database with these user series:
            | userId | seriesId                   | status    | watchCount | watchedEpisodeCount |
            | user-1 | @series.addedSeries        | DROPPED   | 1          | 1                   |
            | user-1 | @series.alreadyAddedSeries | COMPLETED | 2          | 2                   |
            | user-1 | @series.watchingSeries     | WATCHING  | 1          | 1                   |

        And the database with these user episodes:
            | key           | userId | episodeId                    | watchedAt                |
            | existed       | user-1 | @episodes.addedSeasonFirst   | 2026-01-05T00:00:00.000Z |
            | alreadyFirst  | user-1 | @episodes.alreadyAddedFirst  | 2026-01-01T00:00:00.000Z |
            | alreadySecond | user-1 | @episodes.alreadyAddedSecond | 2026-01-10T00:00:00.000Z |
            | watchingFirst | user-1 | @episodes.watchedWatching    | 2026-01-20T00:00:00.000Z |

    Scenario: Post user season
        When I send a POST request to "/api/user/series/1/season/1"

        Then the response status should be 200
        And the database should have these user episodes added:
            | key     | userId | episodeId                   | watchedAt                |
            | created | user-1 | @episodes.addedSeasonSecond | 2026-02-01T00:00:00.000Z |

        And the database should have these user series fields updated:
            | userId | seriesId            | lastWatchedAt            | status   | watchCount | watchedEpisodeCount |
            | user-1 | @series.addedSeries | 2026-02-01T00:00:00.000Z | WATCHING | 2          | 2                   |

        And the response array at "$" should exactly match these fixtures:
            | fixture               |
            | @userEpisodes.existed |
            | @userEpisodes.created |

    Scenario: Post user season - Not added series
        When I send a POST request to "/api/user/series/2/season/2"

        Then the response status should be 200
        And the database should have these user episodes added:
            | key    | userId | episodeId                      | watchedAt                |
            | first  | user-1 | @episodes.notAddedSeasonFirst  | 2026-02-01T00:00:00.000Z |
            | second | user-1 | @episodes.notAddedSeasonSecond | 2026-02-01T00:00:00.000Z |

        And the database should have these user series added:
            | userId | seriesId               | lastWatchedAt            | status    | watchCount | watchedEpisodeCount |
            | user-1 | @series.notAddedSeries | 2026-02-01T00:00:00.000Z | COMPLETED | 2          | 2                   |

        And the response array at "$" should exactly match these fixtures:
            | fixture              |
            | @userEpisodes.first  |
            | @userEpisodes.second |

    Scenario: Post user season - Special season
        When I send a POST request to "/api/user/series/3/season/3"

        Then the response status should be 200
        And the database should have these user episodes added:
            | key     | userId | episodeId                | watchedAt                |
            | created | user-1 | @episodes.specialEpisode | 2026-02-01T00:00:00.000Z |

        And the database should have these user series added:
            | userId | seriesId              | lastWatchedAt            | status   | watchCount | watchedEpisodeCount |
            | user-1 | @series.specialSeries | 2026-02-01T00:00:00.000Z | WATCHING | 0          | 1                   |

        And the response array at "$" should exactly match these fixtures:
            | fixture               |
            | @userEpisodes.created |

    Scenario: Post user season - Special season on an added series
        When I send a POST request to "/api/user/series/1/season/5"

        Then the response status should be 200
        And the database should have these user episodes added:
            | key     | userId | episodeId                     | watchedAt                |
            | created | user-1 | @episodes.addedSpecialEpisode | 2026-02-01T00:00:00.000Z |

        And the database should have these user series fields updated:
            | userId | seriesId            | lastWatchedAt            | status   | watchedEpisodeCount |
            | user-1 | @series.addedSeries | 2026-02-01T00:00:00.000Z | WATCHING | 2                   |

        And the response array at "$" should exactly match these fixtures:
            | fixture               |
            | @userEpisodes.created |

    Scenario: Post user season - Pauses an ongoing series
        When I send a POST request to "/api/user/series/5/season/6"

        Then the response status should be 200
        And the database should have these user episodes added:
            | key     | userId | episodeId                    | watchedAt                |
            | created | user-1 | @episodes.pausedFinalEpisode | 2026-02-01T00:00:00.000Z |

        And the database should have these user series added:
            | userId | seriesId             | lastWatchedAt            | status | watchCount | watchedEpisodeCount |
            | user-1 | @series.pausedSeries | 2026-02-01T00:00:00.000Z | PAUSED | 1          | 1                   |

        And the response array at "$" should exactly match these fixtures:
            | fixture               |
            | @userEpisodes.created |

    Scenario: Post user season - Keeps watching a series
        When I send a POST request to "/api/user/series/6/season/7"

        Then the response status should be 200
        And the database should have these user episodes added:
            | key     | userId | episodeId             | watchedAt                |
            | created | user-1 | @episodes.newWatching | 2026-02-01T00:00:00.000Z |

        And the database should have these user series fields updated:
            | userId | seriesId               | lastWatchedAt            | watchCount | watchedEpisodeCount |
            | user-1 | @series.watchingSeries | 2026-02-01T00:00:00.000Z | 2          | 2                   |

        And the response array at "$" should exactly match these fixtures:
            | fixture                     |
            | @userEpisodes.watchingFirst |
            | @userEpisodes.created       |

    Scenario: Post user season - Already added
        When I send a POST request to "/api/user/series/4/season/4"

        Then the response status should be 200
        And the database should contain exactly these user episodes:
            | userId | episodeId                    |
            | user-1 | @episodes.addedSeasonFirst   |
            | user-1 | @episodes.alreadyAddedFirst  |
            | user-1 | @episodes.alreadyAddedSecond |
            | user-1 | @episodes.watchedWatching    |

        And the database should contain exactly these user series:
            | userId | seriesId                   |
            | user-1 | @series.addedSeries        |
            | user-1 | @series.alreadyAddedSeries |
            | user-1 | @series.watchingSeries     |

        And the response array at "$" should exactly match these fixtures:
            | fixture                     |
            | @userEpisodes.alreadyFirst  |
            | @userEpisodes.alreadySecond |

    Scenario: Post user season - Already watched by another user
        Given authentication as "user-2"

        When I send a POST request to "/api/user/series/1/season/1"

        Then the response status should be 200
        And the database should have these user episodes added:
            | key    | userId | episodeId                   | watchedAt                |
            | first  | user-2 | @episodes.addedSeasonFirst  | 2026-02-01T00:00:00.000Z |
            | second | user-2 | @episodes.addedSeasonSecond | 2026-02-01T00:00:00.000Z |

        And the database should have these user series added:
            | userId | seriesId            | lastWatchedAt            | status   | watchCount | watchedEpisodeCount |
            | user-2 | @series.addedSeries | 2026-02-01T00:00:00.000Z | WATCHING | 2          | 2                   |

        And the response array at "$" should exactly match these fixtures:
            | fixture              |
            | @userEpisodes.first  |
            | @userEpisodes.second |

    Scenario: Post user season - Airing today
        When I send a POST request to "/api/user/series/7/season/8"

        Then the response status should be 200
        And the database should have these user episodes added:
            | key     | userId | episodeId               | watchedAt                |
            | created | user-1 | @episodes.todaysEpisode | 2026-02-01T00:00:00.000Z |

        And the database should have these user series added:
            | userId | seriesId              | lastWatchedAt            | status   | watchCount | watchedEpisodeCount |
            | user-1 | @series.releaseSeries | 2026-02-01T00:00:00.000Z | WATCHING | 1          | 1                   |

        And the response array at "$" should exactly match these fixtures:
            | fixture               |
            | @userEpisodes.created |

    Scenario: Post user season - Missing episodes
        When I send a POST request to "/api/user/series/1/season/99"

        Then the response status should be 404
        And the response body should exactly match:
            | code              | message           |
            | EPISODE_NOT_FOUND | Episode not found |

    Scenario: Post user season - Season belongs to another series
        When I send a POST request to "/api/user/series/1/season/2"

        Then the response status should be 404
        And the response body should exactly match:
            | code              | message           |
            | EPISODE_NOT_FOUND | Episode not found |

    Scenario: Post user season - Season airs tomorrow
        When I send a POST request to "/api/user/series/7/season/9"

        Then the response status should be 404
        And the response body should exactly match:
            | code              | message           |
            | EPISODE_NOT_FOUND | Episode not found |

    Scenario: Post user season - Season has no air date
        When I send a POST request to "/api/user/series/7/season/10"

        Then the response status should be 404
        And the response body should exactly match:
            | code              | message           |
            | EPISODE_NOT_FOUND | Episode not found |

    Scenario: Post user season - Empty season
        When I send a POST request to "/api/user/series/7/season/11"

        Then the response status should be 404
        And the response body should exactly match:
            | code              | message           |
            | EPISODE_NOT_FOUND | Episode not found |

    Scenario: Post user season - Invalid query
        When I send a POST request to "/api/user/series/invalid/season/invalid"

        Then the response status should be 400
