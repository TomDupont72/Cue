Feature: Series routes

  Background:
    Given the API state is "default.authenticated"

  Scenario: Get a series by id
    Then GET "/api/series/<id>" should satisfy:
      | id      | state              | status | response                              |
      | 1       |                    | 200    | series.get.one-piece                  |
      | 2       |                    | 200    | series.get.naruto                     |
      | 1       | default.other-user | 200    | series.get.one-piece-without-progress |
      | 999     |                    | 404    | series.get.not-found                  |
      | invalid |                    | 400    | series.get.invalid-id                 |