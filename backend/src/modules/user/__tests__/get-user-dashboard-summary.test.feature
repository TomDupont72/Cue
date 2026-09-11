Feature: GET /api/user/dashboard/summary

    Background:
        Given authentication as "user-1"

    Scenario: Get user summary dashboard
        Given the database with these series:
            | key       | id | name      | numberOfEpisodes | numberOfSeasons |
            | completed | 1  | Completed | 2                | 1               |
            | watching  | 2  | Watching  | 2                | 1               |

        And the database with these seasons:
            | key        | id | seriesId          | seasonNumber |
            | completedS | 1  | @series.completed | 1            |
            | watchingS  | 2  | @series.watching  | 1            |

        And the database with these episodes:
            | key       | id | seriesId          | seasonId            | episodeNumber | seasonNumber | runtime |
            | watched20 | 1  | @series.completed | @seasons.completedS | 1             | 1            | 20      |
            | watched25 | 2  | @series.completed | @seasons.completedS | 2             | 1            | 25      |
            | watched40 | 3  | @series.watching  | @seasons.watchingS  | 1             | 1            | 40      |
            | ignored   | 4  | @series.watching  | @seasons.watchingS  | 2             | 1            | 999     |

        And the database with these user series:
            | userId | seriesId          | status    | watchCount | watchedEpisodeCount |
            | user-1 | @series.completed | COMPLETED | 2          | 2                   |
            | user-1 | @series.watching  | WATCHING  | 1          | 1                   |
            | user-2 | @series.watching  | COMPLETED | 2          | 2                   |

        And the database with these user episodes:
            | userId | episodeId           |
            | user-1 | @episodes.watched20 |
            | user-1 | @episodes.watched25 |
            | user-1 | @episodes.watched40 |
            | user-2 | @episodes.watched40 |
            | user-2 | @episodes.ignored   |

        When I send a GET request to "/api/user/dashboard/summary"

        Then the response status should be 200
        And the response body should exactly match:
            | totalWatchedMinutes | totalWatchedEpisodes | totalWatchedSeries |
            | 85                  | 3                    | 1                  |

    Scenario: Get user summary dashboard - Missing Data
        When I send a GET request to "/api/user/dashboard/summary"

        Then the response status should be 200
        And the response body should exactly match:
            | totalWatchedMinutes | totalWatchedEpisodes | totalWatchedSeries |
            | 0                   | 0                    | 0                  |
