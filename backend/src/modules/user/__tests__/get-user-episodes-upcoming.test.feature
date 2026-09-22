Feature: GET /api/user/episodes/upcoming

    Background:
        Given authentication as "user-1"

        And the current date "2026-01-10T00:00:00.000Z"

        And the database with these series:
            | key           | id | name           | backdropPath        |
            | firstSeries   | 1  | First series   | /first-series.jpg   |
            | lastSeries    | 2  | Last series    | null                |
            | ignoredSeries | 3  | Ignored series | /ignored-series.jpg |

        And the database with these episodes:
            | key       | id | seriesId              | airDate                  | seasonNumber | episodeNumber |
            |           | 1  | @series.firstSeries   | 2026-01-01T00:00:00.000Z | 1            | 99            |
            |           | 2  | @series.firstSeries   | 2026-01-15T00:00:00.000Z | 2            | 1             |
            |           | 3  | @series.firstSeries   | 2026-01-15T00:00:00.000Z | 1            | 2             |
            | first     | 4  | @series.firstSeries   | 2026-01-15T00:00:00.000Z | 1            | 1             |
            | firstNext | 5  | @series.firstSeries   | 2026-01-25T00:00:00.000Z | 1            | 5             |
            |           | 6  | @series.firstSeries   | null                     | 1            | 6             |
            | last      | 7  | @series.lastSeries    | 2026-01-15T00:00:00.000Z | 1            | 1             |
            | lastNext  | 8  | @series.lastSeries    | 2026-01-20T00:00:00.000Z | 1            | 2             |
            | ignored   | 9  | @series.ignoredSeries | 2026-01-15T00:00:00.000Z | 1            | 1             |

        And the database with these user series:
            | userId | seriesId              |
            | user-1 | @series.firstSeries   |
            | user-1 | @series.lastSeries    |
            | user-2 | @series.ignoredSeries |

    Scenario: Get user episodes upcoming
        When I send a GET request to "/api/user/episodes/upcoming"

        Then the response status should be 200
        And the response array at "episodes" should exactly match these fixtures:
            | fixture         | seriesName   | seriesBackdropPath |
            | @episodes.first | First series | /first-series.jpg  |
            | @episodes.last  | Last series  | null               |

    Scenario: Get user episodes upcoming - Airing today
        Given the current date "2026-01-15T00:00:00.000Z"

        When I send a GET request to "/api/user/episodes/upcoming"

        Then the response status should be 200
        And the response array at "episodes" should exactly match these fixtures:
            | fixture             | seriesName   | seriesBackdropPath |
            | @episodes.lastNext  | Last series  | null               |
            | @episodes.firstNext | First series | /first-series.jpg  |

    Scenario: Get user episodes upcoming - Another user
        Given authentication as "user-2"

        When I send a GET request to "/api/user/episodes/upcoming"

        Then the response status should be 200
        And the response array at "episodes" should exactly match these fixtures:
            | fixture          | seriesName     | seriesBackdropPath   |
            | @episodes.ignored | Ignored series | /ignored-series.jpg |

    Scenario: Get user episodes upcoming - No upcoming episodes
        Given the current date "2026-02-01T00:00:00.000Z"

        When I send a GET request to "/api/user/episodes/upcoming"

        Then the response status should be 200
        And the response array at "episodes" should be empty
