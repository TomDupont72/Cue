Feature: GET /api/series/:id

    Background:
        Given I am authenticated as "user-1"

    Scenario: Get a followed series
        Given the database contains these series:
            | key       | id |
            | requested | 1  |
            | other     | 2  |

        And the database contains these seasons:
            | key             | id | seriesId          |
            | requestedSeason | 1  | @series.requested |
            | otherSeason     | 2  | @series.other     |

        And the database contains these episodes:
            | key             | id | seriesId          | seasonId                 |
            | requestedFirst  | 1  | @series.requested | @seasons.requestedSeason |
            | requestedSecond | 2  | @series.requested | @seasons.requestedSeason |
            | otherEpisode    | 3  | @series.other     | @seasons.otherSeason     |

        And the database contains these user series:
            | key               | userId | seriesId          |
            | requestedProgress | user-1 | @series.requested |

        And the database contains these user episodes:
            | key                    | userId | episodeId                 |
            | requestedSeenByUser    | user-1 | @episodes.requestedFirst  |
            | requestedSeenByAnother | user-2 | @episodes.requestedSecond |

        When I send a GET request to "/api/series/1"

        Then the response status should be 200
        And the response body should have exactly these fields:
            | field        |
            | series       |
            | seasons      |
            | episodes     |
            | userSeries   |
            | userEpisodes |

        And the response object at "series" should exactly match the fixture "@series.requested"

        And the response array at "seasons" should exactly match these fixtures:
            | fixture                  |
            | @seasons.requestedSeason |

        And the response array at "episodes" should exactly match these fixtures:
            | fixture                   |
            | @episodes.requestedFirst  |
            | @episodes.requestedSecond |

        And the response object at "userSeries" should exactly match the fixture "@userSeries.requestedProgress"

        And the response array at "userEpisodes" should exactly match these fixtures:
            | fixture                            |
            | @userEpisodes.requestedSeenByUser |

    Scenario: Get series - Invalid query
        When I send a GET request to "/api/series/invalid"

        Then the response status should be 400

    Scenario: Get series - Missing data
        When I send a GET request to "/api/series/999"

        Then the response status should be 404
        And the response body should exactly match:
            | code             | message          |
            | SERIES_NOT_FOUND | Series not found |
