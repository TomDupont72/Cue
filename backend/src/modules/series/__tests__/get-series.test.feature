Feature: GET /api/series/:id

    Background:
        Given authentication as "user-1"

        And the database with these series:
            | key       | id |
            | requested | 1  |
            | other     | 2  |
            | empty     | 3  |

        And the database with these seasons:
            | key             | id | seriesId          |
            | requestedSeason | 1  | @series.requested |
            | otherSeason     | 2  | @series.other     |

        And the database with these episodes:
            | key             | id | seriesId          | seasonId                 |
            | requestedFirst  | 1  | @series.requested | @seasons.requestedSeason |
            | requestedSecond | 2  | @series.requested | @seasons.requestedSeason |
            | otherEpisode    | 3  | @series.other     | @seasons.otherSeason     |

        And the database with these user series:
            | key               | userId | seriesId          |
            | requestedProgress | user-1 | @series.requested |
            | otherUserProgress | user-2 | @series.requested |

        And the database with these user episodes:
            | key                     | userId | episodeId                 |
            | requestedSeenByUser     | user-1 | @episodes.requestedFirst  |
            | requestedSeenByOtherUser | user-2 | @episodes.requestedSecond |

    Scenario: Get series - Added
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
            | fixture                           |
            | @userEpisodes.requestedSeenByUser |

    Scenario: Get series - Not added
        When I send a GET request to "/api/series/2"

        Then the response status should be 200
        And the response body should have exactly these fields:
            | field        |
            | series       |
            | seasons      |
            | episodes     |
            | userSeries   |
            | userEpisodes |

        And the response object at "series" should exactly match the fixture "@series.other"

        And the response array at "seasons" should exactly match these fixtures:
            | fixture              |
            | @seasons.otherSeason |

        And the response array at "episodes" should exactly match these fixtures:
            | fixture                |
            | @episodes.otherEpisode |

        And the response field at "userSeries" should be null
        And the response array at "userEpisodes" should be empty

    Scenario: Get series - Empty
        When I send a GET request to "/api/series/3"

        Then the response status should be 200
        And the response body should have exactly these fields:
            | field        |
            | series       |
            | seasons      |
            | episodes     |
            | userSeries   |
            | userEpisodes |

        And the response object at "series" should exactly match the fixture "@series.empty"
        And the response array at "seasons" should be empty
        And the response array at "episodes" should be empty
        And the response field at "userSeries" should be null
        And the response array at "userEpisodes" should be empty

    Scenario: Get series - Another user
        Given authentication as "user-2"

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

        And the response object at "userSeries" should exactly match the fixture "@userSeries.otherUserProgress"

        And the response array at "userEpisodes" should exactly match these fixtures:
            | fixture                                |
            | @userEpisodes.requestedSeenByOtherUser |

    Scenario: Get series - Invalid parameters
        When I send a GET request to "/api/series/invalid"

        Then the response status should be 400

    Scenario: Get series - Missing series
        When I send a GET request to "/api/series/999"

        Then the response status should be 404
        And the response body should exactly match:
            | code             | message          |
            | SERIES_NOT_FOUND | Series not found |
