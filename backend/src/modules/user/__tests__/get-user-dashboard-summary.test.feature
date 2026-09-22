Feature: GET /api/user/dashboard/summary

    Background:
        Given authentication as "user-1"

        And the database with these series:
            | key       | id |
            | completed | 1  |
            | watching  | 2  |

        And the database with these seasons:
            | key        | id | seriesId          |
            | completedS | 1  | @series.completed |
            | watchingS  | 2  | @series.watching  |

        And the database with these episodes:
            | key       | id | seriesId          | seasonId            | runtime |
            | watched20 | 1  | @series.completed | @seasons.completedS | 20      |
            | watched25 | 2  | @series.completed | @seasons.completedS | 25      |
            | watched40 | 3  | @series.watching  | @seasons.watchingS  | 40      |
            | ignored   | 4  | @series.watching  | @seasons.watchingS  | 999     |

        And the database with these user series:
            | userId | seriesId          | status    |
            | user-1 | @series.completed | COMPLETED |
            | user-1 | @series.watching  | WATCHING  |
            | user-2 | @series.watching  | COMPLETED |
            | user-3 | @series.watching  | WATCHING  |

        And the database with these user episodes:
            | userId | episodeId           |
            | user-1 | @episodes.watched20 |
            | user-1 | @episodes.watched25 |
            | user-1 | @episodes.watched40 |
            | user-2 | @episodes.watched40 |
            | user-2 | @episodes.ignored   |
            | user-3 | @episodes.watched40 |

    Scenario: Get user summary dashboard
        When I send a GET request to "/api/user/dashboard/summary"

        Then the response status should be 200
        And the response body should exactly match:
            | totalWatchedMinutes | totalWatchedEpisodes | totalWatchedSeries |
            | 85                  | 3                    | 1                  |

    Scenario: Get user summary dashboard - No watched episodes
        Given authentication as "user-4"

        When I send a GET request to "/api/user/dashboard/summary"

        Then the response status should be 200
        And the response body should exactly match:
            | totalWatchedMinutes | totalWatchedEpisodes | totalWatchedSeries |
            | 0                   | 0                    | 0                  |

    Scenario: Get user summary dashboard - Another user
        Given authentication as "user-2"

        When I send a GET request to "/api/user/dashboard/summary"

        Then the response status should be 200
        And the response body should exactly match:
            | totalWatchedMinutes | totalWatchedEpisodes | totalWatchedSeries |
            | 1039                | 2                    | 1                  |

    Scenario: Get user summary dashboard - No completed series
        Given authentication as "user-3"

        When I send a GET request to "/api/user/dashboard/summary"

        Then the response status should be 200
        And the response body should exactly match:
            | totalWatchedMinutes | totalWatchedEpisodes | totalWatchedSeries |
            | 40                  | 1                    | 0                  |
