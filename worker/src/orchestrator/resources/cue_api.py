import httpx
import dagster as dg
from datetime import date


class CueApiResource(dg.ConfigurableResource):
    base_url: str
    worker_token: str

    def post_user_series_import(self, tmdb_id: int) -> dict:
        response = httpx.post(
            f"{self.base_url}/api/series/import",
            headers={
                "Authorization": f"Bearer {self.worker_token}"
            },
            json={
                "tmdbId": tmdb_id,
            },
            timeout=120,
        )

        response.raise_for_status()
        return response.json()

    def get_series_changes(self, start_date: date, end_date: date, page: int) -> dict:
        response = httpx.get(
            f"{self.base_url}/api/metadata/series/changes",
            headers={
                "Authorization": f"Bearer {self.worker_token}"
            },
            params={
                "startDate": start_date,
                "endDate": end_date,
                "page": page
            },
            timeout=120
        )

        response.raise_for_status()
        return response.json()

    def post_user_series_reconcile(self, user_id: str) -> dict:
        response = httpx.post(
            f"{self.base_url}/api/user/{user_id}/series/reconcile",
            headers={
                "Authorization": f"Bearer {self.worker_token}"
            },
            timeout=120
        )

        response.raise_for_status()
        return response.json()

    def post_series_reconcile(self, tmdb_ids: list[int]) -> dict:
        response = httpx.post(
            f"{self.base_url}/api/series/reconcile",
            headers={"Authorization": f"Bearer {self.worker_token}"},
            json={
                "tmdbIds": tmdb_ids,
            },
            timeout=120,
        )

        response.raise_for_status()
        return response.json()
