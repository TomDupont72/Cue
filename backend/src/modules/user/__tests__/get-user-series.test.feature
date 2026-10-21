Feature: GET /api/user/series

    Background:
        Given authentication as "user-1"

        And the current date "2026-02-01T00:00:00.000Z"

        And the database with these series:
            | key             | id |
            | plannedSeries   | 1  |
            | watchingSeries  | 2  |
            | pausedSeries    | 3  |
            | completedSeries | 4  |
            | droppedSeries   | 5  |
            | otherUserSeries | 6  |

        And the database with these episodes:
            | key            | id | seriesId                | runtime | airDate                  |
            | watched20      | 1  | @series.watchingSeries  | 20      | 2026-01-01T00:00:00.000Z |
            | watched25      | 2  | @series.watchingSeries  | 25      | 2026-01-02T00:00:00.000Z |
            | released30     | 3  | @series.watchingSeries  | 30      | 2026-01-03T00:00:00.000Z |
            | releasedNow40  | 4  | @series.watchingSeries  | 40      | 2026-02-01T00:00:00.000Z |
            | future         | 5  | @series.watchingSeries  | 50      | 2026-02-02T00:00:00.000Z |
            | unknownAirDate | 6  | @series.watchingSeries  | 60      | null                     |
            | paused         | 7  | @series.pausedSeries    | 35      | 2026-01-01T00:00:00.000Z |
            | completed      | 8  | @series.completedSeries | 45      | 2026-01-01T00:00:00.000Z |
            | dropped        | 9  | @series.droppedSeries   | 55      | 2026-01-01T00:00:00.000Z |
            | otherUser      | 10 | @series.otherUserSeries | 65      | 2026-01-01T00:00:00.000Z |

        And the database with these user episodes:
            | userId | episodeId            |
            | user-1 | @episodes.watched20  |
            | user-1 | @episodes.watched25  |
            | user-1 | @episodes.completed  |
            | user-2 | @episodes.released30 |
            | user-2 | @episodes.otherUser  |

        And the database with these providers:
            | key       | id |
            | common    | 1  |
            | secondary | 2  |

        And the database with these series providers:
            | seriesId                | providerId           |
            | @series.watchingSeries  | @providers.common    |
            | @series.watchingSeries  | @providers.secondary |
            | @series.pausedSeries    | @providers.common    |
            | @series.completedSeries | @providers.common    |
            | @series.droppedSeries   | @providers.common    |
            | @series.otherUserSeries | @providers.common    |

        And the database with these genres:
            | key       | id |
            | common    | 1  |
            | secondary | 2  |

        And the database with these series genres:
            | seriesId                | genreId           |
            | @series.watchingSeries  | @genres.common    |
            | @series.watchingSeries  | @genres.secondary |
            | @series.pausedSeries    | @genres.common    |
            | @series.completedSeries | @genres.common    |
            | @series.droppedSeries   | @genres.common    |
            | @series.otherUserSeries | @genres.common    |

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
            | fixture                       | seriesDetails           | seriesProviders                                 | seriesGenres                              | watchedMinutes | remainingReleasedMinutes |
            | @userSeries.plannedProgress   | @series.plannedSeries   | fixtures:                                       | fixtures:                                 | 0              | 0                        |
            | @userSeries.watchingProgress  | @series.watchingSeries  | fixtures:@providers.common,@providers.secondary | fixtures:@genres.common,@genres.secondary | 45             | 70                       |
            | @userSeries.pausedProgress    | @series.pausedSeries    | fixtures:@providers.common                      | fixtures:@genres.common                   | 0              | 35                       |
            | @userSeries.completedProgress | @series.completedSeries | fixtures:@providers.common                      | fixtures:@genres.common                   | 45             | 0                        |
            | @userSeries.droppedProgress   | @series.droppedSeries   | fixtures:@providers.common                      | fixtures:@genres.common                   | 0              | 55                       |

    Scenario: Get user series - Filter by series
        When I send a GET request to "/api/user/series?seriesId=2"

        Then the response status should be 200
        And the response array at "series" should exactly match these fixtures:
            | fixture                      | seriesDetails          | seriesProviders                                 | seriesGenres                              | watchedMinutes | remainingReleasedMinutes |
            | @userSeries.watchingProgress | @series.watchingSeries | fixtures:@providers.common,@providers.secondary | fixtures:@genres.common,@genres.secondary | 45             | 70                       |

    Scenario: Get user series - Without provider or genre
        When I send a GET request to "/api/user/series?seriesId=1"

        Then the response status should be 200
        And the response array at "series" should exactly match these fixtures:
            | fixture                     | seriesDetails         | seriesProviders | seriesGenres | watchedMinutes | remainingReleasedMinutes |
            | @userSeries.plannedProgress | @series.plannedSeries | fixtures:       | fixtures:    | 0              | 0                        |

    Scenario: Get user series - Another user
        Given authentication as "user-2"

        When I send a GET request to "/api/user/series"

        Then the response status should be 200
        And the response array at "series" should exactly match these fixtures:
            | fixture                       | seriesDetails           | seriesProviders            | seriesGenres            | watchedMinutes | remainingReleasedMinutes |
            | @userSeries.otherUserProgress | @series.otherUserSeries | fixtures:@providers.common | fixtures:@genres.common | 65             | 0                        |

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
