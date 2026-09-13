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
            | key   | id | seriesId              | episodeNumber | airDate                  |
            |       | 1  | @series.firstSeries   | 1             | 2026-01-01T00:00:00.000Z |
            | first | 2  | @series.firstSeries   | 2             | 2026-01-15T00:00:00.000Z |
            |       | 3  | @series.firstSeries   | 3             | 2026-01-25T00:00:00.000Z |
            | last  | 4  | @series.lastSeries    | 1             | 2026-01-20T00:00:00.000Z |
            |       | 5  | @series.firstSeries   | 4             | null                     |
            |       | 6  | @series.ignoredSeries | 1             | 2026-01-15T00:00:00.000Z |

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
