Feature: GET /api/user/episodes/activity

    Background:
        Given authentication as "user-1"

        And the database with these series:
            | key             | id |
            | firstSeries     | 1  |
            | secondSeries    | 2  |
            | thirdSeries     | 3  |
            | otherUserSeries | 4  |

        And the database with these episodes:
            | key       | id | seriesId                | runtime |
            | first20   | 1  | @series.firstSeries     | 20      |
            | first25   | 2  | @series.firstSeries     | 25      |
            | firstZero | 3  | @series.firstSeries     | 0       |
            | second40  | 4  | @series.secondSeries    | 40      |
            | second30  | 5  | @series.secondSeries    | 30      |
            | third50   | 6  | @series.thirdSeries     | 50      |
            | otherUser | 7  | @series.otherUserSeries | 999     |
            | unwatched | 8  | @series.firstSeries     | 500     |

        And the database with these user episodes:
            | userId | episodeId           | watchedAt                |
            | user-1 | @episodes.first25   | 2026-01-12T12:00:00.000Z |
            | user-1 | @episodes.second40  | 2026-01-10T23:59:59.999Z |
            | user-1 | @episodes.first20   | 2026-01-10T00:00:00.000Z |
            | user-1 | @episodes.second30  | 2026-01-11T00:00:00.000Z |
            | user-1 | @episodes.third50   | 2026-01-11T18:00:00.000Z |
            | user-1 | @episodes.firstZero | 2026-01-14T12:00:00.000Z |
            | user-2 | @episodes.first20   | 2026-01-09T12:00:00.000Z |
            | user-2 | @episodes.otherUser | 2026-01-10T16:00:00.000Z |

    Scenario: Get user episodes activity
        When I send a GET request to "/api/user/episodes/activity"

        Then the response status should be 200
        And the response array at "$" should exactly match:
            | date                     | watchedEpisodes | watchedMinutes |
            | 2026-01-10T00:00:00.000Z | 2               | 60             |
            | 2026-01-11T00:00:00.000Z | 2               | 80             |
            | 2026-01-12T00:00:00.000Z | 1               | 25             |
            | 2026-01-14T00:00:00.000Z | 1               | 0              |

    Scenario: Get user episodes activity - Filter by series
        When I send a GET request to "/api/user/episodes/activity?seriesIds=1"

        Then the response status should be 200
        And the response array at "$" should exactly match:
            | date                     | watchedEpisodes | watchedMinutes |
            | 2026-01-10T00:00:00.000Z | 1               | 20             |
            | 2026-01-12T00:00:00.000Z | 1               | 25             |
            | 2026-01-14T00:00:00.000Z | 1               | 0              |

    Scenario: Get user episodes activity - Filter by multiple series
        When I send a GET request to "/api/user/episodes/activity?seriesIds=1&seriesIds=2"

        Then the response status should be 200
        And the response array at "$" should exactly match:
            | date                     | watchedEpisodes | watchedMinutes |
            | 2026-01-10T00:00:00.000Z | 2               | 60             |
            | 2026-01-11T00:00:00.000Z | 1               | 30             |
            | 2026-01-12T00:00:00.000Z | 1               | 25             |
            | 2026-01-14T00:00:00.000Z | 1               | 0              |

    Scenario: Get user episodes activity - Paris timezone
        When I send a GET request to "/api/user/episodes/activity?timezone=Europe%2FParis"

        Then the response status should be 200
        And the response array at "$" should exactly match:
            | date                     | watchedEpisodes | watchedMinutes |
            | 2026-01-09T23:00:00.000Z | 1               | 20             |
            | 2026-01-10T23:00:00.000Z | 3               | 120            |
            | 2026-01-11T23:00:00.000Z | 1               | 25             |
            | 2026-01-13T23:00:00.000Z | 1               | 0              |

    Scenario: Get user episodes activity - Filter by multiple series with Tokyo timezone
        When I send a GET request to "/api/user/episodes/activity?seriesIds=1&seriesIds=2&timezone=Asia%2FTokyo"

        Then the response status should be 200
        And the response array at "$" should exactly match:
            | date                     | watchedEpisodes | watchedMinutes |
            | 2026-01-09T15:00:00.000Z | 1               | 20             |
            | 2026-01-10T15:00:00.000Z | 2               | 70             |
            | 2026-01-11T15:00:00.000Z | 1               | 25             |
            | 2026-01-13T15:00:00.000Z | 1               | 0              |

    Scenario: Get user episodes activity - Daylight saving time
        Given authentication as "user-3"

        And the database with these user episodes:
            | userId | episodeId          | watchedAt                |
            | user-3 | @episodes.first20  | 2026-03-28T22:59:59.999Z |
            | user-3 | @episodes.first25  | 2026-03-28T23:00:00.000Z |
            | user-3 | @episodes.second30 | 2026-03-29T21:59:59.999Z |
            | user-3 | @episodes.second40 | 2026-03-29T22:00:00.000Z |

        When I send a GET request to "/api/user/episodes/activity?timezone=Europe%2FParis"

        Then the response status should be 200
        And the response array at "$" should exactly match:
            | date                     | watchedEpisodes | watchedMinutes |
            | 2026-03-27T23:00:00.000Z | 1               | 20             |
            | 2026-03-28T23:00:00.000Z | 2               | 55             |
            | 2026-03-29T22:00:00.000Z | 1               | 40             |

    Scenario: Get user episodes activity - Another user
        Given authentication as "user-2"

        When I send a GET request to "/api/user/episodes/activity"

        Then the response status should be 200
        And the response array at "$" should exactly match:
            | date                     | watchedEpisodes | watchedMinutes |
            | 2026-01-09T00:00:00.000Z | 1               | 20             |
            | 2026-01-10T00:00:00.000Z | 1               | 999            |

    Scenario: Get user episodes activity - Series watched by another user
        When I send a GET request to "/api/user/episodes/activity?seriesIds=4"

        Then the response status should be 200
        And the response array at "$" should be empty

    Scenario: Get user episodes activity - Missing series
        When I send a GET request to "/api/user/episodes/activity?seriesIds=999"

        Then the response status should be 200
        And the response array at "$" should be empty

    Scenario: Get user episodes activity - No watched episodes
        Given authentication as "user-3"

        When I send a GET request to "/api/user/episodes/activity"

        Then the response status should be 200
        And the response array at "$" should be empty

    Scenario: Get user episodes activity - Invalid query
        When I send a GET request to "/api/user/episodes/activity?seriesIds=invalid"

        Then the response status should be 400

    Scenario: Get user episodes activity - Invalid query with multiple series
        When I send a GET request to "/api/user/episodes/activity?seriesIds=1&seriesIds=invalid"

        Then the response status should be 400

    Scenario: Get user episodes activity - Invalid timezone
        When I send a GET request to "/api/user/episodes/activity?timezone=invalid"

        Then the response status should be 400
