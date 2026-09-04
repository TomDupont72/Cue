Feature: GET /user/dashboard/summary

    Background:
        Given the API state is "default.authenticated"

    Scenario: Get user summary dashboard
        When I send a GET request to "/api/user/dashboard/summary"

        Then the response status should be 200
        And the response body should exactly match:
            | totalWatchedMinutes | totalWatchedEpisodes | totalWatchedSeries |
            | 20                  | 1                    | 0                  |
