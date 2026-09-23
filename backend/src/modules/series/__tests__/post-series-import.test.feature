Feature: POST /api/series/import

    Background:
        Given TMDB responds to "/tv/100" with:
            """
            {
                "adult": false,
                "backdrop_path": null,
                "created_by": [
                    {
                        "adult": false,
                        "gender": 1,
                        "id": 30,
                        "known_for_department": "Directing",
                        "name": "Creator",
                        "popularity": 1,
                        "profile_path": null
                    }
                ],
                "first_air_date": "2020-01-01",
                "genres": [
                    {
                        "id": 10,
                        "name": "Drama"
                    }
                ],
                "id": 100,
                "in_production": false,
                "last_air_date": "2020-01-01",
                "name": "Refreshed series",
                "seasons": [
                    {
                        "id": 1001,
                        "season_number": 1
                    }
                ],
                "networks": [
                    {
                        "id": 20,
                        "logo_path": null,
                        "name": "Network"
                    }
                ],
                "number_of_episodes": 1,
                "number_of_seasons": 1,
                "original_language": "en",
                "original_name": "Refreshed series",
                "overview": "Refreshed overview",
                "popularity": 1,
                "poster_path": null
            }
            """

        And TMDB responds to "/tv/100/season/1" with:
            """
            {
                "air_date": "2020-01-01",
                "episodes": [
                    {
                        "air_date": "2020-01-01",
                        "crew": [
                            {
                                "adult": false,
                                "gender": 2,
                                "id": 31,
                                "known_for_department": "Acting",
                                "name": "Crew member",
                                "popularity": 2,
                                "profile_path": null
                            }
                        ],
                        "episode_number": 1,
                        "guest_stars": [
                            {
                                "adult": false,
                                "character": "Hero",
                                "gender": 2,
                                "id": 32,
                                "known_for_department": "Acting",
                                "name": "Guest star",
                                "popularity": 3,
                                "profile_path": null
                            }
                        ],
                        "name": "Imported episode",
                        "overview": "Imported episode overview",
                        "id": 10001,
                        "still_path": null,
                        "runtime": 42,
                        "season_number": 1,
                        "vote_average": 1
                    }
                ],
                "name": "Imported season",
                "overview": "Imported season overview",
                "id": 1001,
                "poster_path": null,
                "season_number": 1,
                "vote_average": 1
            }
            """

        And TMDB responds to "/tv/100/watch/providers" with:
            """
            {
                "id": 100,
                "results": {
                    "FR": {
                        "flatrate": [
                            {
                                "logo_path": null,
                                "provider_id": 41,
                                "provider_name": "Subscription provider",
                                "display_priority": 3
                            }
                        ]
                    }
                }
            }
            """

        And TMDB responds to "/tv/200" with:
            """
            {
                "adult": false,
                "backdrop_path": null,
                "created_by": [],
                "first_air_date": "2021-01-01",
                "genres": [],
                "id": 200,
                "in_production": true,
                "last_air_date": null,
                "name": "Imported series",
                "seasons": [],
                "networks": [],
                "number_of_episodes": 0,
                "number_of_seasons": 0,
                "original_language": "fr",
                "original_name": "Imported series",
                "overview": "Imported overview",
                "popularity": 2,
                "poster_path": null
            }
            """

        And TMDB responds to "/tv/200/watch/providers" with:
            """
            {
                "id": 200,
                "results": {}
            }
            """

        And the database with these series:
            | key          | id | tmdbId | firstAirDate             | lastAirDate              | name          | numberOfEpisodes | numberOfSeasons | originalLanguage | originalName     | overview           | popularity |
            | cachedSeries | 1  | 100    | 2020-01-01T00:00:00.000Z | 2020-01-01T00:00:00.000Z | Cached series | 1                | 1               | en               | Refreshed series | Refreshed overview | 1          |

        And the database with these user series:
            | key            | userId | seriesId             |
            | cachedProgress | user-1 | @series.cachedSeries |

    Scenario: Post series import - Existing series
        Given authentication as "user-1"

        When I send a POST request to "/api/series/import" with body:
            | tmdbId |
            | 100    |

        Then the response status should be 200
        And the response object at "series" should exactly match the fixture "@series.cachedSeries"
        And the response object at "userSeries" should exactly match the fixture "@userSeries.cachedProgress"

    Scenario: Post series import - Worker refreshes existing series
        Given called by worker

        When I send a POST request to "/api/series/import" with body:
            | tmdbId |
            | 100    |

        Then the response status should be 200
        And the database should have these series fields updated:
            | id | name             |
            | 1  | Refreshed series |

        And the database should have these seasons added:
            | id | seriesId | tmdbId | name            | seasonNumber |
            | 1  | 1        | 1001   | Imported season | 1            |

        And the database should have these episodes added:
            | id | seriesId | seasonId | tmdbId | name             | runtime | seasonNumber | episodeNumber |
            | 1  | 1        | 1        | 10001  | Imported episode | 42      | 1            | 1             |

        And the database should have these genres added:
            | key   | id | tmdbId | name  |
            | drama | 1  | 10     | Drama |

        And the database should have these networks added:
            | key     | id | tmdbId | name    |
            | network | 1  | 20     | Network |

        And the database should have these providers added:
            | key                  | id | tmdbId | name                  | logoPath | displayPriority |
            | subscriptionProvider | 1  | 41     | Subscription provider |          | 3               |

        And the database should have these people added:
            | key       | id | tmdbId | name        |
            | creator   | 1  | 30     | Creator     |
            | crew      | 2  | 31     | Crew member |
            | guestStar | 3  | 32     | Guest star  |

        And the database should have these characters added:
            | key  | id | peopleId          | name |
            | hero | 1  | @people.guestStar | Hero |

        And the database should have these series genres added:
            | seriesId             | genreId       |
            | @series.cachedSeries | @genres.drama |

        And the database should have these series networks added:
            | seriesId             | networkId         |
            | @series.cachedSeries | @networks.network |

        And the database should have these series providers added:
            | seriesId             | providerId                      |
            | @series.cachedSeries | @providers.subscriptionProvider |

        And the database should have these series people added:
            | seriesId             | peopleId        |
            | @series.cachedSeries | @people.creator |

        And the database should have these episode people added:
            | episodeId | peopleId     |
            | 1         | @people.crew |

        And the database should have these episode characters added:
            | episodeId | characterId      |
            | 1         | @characters.hero |

        And the response field at "userSeries" should be null

    Scenario: Post series import - New series
        Given called by worker

        When I send a POST request to "/api/series/import" with body:
            | tmdbId |
            | 200    |

        Then the response status should be 200
        And the database should have these series added:
            | id | tmdbId | name            | numberOfEpisodes | numberOfSeasons | inProduction |
            | 2  | 200    | Imported series | 0                | 0               | true         |

        And the response field at "userSeries" should be null

    Scenario: Post series import - Invalid body
        Given authentication as "user-1"

        When I send a POST request to "/api/series/import" with body:
            | tmdbId |
            | 0      |

        Then the response status should be 400

    Scenario: Post series import - Not authenticated or worker
        When I send a POST request to "/api/series/import" with body:
            | tmdbId |
            | 100    |

        Then the response status should be 401
        And the response body should exactly match:
            | code         | message      |
            | UNAUTHORIZED | Unauthorized |
