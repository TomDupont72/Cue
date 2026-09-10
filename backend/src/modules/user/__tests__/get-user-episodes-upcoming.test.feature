Feature: GET /api/user/episodes/upcoming

    Background:
        Given I am authenticated as "user-1"

    Scenario: Get user episodes upcoming
        Given the current date is "2026-01-10T00:00:00.000Z"
        
        And the database contains these episodes:
            | key      | id | airDate                  |
            | past     | 1  | 2026-01-01T00:00:00.000Z |
            | first1   | 2  | 2026-01-15T00:00:00.000Z |
            | first2   | 2  | 2026-01-25T00:00:00.000Z |
            | last     | 3  | 2026-01-20T00:00:00.000Z |
            | noDate   | 4  |                          |
            | ignored  | 5  | 2026-01-15T00:00:00.000Z |

        And the database contains these user episodes:
            | userId | episodeId          |
            | user-1 | @episodes.finished |
            | user-1 | @episodes.first1   |
            | user-1 | @episodes.first2   |
            | user-1 | @episodes.last     |
            | user-1 | @episodes.null     |
            | user-2 | @episodes.ignored  |

        When I send a GET request to "/api/user/episodes/upcoming"

        Then the response status should be 200
        And the response array at "episodes" should exactly match these fixtures:
            | fixture          |
            | @episodes.first1 |
            | @episodes.last   |
