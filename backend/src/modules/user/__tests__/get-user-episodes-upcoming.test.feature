Feature: GET /api/user/episodes/upcoming

    Background:
        Given I am authenticated as "user-1"

    Scenario: Get user episodes upcoming
        Given the current date is "2026-01-10T00:00:00.000Z"
        
        And the database contains these series:
            | key           | id | name           | backdropPath         |
            | firstSeries   | 1  | First series   | /first-series.jpg    |
            | lastSeries    | 2  | Last series    | null                 |
            | ignoredSeries | 3  | Ignored series | /ignored-series.jpg  |

        And the database contains these episodes:
            | key     | id | seriesId              | episodeNumber | airDate                  |
            | past    | 1  | @series.firstSeries   | 1             | 2026-01-01T00:00:00.000Z |
            | first1  | 2  | @series.firstSeries   | 2             | 2026-01-15T00:00:00.000Z |
            | first2  | 3  | @series.firstSeries   | 3             | 2026-01-25T00:00:00.000Z |
            | last    | 4  | @series.lastSeries    | 1             | 2026-01-20T00:00:00.000Z |
            | noDate  | 5  | @series.firstSeries   | 4             | null                     |
            | ignored | 6  | @series.ignoredSeries | 1             | 2026-01-15T00:00:00.000Z |

        And the database contains these user series:
            | key         | userId | seriesId             |
            | userFirst   | user-1 | @series.firstSeries   |
            | userLast    | user-1 | @series.lastSeries    |
            | otherSeries | user-2 | @series.ignoredSeries |

        When I send a GET request to "/api/user/episodes/upcoming"

        Then the response status should be 200
        And the response array at "episodes" should exactly match these fixtures:
            | fixture          | seriesName   | seriesBackdropPath |
            | @episodes.first1 | First series | /first-series.jpg  |
            | @episodes.last   | Last series  | null               |
