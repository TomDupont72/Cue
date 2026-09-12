Feature: POST /api/user/series/:seriesId/episode/:episodeId

    Background:
        Given authentication as "user-1"

        And the current date "2026-02-01T00:00:00.000Z"

        And the database with these series:
            | key             | id |
            | addedEpisode    | 1  |
            | notAddedEpisode | 2  |
            | notAddedSeries  | 3  |

        And the database with these episodes:
            | key                 | id | seriesId                | seasonNumber | episodeNumber | airDate                  |
            | addedEpisode        | 1  | @series.addedEpisode    | 1            | 1             | 2026-01-01T00:00:00.000Z |
            | notAddedEpisode     | 2  | @series.notAddedEpisode | 1            | 1             | 2026-01-15T00:00:00.000Z |
            | notAddedEpisodeNext | 3  | @series.notAddedEpisode | 1            | 2             | 2026-01-25T00:00:00.000Z |
            | notAddedSeries      | 4  | @series.notAddedSeries  | 1            | 1             | 2026-01-20T00:00:00.000Z |

        And the database with these user series:
            | userId | seriesId               |
            | user-1 | @series.addedEpisode   |
            | user-1 | @series.notAddedSeries |

        And the database with these user episodes:
            | userId | episodeId              |
            | user-1 | @episodes.addedEpisode |

    Scenario: Post user episode
        When I send a POST request to "/api/user/series/2/episode/2"

        Then the response status should be 200
        And the database should have these user episodes added:
            | key     | userId | episodeId                 | watchedAt                |
            | created | user-1 | @episodes.notAddedEpisode | 2026-02-01T00:00:00.000Z |

        And the response body should exactly match this fixture:
            | fixture               |
            | @userEpisodes.created |