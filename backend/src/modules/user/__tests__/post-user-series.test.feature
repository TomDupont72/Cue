Feature: POST /api/user/series/:seriesId

    Background:
        Given authentication as "user-1"

        And the current date "2026-01-01T00:00:00.000Z"

        And the database with these series:
            | key            | id |
            | addedSeries    | 1  |
            | notAddedSeries | 2  |
            | favoriteSeries | 3  |

        And the database with these user series:
            | userId | seriesId               | isFavorite | addedAt                  |
            | user-1 | @series.addedSeries    | false      | 2025-01-01T00:00:00.000Z |
            | user-1 | @series.favoriteSeries | true       | 2025-02-01T00:00:00.000Z |
            | user-2 | @series.notAddedSeries | false      | 2025-03-01T00:00:00.000Z |

    Scenario: Post user series
        When I send a POST request to "/api/user/series/2"

        Then the response status should be 200
        And the database should have these user series added:
            | key     | userId | seriesId               | status  | isFavorite | watchCount | watchedEpisodeCount | addedAt                  | lastWatchedAt |
            | created | user-1 | @series.notAddedSeries | PLANNED | false      | 0          | 0                   | 2026-01-01T00:00:00.000Z |               |

        And the response body should exactly match this fixture:
            | fixture             |
            | @userSeries.created |

    Scenario: Post user series - Add as favorite
        When I send a POST request to "/api/user/series/2" with body:
            | isFavorite |
            | true       |

        Then the response status should be 200
        And the database should have these user series added:
            | key     | userId | seriesId               | status  | isFavorite | watchCount | watchedEpisodeCount | addedAt                  | lastWatchedAt |
            | created | user-1 | @series.notAddedSeries | PLANNED | true       | 0          | 0                   | 2026-01-01T00:00:00.000Z |               |

        And the response body should exactly match this fixture:
            | fixture             |
            | @userSeries.created |

    Scenario: Post user series - Already added
        When I send a POST request to "/api/user/series/1"

        Then the response status should be 200
        And the database should contain exactly these user series:
            | key     | userId | seriesId               |
            | existed | user-1 | @series.addedSeries    |
            |         | user-1 | @series.favoriteSeries |
            |         | user-2 | @series.notAddedSeries |

        And the response body should exactly match this fixture:
            | fixture             |
            | @userSeries.existed |

    Scenario: Post user series - Set favorite
        When I send a POST request to "/api/user/series/1" with body:
            | isFavorite |
            | true       |

        Then the response status should be 200
        And the database should have these user series fields updated:
            | key     | userId | seriesId            | isFavorite |
            | updated | user-1 | @series.addedSeries | true       |

        And the response body should exactly match this fixture:
            | fixture             |
            | @userSeries.updated |

    Scenario: Post user series - Unset favorite
        When I send a POST request to "/api/user/series/3" with body:
            | isFavorite |
            | false      |

        Then the response status should be 200
        And the database should have these user series fields updated:
            | key     | userId | seriesId               | isFavorite |
            | updated | user-1 | @series.favoriteSeries | false      |

        And the response body should exactly match this fixture:
            | fixture             |
            | @userSeries.updated |

    Scenario: Post user series - Already added by another user
        Given authentication as "user-2"

        When I send a POST request to "/api/user/series/1"

        Then the response status should be 200
        And the database should have these user series added:
            | key     | userId | seriesId            | status  | isFavorite | watchCount | watchedEpisodeCount | addedAt                  | lastWatchedAt |
            | created | user-2 | @series.addedSeries | PLANNED | false      | 0          | 0                   | 2026-01-01T00:00:00.000Z |               |

        And the response body should exactly match this fixture:
            | fixture             |
            | @userSeries.created |

    Scenario: Post user series - Invalid parameters
        When I send a POST request to "/api/user/series/invalid"

        Then the response status should be 400

    Scenario: Post user series - Invalid body
        When I send a POST request to "/api/user/series/1" with body:
            | isFavorite |
            | yes        |

        Then the response status should be 400

    Scenario: Post user series - Missing series
        When I send a POST request to "/api/user/series/999"

        Then the response status should be 404
        And the response body should exactly match:
            | code             | message          |
            | SERIES_NOT_FOUND | Series not found |
