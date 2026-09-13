Feature: POST /api/user/series/:seriesId/season/:seasonId

    Background:
        Given authentication as "user-1"

        And the current date "2026-02-01T00:00:00.000Z"

        And the database with these series:
            | key                | id | numberOfEpisodes |
            | addedSeries        | 1  | 3                |
            | notAddedSeries     | 2  | 2                |
            | specialSeries      | 3  | 0                |
            | alreadyAddedSeries | 4  | 2                |

        And the database with these seasons:
            | key                | id | seriesId                    | seasonNumber |
            | addedSeason        | 1  | @series.addedSeries         | 1            |
            | notAddedSeason     | 2  | @series.notAddedSeries      | 1            |
            | specialSeason      | 3  | @series.specialSeries       | 0            |
            | alreadyAddedSeason | 4  | @series.alreadyAddedSeries  | 1            |

        And the database with these episodes:
            | key                  | id | seriesId                    | seasonId                     | seasonNumber | episodeNumber | airDate                  |
            | addedSeasonFirst     | 1  | @series.addedSeries         | @seasons.addedSeason         | 1            | 1             | 2026-01-01T00:00:00.000Z |
            | addedSeasonSecond    | 2  | @series.addedSeries         | @seasons.addedSeason         | 1            | 2             | 2026-01-10T00:00:00.000Z |
            | addedSeasonUpcoming  | 3  | @series.addedSeries         | @seasons.addedSeason         | 1            | 3             | 2026-02-03T00:00:00.000Z |
            | notAddedSeasonFirst  | 4  | @series.notAddedSeries      | @seasons.notAddedSeason      | 1            | 1             | 2026-01-15T00:00:00.000Z |
            | notAddedSeasonSecond | 5  | @series.notAddedSeries      | @seasons.notAddedSeason      | 1            | 2             | 2026-01-20T00:00:00.000Z |
            | specialEpisode       | 6  | @series.specialSeries       | @seasons.specialSeason       | 0            | 1             | 2026-01-20T00:00:00.000Z |
            | alreadyAddedFirst    | 7  | @series.alreadyAddedSeries  | @seasons.alreadyAddedSeason  | 1            | 1             | 2026-01-01T00:00:00.000Z |
            | alreadyAddedSecond   | 8  | @series.alreadyAddedSeries  | @seasons.alreadyAddedSeason  | 1            | 2             | 2026-01-10T00:00:00.000Z |

        And the database with these user series:
            | userId | seriesId                    | lastWatchedAt            | status  | watchCount | watchedEpisodeCount |
            | user-1 | @series.addedSeries         | 2026-01-05T00:00:00.000Z | DROPPED | 1          | 1                   |
            | user-1 | @series.alreadyAddedSeries  | 2026-01-10T00:00:00.000Z | COMPLETED | 2        | 2                   |

        And the database with these user episodes:
            | key           | userId | episodeId                     | watchedAt                |
            | existed       | user-1 | @episodes.addedSeasonFirst    | 2026-01-05T00:00:00.000Z |
            | alreadyFirst  | user-1 | @episodes.alreadyAddedFirst   | 2026-01-01T00:00:00.000Z |
            | alreadySecond | user-1 | @episodes.alreadyAddedSecond  | 2026-01-10T00:00:00.000Z |

    Scenario: Post user season
        When I send a POST request to "/api/user/series/1/season/1"

        Then the response status should be 200
        And the database should have these user episodes added:
            | key     | userId | episodeId                  | watchedAt                |
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
            | key     | userId | episodeId                      | watchedAt                |
            | first   | user-1 | @episodes.notAddedSeasonFirst  | 2026-02-01T00:00:00.000Z |
            | second  | user-1 | @episodes.notAddedSeasonSecond | 2026-02-01T00:00:00.000Z |

        And the database should have these user series added:
            | userId | seriesId               | lastWatchedAt            | status    | watchCount | watchedEpisodeCount |
            | user-1 | @series.notAddedSeries | 2026-02-01T00:00:00.000Z | COMPLETED | 2          | 2                   |

        And the response array at "$" should exactly match these fixtures:
            | fixture                    |
            | @userEpisodes.first        |
            | @userEpisodes.second       |

    Scenario: Post user season - Special season
        When I send a POST request to "/api/user/series/3/season/3"

        Then the response status should be 200
        And the database should have these user episodes added:
            | key     | userId | episodeId                | watchedAt                |
            | created | user-1 | @episodes.specialEpisode | 2026-02-01T00:00:00.000Z |

        And the database should have these user series added:
            | userId | seriesId             | lastWatchedAt            | status   | watchCount | watchedEpisodeCount |
            | user-1 | @series.specialSeries | 2026-02-01T00:00:00.000Z | WATCHING | 0          | 1                   |

        And the response array at "$" should exactly match these fixtures:
            | fixture               |
            | @userEpisodes.created |

    Scenario: Post user season - Already added
        When I send a POST request to "/api/user/series/4/season/4"

        Then the response status should be 200
        And the database should contain exactly these user episodes:
            | userId | episodeId                     |
            | user-1 | @episodes.addedSeasonFirst    |
            | user-1 | @episodes.alreadyAddedFirst   |
            | user-1 | @episodes.alreadyAddedSecond  |

        And the response array at "$" should exactly match these fixtures:
            | fixture                       |
            | @userEpisodes.alreadyFirst    |
            | @userEpisodes.alreadySecond   |

    Scenario: Post user season - Missing episodes
        When I send a POST request to "/api/user/series/1/season/99"

        Then the response status should be 404
        And the response body should exactly match:
            | code               | message            |
            | EPISODES_NOT_FOUND | Episodes not found |

    Scenario: Post user season - Invalid query
        When I send a POST request to "/api/user/series/invalid/season/invalid"

        Then the response status should be 400
