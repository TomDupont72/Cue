import copy
import unittest
from datetime import date, datetime, timezone
from unittest.mock import Mock, patch

import httpx
from pydantic import ValidationError

from orchestrator.contracts.cue_api import UserSeriesStatus
from orchestrator.resources.cue_api import (
    REQUEST_TIMEOUT_SECONDS,
    CueApiResource,
)


SERIES_PAYLOAD = {
    "id": 42,
    "adult": False,
    "backdropPath": "/backdrop.jpg",
    "firstAirDate": "2026-01-01T00:00:00.000Z",
    "tmdbId": 1234,
    "inProduction": True,
    "lastAirDate": None,
    "name": "Contract series",
    "numberOfEpisodes": 12,
    "numberOfSeasons": 1,
    "originalLanguage": "fr",
    "originalName": "Contract series",
    "overview": None,
    "popularity": 12.5,
    "posterPath": "/poster.jpg",
    "createdAt": "2026-01-01T10:00:00.000Z",
    "updatedAt": "2026-01-02T10:00:00.000Z",
}

USER_SERIES_PAYLOAD = {
    "userId": "user-1",
    "seriesId": 42,
    "status": "WATCHING",
    "isFavorite": True,
    "watchCount": 3,
    "addedAt": "2026-01-01T10:00:00.000Z",
    "lastWatchedAt": "2026-01-02T10:00:00.000Z",
}

SERIES_IMPORT_PAYLOAD = {
    "series": SERIES_PAYLOAD,
    "userSeries": USER_SERIES_PAYLOAD,
}

SERIES_CHANGES_PAYLOAD = {
    "results": [{"tmdbId": 1234}, {"tmdbId": 5678}],
    "page": 1,
    "totalPages": 2,
    "totalResults": 2,
}

STATUS_RECALCULATE_PAYLOAD = {"updatedCount": 3}


def json_response(status_code: int, payload: object) -> httpx.Response:
    return httpx.Response(
        status_code,
        json=payload,
        request=httpx.Request("GET", "https://api.example.test/contract"),
    )


class CueApiResourceContractTests(unittest.TestCase):
    def setUp(self) -> None:
        self.resource = CueApiResource(
            base_url="https://api.example.test",
            worker_token="worker-secret",
        )
        self.authorization_headers = {"Authorization": "Bearer worker-secret"}

    @patch("orchestrator.resources.cue_api.httpx.post")
    def test_series_import_request_and_response_contract(self, post: Mock) -> None:
        post.return_value = json_response(200, SERIES_IMPORT_PAYLOAD)

        result = self.resource.post_user_series_import(1234)

        post.assert_called_once_with(
            "https://api.example.test/api/series/import",
            headers=self.authorization_headers,
            json={"tmdbId": 1234},
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
        self.assertEqual(result.series.id, 42)
        self.assertEqual(result.series.tmdb_id, 1234)
        self.assertEqual(
            result.series.created_at,
            datetime(2026, 1, 1, 10, 0, tzinfo=timezone.utc),
        )
        self.assertIsNotNone(result.user_series)
        assert result.user_series is not None
        self.assertEqual(result.user_series.status, UserSeriesStatus.WATCHING)
        self.assertEqual(result.user_series.watch_count, 3)

    @patch("orchestrator.resources.cue_api.httpx.get")
    def test_series_changes_request_and_response_contract(
        self,
        get: Mock,
    ) -> None:
        get.return_value = json_response(200, SERIES_CHANGES_PAYLOAD)

        result = self.resource.get_series_changes(
            date(2026, 8, 1),
            date(2026, 8, 3),
            1,
        )

        get.assert_called_once_with(
            "https://api.example.test/api/metadata/series/changes",
            headers=self.authorization_headers,
            params={
                "startDate": "2026-08-01",
                "endDate": "2026-08-03",
                "page": 1,
            },
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
        self.assertEqual([item.tmdb_id for item in result.results], [1234, 5678])
        self.assertEqual(result.total_pages, 2)
        self.assertEqual(result.total_results, 2)

    @patch("orchestrator.resources.cue_api.httpx.post")
    def test_status_recalculation_request_and_response_contract(
        self,
        post: Mock,
    ) -> None:
        post.return_value = json_response(200, STATUS_RECALCULATE_PAYLOAD)

        result = self.resource.post_user_status_recalculate("user-1")

        post.assert_called_once_with(
            "https://api.example.test/api/user/status/user-1/recalculate",
            headers=self.authorization_headers,
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
        self.assertEqual(result.updated_count, 3)

    def test_invalid_success_responses_are_rejected(self) -> None:
        invalid_import = copy.deepcopy(SERIES_IMPORT_PAYLOAD)
        del invalid_import["series"]["name"]

        coercible_import = copy.deepcopy(SERIES_IMPORT_PAYLOAD)
        coercible_import["series"]["id"] = "42"

        invalid_changes = copy.deepcopy(SERIES_CHANGES_PAYLOAD)
        invalid_changes["results"][0] = {"tmdb_id": 1234}

        invalid_status = {"updatedCount": -1}

        cases = [
            (
                "series import missing a required field",
                "post",
                json_response(200, invalid_import),
                lambda: self.resource.post_user_series_import(1234),
            ),
            (
                "series import coercible identifier",
                "post",
                json_response(200, coercible_import),
                lambda: self.resource.post_user_series_import(1234),
            ),
            (
                "series changes field-name drift",
                "get",
                json_response(200, invalid_changes),
                lambda: self.resource.get_series_changes(
                    date(2026, 8, 1),
                    date(2026, 8, 3),
                    1,
                ),
            ),
            (
                "negative updated count",
                "post",
                json_response(200, invalid_status),
                lambda: self.resource.post_user_status_recalculate("user-1"),
            ),
        ]

        for label, method, response, request in cases:
            with self.subTest(label=label):
                with patch(
                    f"orchestrator.resources.cue_api.httpx.{method}",
                    return_value=response,
                ):
                    with self.assertRaises(ValidationError):
                        request()

    @patch("orchestrator.resources.cue_api.httpx.post")
    def test_unknown_response_fields_are_rejected(
        self,
        post: Mock,
    ) -> None:
        post.return_value = json_response(
            200,
            {"updatedCount": 3, "unexpectedField": True},
        )

        with self.assertRaises(ValidationError):
            self.resource.post_user_status_recalculate("user-1")

    @patch("orchestrator.resources.cue_api.httpx.get")
    def test_malformed_json_is_rejected(self, get: Mock) -> None:
        get.return_value = httpx.Response(
            200,
            content=b"not-json",
            request=httpx.Request("GET", "https://api.example.test/contract"),
        )

        with self.assertRaises(ValidationError):
            self.resource.get_series_changes(
                date(2026, 8, 1),
                date(2026, 8, 3),
                1,
            )

    @patch("orchestrator.resources.cue_api.httpx.post")
    def test_http_errors_are_raised_before_response_validation(
        self,
        post: Mock,
    ) -> None:
        post.return_value = httpx.Response(
            503,
            content=b"not-json",
            request=httpx.Request("POST", "https://api.example.test/contract"),
        )

        with self.assertRaises(httpx.HTTPStatusError) as error:
            self.resource.post_user_series_import(1234)

        self.assertEqual(error.exception.response.status_code, 503)


if __name__ == "__main__":
    unittest.main()
