Feature: POST /api/user/series/:seriesId

    Background:
        Given authentication as "user-1"

        And the database with these series:
            | key            | id |
            | addedSeries    | 1  |
            | notAddedSeries | 2  |

        And the database with these user series:
            | userId | seriesId            | isFavorite |
            | user-1 | @series.addedSeries | false      |

    Scenario: Post user series
        When I send a POST request to "/api/user/series/2"

        Then the response status should be 200
        And the database should contain exactly these user series:
            | key     | userId | seriesId               | isFavorite |
            |         | user-1 | @series.addedSeries    | false      |
            | created | user-1 | @series.notAddedSeries | false      |

        And the response body should exactly match this fixture:
            | fixture             |
            | @userSeries.created |

    Scenario: Post user series - Already added
        When I send a POST request to "/api/user/series/1"

        Then the response status should be 200
        And the database should contain exactly these user series:
            | key     | userId | seriesId            | isFavorite |
            | existed | user-1 | @series.addedSeries | false      |

        And the response body should exactly match this fixture:
            | fixture             |
            | @userSeries.existed |

    Scenario: Post user series - With body
        When I send a POST request to "/api/user/series/1" with body:
            | isFavorite |
            | true       |

        Then the response status should be 200
        And the database should contain exactly these user series:
            | key     | userId | seriesId            | isFavorite |
            | existed | user-1 | @series.addedSeries | true       |

        And the response body should exactly match this fixture:
            | fixture             |
            | @userSeries.existed |

    Scenario: Get series - Invalid query
        When I send a POST request to "/api/user/series/invalid"

        Then the response status should be 400

    Scenario: Get series - Missing data
        When I send a GET request to "/api/series/999"

        Then the response status should be 404
        And the response body should exactly match:
            | code             | message          |
            | SERIES_NOT_FOUND | Series not found |


