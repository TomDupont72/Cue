Feature: GET /api/series/:id

  Background:
    Given the API state is "default.authenticated"

  Scenario: Return One Piece
    When I send a GET request to "/api/series/1"

    Then the response status should be 200
    And the response body should have exactly these fields:
      | field        |
      | series       |
      | seasons      |
      | episodes     |
      | userSeries   |
      | userEpisodes |

    And the response object at "series" should exactly match:
      | id | adult | backdropPath | firstAirDate             | tmdbId | inProduction | lastAirDate              | name      | numberOfEpisodes | numberOfSeasons | originalLanguage | originalName | overview     | popularity | posterPath | createdAt                | updatedAt                |
      | 1  | false | /op-bg.jpg   | 2000-01-01T00:00:00.000Z | 37854  | true         | 2000-01-02T00:00:00.000Z | One Piece | 2                | 1               | ja               | One Piece    | Des pirates. | 10         | /op.jpg    | 2026-01-01T10:00:00.000Z | 2026-01-01T10:00:00.000Z |

    And the response array at "seasons" should exactly match:
      | id | seriesId | airDate                  | name     | overview         | tmdbId | posterPath | seasonNumber | voteAverage | createdAt                | updatedAt                |
      | 1  | 1        | 2000-01-01T00:00:00.000Z | Saison 1 | Première saison. | 11     | /op-s1.jpg | 1            | 8           | 2026-01-01T10:00:00.000Z | 2026-01-01T10:00:00.000Z |

    And the response array at "episodes" should exactly match:
      | id | seriesId | seasonId | airDate                  | episodeNumber | name      | overview       | tmdbId | stillPath  | runtime | seasonNumber | voteAverage | createdAt                | updatedAt                |
      | 1  | 1        | 1        | 2000-01-01T00:00:00.000Z | 1             | Départ    | Le départ.     | 111    | /op-e1.jpg | 20      | 1            | 8           | 2026-01-01T10:00:00.000Z | 2026-01-01T10:00:00.000Z |
      | 2  | 1        | 1        | 2000-01-02T00:00:00.000Z | 2             | Rencontre | Une rencontre. | 112    | /op-e2.jpg | 20      | 1            | 8           | 2026-01-01T10:00:00.000Z | 2026-01-01T10:00:00.000Z |

    And the response object at "userSeries" should exactly match:
      | userId | seriesId | status   | isFavorite | watchCount | watchedEpisodeCount | addedAt                  | lastWatchedAt            |
      | user-1 | 1        | WATCHING | true       | 1          | 1                   | 2026-06-01T10:00:00.000Z | 2026-08-10T20:00:00.000Z |

    And the response array at "userEpisodes" should exactly match:
      | userId | episodeId | watchedAt                |
      | user-1 | 1         | 2026-08-10T20:00:00.000Z |

  Scenario: Reject an invalid series id
    When I send a GET request to "/api/series/invalid"

    Then the response status should be 400
    And the response body should exactly match:
      | code             | message         | details                                                                                                                                                                                                                  |
      | VALIDATION_ERROR | Invalid request | json:[{"keyword":"invalid_type","instancePath":"/id","schemaPath":"#/id/invalid_type","message":"Invalid input: expected number, received NaN","params":{"expected":"number","received":"NaN"}}] |

  Scenario: Return an error when the series does not exist
    When I send a GET request to "/api/series/999"

    Then the response status should be 404
    And the response body should exactly match:
      | code             | message          |
      | SERIES_NOT_FOUND | Series not found |
