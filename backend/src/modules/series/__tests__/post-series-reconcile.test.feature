Feature: POST /api/series/reconcile

    Background:
        Given authentication as "user-1"

        And the current date "2026-02-01T00:00:00.000Z"

        And the database with these series:
            | key            | id | tmdbId | numberOfEpisodes |
            | upToDateSeries | 1  | 101    | 2                |
            | outdatedSeries | 2  | 102    | 5                |
            | emptySeries    | 3  | 103    | 1                |
            | ignoredSeries  | 4  | 104    | 5                |

        And the database with these episodes:
            | key                 | id | seriesId               | seasonNumber | airDate                  |
            | upToDateFirst       | 1  | @series.upToDateSeries | 1            | 2026-01-01T00:00:00.000Z |
            | upToDateSecond      | 2  | @series.upToDateSeries | 1            | 2026-02-01T23:59:59.999Z |
            | upToDateSpecial     | 3  | @series.upToDateSeries | 0            | 2026-01-01T00:00:00.000Z |
            | outdatedFirst       | 4  | @series.outdatedSeries | 1            | 2026-01-01T00:00:00.000Z |
            | outdatedSecond      | 5  | @series.outdatedSeries | 1            | 2026-02-01T23:59:59.999Z |
            | outdatedFuture      | 6  | @series.outdatedSeries | 1            | 2026-02-02T00:00:00.000Z |
            | outdatedWithoutDate | 7  | @series.outdatedSeries | 1            |                          |
            | ignoredEpisode      | 8  | @series.ignoredSeries  | 1            | 2026-01-01T00:00:00.000Z |

    Scenario: Post series reconcile
        Given called by worker

        When I send a POST request to "/api/series/reconcile" with body:
            | tmdbIds            |
            | json:[101,102,103] |

        Then the response status should be 200
        And the database should have these series fields updated:
            | id | numberOfEpisodes |
            | 2  | 2                |
            | 3  | 0                |

        And the response body should exactly match:
            | updatedCount |
            | 2            |

    Scenario: Post series reconcile - Duplicate TMDB IDs
        Given called by worker

        When I send a POST request to "/api/series/reconcile" with body:
            | tmdbIds        |
            | json:[102,102] |

        Then the response status should be 200
        And the database should have these series fields updated:
            | id | numberOfEpisodes |
            | 2  | 2                |

        And the response body should exactly match:
            | updatedCount |
            | 1            |

    Scenario: Post series reconcile - Missing series
        Given called by worker

        When I send a POST request to "/api/series/reconcile" with body:
            | tmdbIds    |
            | json:[999] |

        Then the response status should be 200
        And the response body should exactly match:
            | updatedCount |
            | 0            |

    Scenario: Post series reconcile - Invalid body
        Given called by worker

        When I send a POST request to "/api/series/reconcile" with body:
            | tmdbIds  |
            | json:[0] |

        Then the response status should be 400

    Scenario: Post series reconcile - Not called by worker
        When I send a POST request to "/api/series/reconcile" with body:
            | tmdbIds    |
            | json:[101] |

        Then the response status should be 401
        And the response body should exactly match:
            | code         | message      |
            | UNAUTHORIZED | Unauthorized |
