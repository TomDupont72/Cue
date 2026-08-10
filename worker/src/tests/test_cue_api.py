import copy
import json
import unittest
from datetime import date, datetime, timezone
from collections.abc import Callable
from unittest.mock import patch

import httpx
from pydantic import ValidationError

from orchestrator.contracts.cue_api import UserSeriesStatus
from orchestrator.resources.cue_api import (
    REQUEST_TIMEOUT_SECONDS,
    HTTP_MAX_ATTEMPTS,
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
        self.requests: list[httpx.Request] = []

    def tearDown(self) -> None:
        if self.resource._client is not None:
            self.resource._client.close()

    def use_handler(
        self,
        handler: Callable[[httpx.Request], httpx.Response],
    ) -> None:
        if self.resource._client is not None:
            self.resource._client.close()

        def recording_handler(request: httpx.Request) -> httpx.Response:
            self.requests.append(request)
            return handler(request)

        self.resource._client = httpx.Client(
            base_url=self.resource.base_url,
            headers=self.authorization_headers,
            timeout=REQUEST_TIMEOUT_SECONDS,
            transport=httpx.MockTransport(recording_handler),
        )

    def use_responses(self, *responses: httpx.Response) -> None:
        response_iterator = iter(responses)

        def next_response(request: httpx.Request) -> httpx.Response:
            try:
                return next(response_iterator)
            except StopIteration as error:
                raise AssertionError("Unexpected Cue API request") from error

        self.use_handler(next_response)

    def test_series_import_request_and_response_contract(self) -> None:
        self.use_responses(json_response(200, SERIES_IMPORT_PAYLOAD))

        result = self.resource.post_user_series_import(1234)

        self.assertEqual(len(self.requests), 1)
        request = self.requests[0]
        self.assertEqual(request.method, "POST")
        self.assertEqual(
            str(request.url),
            "https://api.example.test/api/series/import",
        )
        self.assertEqual(request.headers["Authorization"], "Bearer worker-secret")
        self.assertEqual(json.loads(request.content), {"tmdbId": 1234})
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

    def test_series_changes_request_and_response_contract(self) -> None:
        self.use_responses(json_response(200, SERIES_CHANGES_PAYLOAD))

        result = self.resource.get_series_changes(
            date(2026, 8, 1),
            date(2026, 8, 3),
            1,
        )

        self.assertEqual(len(self.requests), 1)
        request = self.requests[0]
        self.assertEqual(request.method, "GET")
        self.assertEqual(
            request.url.copy_with(query=None),
            httpx.URL("https://api.example.test/api/metadata/series/changes"),
        )
        self.assertEqual(
            dict(request.url.params),
            {"startDate": "2026-08-01", "endDate": "2026-08-03", "page": "1"},
        )
        self.assertEqual([item.tmdb_id for item in result.results], [1234, 5678])
        self.assertEqual(result.total_pages, 2)
        self.assertEqual(result.total_results, 2)

    def test_status_recalculation_request_and_response_contract(self) -> None:
        self.use_responses(
            json_response(200, STATUS_RECALCULATE_PAYLOAD),
            json_response(200, STATUS_RECALCULATE_PAYLOAD),
        )

        result = self.resource.post_user_status_recalculate("user-1")
        batch_result = self.resource.post_user_statuses_recalculate()

        self.assertEqual(
            [str(request.url) for request in self.requests],
            [
                "https://api.example.test/api/user/status/user-1/recalculate",
                "https://api.example.test/api/user/status/recalculate",
            ],
        )
        self.assertEqual(result.updated_count, 3)
        self.assertEqual(batch_result.updated_count, 3)

    def test_invalid_success_responses_are_rejected(self) -> None:
        invalid_import = copy.deepcopy(SERIES_IMPORT_PAYLOAD)
        del invalid_import["series"]["name"]

        coercible_import = copy.deepcopy(SERIES_IMPORT_PAYLOAD)
        coercible_import["series"]["id"] = "42"

        invalid_changes = copy.deepcopy(SERIES_CHANGES_PAYLOAD)
        invalid_changes["results"][0] = {"tmdb_id": 1234}

        invalid_status = {"updatedCount": -1}

        cases: list[tuple[str, httpx.Response, Callable[[], object]]] = [
            (
                "series import missing a required field",
                json_response(200, invalid_import),
                lambda: self.resource.post_user_series_import(1234),
            ),
            (
                "series import coercible identifier",
                json_response(200, coercible_import),
                lambda: self.resource.post_user_series_import(1234),
            ),
            (
                "series changes field-name drift",
                json_response(200, invalid_changes),
                lambda: self.resource.get_series_changes(
                    date(2026, 8, 1),
                    date(2026, 8, 3),
                    1,
                ),
            ),
            (
                "negative updated count",
                json_response(200, invalid_status),
                lambda: self.resource.post_user_statuses_recalculate(),
            ),
        ]

        for label, response, request in cases:
            with self.subTest(label=label):
                self.use_responses(response)
                with self.assertRaises(ValidationError):
                    request()

    def test_unknown_response_fields_are_rejected(self) -> None:
        self.use_responses(
            json_response(
                200,
                {"updatedCount": 3, "unexpectedField": True},
            )
        )

        with self.assertRaises(ValidationError):
            self.resource.post_user_statuses_recalculate()

    def test_malformed_json_is_rejected(self) -> None:
        self.use_responses(
            httpx.Response(
                200,
                content=b"not-json",
                request=httpx.Request("GET", "https://api.example.test/contract"),
            )
        )

        with self.assertRaises(ValidationError):
            self.resource.get_series_changes(
                date(2026, 8, 1),
                date(2026, 8, 3),
                1,
            )

    def test_non_retryable_http_errors_are_not_retried(self) -> None:
        self.use_responses(
            httpx.Response(
                400,
                content=b"not-json",
                request=httpx.Request("POST", "https://api.example.test/contract"),
            )
        )

        with self.assertRaises(httpx.HTTPStatusError) as error:
            self.resource.post_user_series_import(1234)

        self.assertEqual(error.exception.response.status_code, 400)
        self.assertEqual(len(self.requests), 1)

    @patch("orchestrator.resources.cue_api.time.sleep")
    def test_transient_http_errors_are_retried_with_a_bound(
        self,
        sleep: object,
    ) -> None:
        self.use_responses(
            httpx.Response(
                503,
                request=httpx.Request("POST", "https://api.example.test/contract"),
            ),
            httpx.Response(
                429,
                headers={"Retry-After": "0"},
                request=httpx.Request("POST", "https://api.example.test/contract"),
            ),
            json_response(200, SERIES_IMPORT_PAYLOAD),
        )

        result = self.resource.post_user_series_import(1234)

        self.assertEqual(result.series.tmdb_id, 1234)
        self.assertEqual(len(self.requests), HTTP_MAX_ATTEMPTS)
        sleep.assert_has_calls([unittest.mock.call(1.0), unittest.mock.call(0.0)])

    @patch("orchestrator.resources.cue_api.time.sleep")
    def test_transport_errors_are_retried_with_a_bound(self, sleep: object) -> None:
        attempts = 0

        def handler(request: httpx.Request) -> httpx.Response:
            nonlocal attempts
            attempts += 1
            if attempts < HTTP_MAX_ATTEMPTS:
                raise httpx.ConnectError("connection refused", request=request)
            return json_response(200, SERIES_IMPORT_PAYLOAD)

        self.use_handler(handler)

        result = self.resource.post_user_series_import(1234)

        self.assertEqual(result.series.tmdb_id, 1234)
        self.assertEqual(attempts, HTTP_MAX_ATTEMPTS)
        self.assertEqual(sleep.call_count, HTTP_MAX_ATTEMPTS - 1)

    @patch("orchestrator.resources.cue_api.time.sleep")
    def test_last_transient_error_is_raised(self, sleep: object) -> None:
        self.use_responses(
            *[
                httpx.Response(
                    503,
                    content=b"not-json",
                    request=httpx.Request("POST", "https://api.example.test/contract"),
                )
                for _ in range(HTTP_MAX_ATTEMPTS)
            ]
        )

        with self.assertRaises(httpx.HTTPStatusError) as error:
            self.resource.post_user_series_import(1234)

        self.assertEqual(error.exception.response.status_code, 503)
        self.assertEqual(len(self.requests), HTTP_MAX_ATTEMPTS)
        self.assertEqual(sleep.call_count, HTTP_MAX_ATTEMPTS - 1)

    def test_one_client_is_reused_for_multiple_requests(self) -> None:
        self.use_responses(
            json_response(200, SERIES_IMPORT_PAYLOAD),
            httpx.Response(
                400,
                content=b"not-json",
                request=httpx.Request("POST", "https://api.example.test/contract"),
            ),
        )
        client = self.resource._client

        self.resource.post_user_series_import(1234)

        with self.assertRaises(httpx.HTTPStatusError) as error:
            self.resource.post_user_series_import(1234)

        self.assertEqual(error.exception.response.status_code, 400)
        self.assertIs(self.resource._client, client)
        self.assertEqual(len(self.requests), 2)


if __name__ == "__main__":
    unittest.main()
