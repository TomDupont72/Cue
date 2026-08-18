Feature: Series response fixtures

  Scenario: series.get.one-piece
    Given an exact series response:
      | series   | seasons    | episodes                | userSeries    | userEpisodes     |
      | onePiece | onePieceS1 | onePieceE1,onePieceE2   | user1OnePiece | user1OnePieceE1  |

  Scenario: series.get.naruto
    Given an exact series response:
      | series | seasons  | episodes            | userSeries  | userEpisodes |
      | naruto | narutoS1 | narutoE1,narutoE2  | user1Naruto |              |

  Scenario: series.get.one-piece-without-progress
    Given an exact series response:
      | series   | seasons    | episodes              | userSeries | userEpisodes |
      | onePiece | onePieceS1 | onePieceE1,onePieceE2 | null       |              |

  Scenario: series.get.not-found
    Given an exact error response:
      | code             | message          |
      | SERIES_NOT_FOUND | Series not found |

  Scenario: series.get.invalid-id
    Given a partial error response:
      | code             | message         |
      | VALIDATION_ERROR | Invalid request |