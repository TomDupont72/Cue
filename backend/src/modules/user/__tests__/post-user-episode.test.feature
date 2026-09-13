Feature: POST /api/user/series/:seriesId/episode/:episodeId

    Background:
        Given authentication as "user-1"

        And the current date "2026-02-01T00:00:00.000Z"

        And the database with these series:
            | key            | id |
            | addedSeries    | 1  |
            | notAddedSeries | 2  |

        And the database with these episodes:
            | key             | id | seriesId               | seasonNumber | episodeNumber | airDate                  |
            | addedEpisode    | 1  | @series.addedSeries    | 1            | 1             | 2026-01-01T00:00:00.000Z |
            | notAddedEpisode | 2  | @series.addedSeries    | 1            | 2             | 2026-01-10T00:00:00.000Z |
            | notAddedSeries  | 3  | @series.notAddedSeries | 1            | 1             | 2026-01-15T00:00:00.000Z |
            | specialEpisode  | 4  | @series.notAddedSeries | 0            | 1             | 2026-01-20T00:00:00.000Z |

        And the database with these user series:
            | userId | seriesId            | lastWatchedAt            | status  | watchCount | watchedEpisodeCount |
            | user-1 | @series.addedSeries | 2026-01-05T00:00:00.000Z | DROPPED | 1          | 1                   |

        And the database with these user episodes:
            | userId | episodeId              |
            | user-1 | @episodes.addedEpisode |

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

    Scenario: Post user episode - Already added
        When I send a POST request to "/api/user/series/1/episode/1"

        Then the response status should be 200
        And the database should contain exactly these user episodes:
            | key     | userId | episodeId              |
            | existed | user-1 | @episodes.addedEpisode |

        And the response body should exactly match this fixture:
            | fixture               |
            | @userEpisodes.existed |

    Scenario: Post user episode - Missing series
        When I send a POST request to "/api/user/series/4/episode/1"

        Then the response status should be 404
        And the response body should exactly match:
            | code             | message          |
            | SERIES_NOT_FOUND | Series not found |

    Scenario: Post user episode - Missing episode
        When I send a POST request to "/api/user/series/2/episode/5"

        Then the response status should be 404
        And the response body should exactly match:
            | code              | message           |
            | EPISODE_NOT_FOUND | Episode not found |