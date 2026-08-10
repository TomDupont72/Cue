from datetime import date
from typing import TypeVar

import dagster as dg
import httpx
from pydantic import BaseModel

from orchestrator.contracts.cue_api import (
    SeriesChangesResponse,
    SeriesImportResponse,
    UserStatusRecalculateResponse,
)


ResponseModel = TypeVar("ResponseModel", bound=BaseModel)
REQUEST_TIMEOUT_SECONDS = 120


def _validated_response(
    response: httpx.Response,
    response_model: type[ResponseModel],
) -> ResponseModel:
    response.raise_for_status()
    return response_model.model_validate_json(response.content)


class CueApiResource(dg.ConfigurableResource):
    base_url: str
    worker_token: str

    @property
    def _authorization_headers(self) -> dict[str, str]:
        return {"Authorization": f"Bearer {self.worker_token}"}

    def post_user_series_import(self, tmdb_id: int) -> SeriesImportResponse:
        response = httpx.post(
            f"{self.base_url}/api/series/import",
            headers=self._authorization_headers,
            json={"tmdbId": tmdb_id},
            timeout=REQUEST_TIMEOUT_SECONDS,
        )

        return _validated_response(response, SeriesImportResponse)

    def get_series_changes(
        self,
        start_date: date,
        end_date: date,
        page: int,
    ) -> SeriesChangesResponse:
        response = httpx.get(
            f"{self.base_url}/api/metadata/series/changes",
            headers=self._authorization_headers,
            params={
                "startDate": start_date.isoformat(),
                "endDate": end_date.isoformat(),
                "page": page,
            },
            timeout=REQUEST_TIMEOUT_SECONDS,
        )

        return _validated_response(response, SeriesChangesResponse)

    def post_user_status_recalculate(self, user_id: str) -> UserStatusRecalculateResponse:
        response = httpx.post(
            f"{self.base_url}/api/user/status/{user_id}/recalculate",
            headers=self._authorization_headers,
            timeout=REQUEST_TIMEOUT_SECONDS,
        )

        return _validated_response(response, UserStatusRecalculateResponse)
