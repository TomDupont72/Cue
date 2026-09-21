Feature: GET /api/user/series

    Background:
        Given authentication as "user-1"

        And the database with these series:
            | key             | id |
            | plannedSeries   | 1  |
            | watchingSeries  | 2  |
            | pausedSeries    | 3  |
            | completedSeries | 4  |
            | droppedSeries   | 5  |
            | otherUserSeries | 6  |

        And the database with these user series:
            | key               | userId | seriesId                | status    |
            | plannedProgress   | user-1 | @series.plannedSeries   | PLANNED   |
            | watchingProgress  | user-1 | @series.watchingSeries  | WATCHING  |
            | pausedProgress    | user-1 | @series.pausedSeries    | PAUSED    |
            | completedProgress | user-1 | @series.completedSeries | COMPLETED |
            | droppedProgress   | user-1 | @series.droppedSeries   | DROPPED   |
            | otherUserProgress | user-2 | @series.otherUserSeries | WATCHING  |

    Scenario: Get user series
        When I send a GET request to "/api/user/series"

        Then the response status should be 200
        And the response body should have exactly these fields:
            | field  |
            | series |

        And the response array at "series" should contain exactly these fixtures:
            | fixture                       | seriesDetails           |
            | @userSeries.plannedProgress   | @series.plannedSeries   |
            | @userSeries.watchingProgress  | @series.watchingSeries  |
            | @userSeries.pausedProgress    | @series.pausedSeries    |
            | @userSeries.completedProgress | @series.completedSeries |
            | @userSeries.droppedProgress   | @series.droppedSeries   |

    Scenario: Get user series - Filter by series
        When I send a GET request to "/api/user/series?seriesId=2"

        Then the response status should be 200
        And the response array at "series" should exactly match these fixtures:
            | fixture                      | seriesDetails          |
            | @userSeries.watchingProgress | @series.watchingSeries |

    Scenario: Get user series - Another user
        Given authentication as "user-2"

        When I send a GET request to "/api/user/series"

        Then the response status should be 200
        And the response array at "series" should exactly match these fixtures:
            | fixture                       | seriesDetails           |
            | @userSeries.otherUserProgress | @series.otherUserSeries |

    Scenario: Get user series - Series owned by another user
        When I send a GET request to "/api/user/series?seriesId=6"

        Then the response status should be 200
        And the response array at "series" should be empty

    Scenario: Get user series - Missing series
        When I send a GET request to "/api/user/series?seriesId=999"

        Then the response status should be 200
        And the response array at "series" should be empty

    Scenario: Get user series - Empty
        Given authentication as "user-3"

        When I send a GET request to "/api/user/series"

        Then the response status should be 200
        And the response array at "series" should be empty

    Scenario: Get user series - Invalid query
        When I send a GET request to "/api/user/series?seriesId=invalid"

        Then the response status should be 400
