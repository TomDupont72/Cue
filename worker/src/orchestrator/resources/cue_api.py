import time
from datetime import date
from typing import TypeVar

import dagster as dg
import httpx
from pydantic import BaseModel, PrivateAttr

from orchestrator.contracts.cue_api import (
    SeriesChangesResponse,
    SeriesImportResponse,
    UserStatusRecalculateResponse,
)


ResponseModel = TypeVar("ResponseModel", bound=BaseModel)
REQUEST_TIMEOUT_SECONDS = 120
HTTP_MAX_ATTEMPTS = 3
HTTP_RETRY_BACKOFF_SECONDS = 1.0
HTTP_MAX_RETRY_DELAY_SECONDS = 30.0
RETRYABLE_STATUS_CODES = frozenset({408, 425, 429, 500, 502, 503, 504})


def _validated_response(
    response: httpx.Response,
    response_model: type[ResponseModel],
) -> ResponseModel:
    response.raise_for_status()
    return response_model.model_validate_json(response.content)


class CueApiResource(dg.ConfigurableResource):
    base_url: str
    worker_token: str
    _client: httpx.Client | None = PrivateAttr(default=None)

    @property
    def _authorization_headers(self) -> dict[str, str]:
        return {"Authorization": f"Bearer {self.worker_token}"}

    def setup_for_execution(self, context: dg.InitResourceContext) -> None:
        self._get_client()

    def teardown_after_execution(self, context: dg.InitResourceContext) -> None:
        if self._client is not None:
            self._client.close()
            self._client = None

    def _get_client(self) -> httpx.Client:
        if self._client is None:
            self._client = httpx.Client(
                base_url=self.base_url.rstrip("/"),
                headers=self._authorization_headers,
                timeout=REQUEST_TIMEOUT_SECONDS,
            )

        return self._client

    @staticmethod
    def _retry_delay(response: httpx.Response | None, attempt: int) -> float:
        if response is not None:
            retry_after = response.headers.get("Retry-After")
            if retry_after is not None:
                try:
                    return min(
                        max(float(retry_after), 0.0),
                        HTTP_MAX_RETRY_DELAY_SECONDS,
                    )
                except ValueError:
                    pass

        return min(
            HTTP_RETRY_BACKOFF_SECONDS * (2 ** (attempt - 1)),
            HTTP_MAX_RETRY_DELAY_SECONDS,
        )

    def _request(self, method: str, path: str, **kwargs: object) -> httpx.Response:
        client = self._get_client()

        for attempt in range(1, HTTP_MAX_ATTEMPTS + 1):
            response: httpx.Response | None = None
            try:
                response = client.request(method, path, **kwargs)
            except httpx.TransportError:
                if attempt == HTTP_MAX_ATTEMPTS:
                    raise
            else:
                if response.status_code not in RETRYABLE_STATUS_CODES:
                    response.raise_for_status()
                    return response

                if attempt == HTTP_MAX_ATTEMPTS:
                    response.raise_for_status()

                response.close()

            time.sleep(self._retry_delay(response, attempt))

        raise RuntimeError("Cue API request retry loop exhausted")

    def post_user_series_import(self, tmdb_id: int) -> SeriesImportResponse:
        response = self._request(
            "POST",
            "/api/series/import",
            json={"tmdbId": tmdb_id},
        )

        return _validated_response(response, SeriesImportResponse)

    def get_series_changes(
        self,
        start_date: date,
        end_date: date,
        page: int,
    ) -> SeriesChangesResponse:
        response = self._request(
            "GET",
            "/api/metadata/series/changes",
            params={
                "startDate": start_date.isoformat(),
                "endDate": end_date.isoformat(),
                "page": page,
            },
        )

        return _validated_response(response, SeriesChangesResponse)

    def post_user_status_recalculate(self, user_id: str) -> UserStatusRecalculateResponse:
        response = self._request(
            "POST",
            f"/api/user/status/{user_id}/recalculate",
        )

        return _validated_response(response, UserStatusRecalculateResponse)

    def post_user_statuses_recalculate(self) -> UserStatusRecalculateResponse:
        response = self._request(
            "POST",
            "/api/user/status/recalculate",
        )

        return _validated_response(response, UserStatusRecalculateResponse)
