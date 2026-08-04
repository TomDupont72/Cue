import httpx
import dagster as dg
from datetime import date


class CueApiResource(dg.ConfigurableResource):
    base_url: str
    worker_token: str

    def sync_series(self, tmdb_id: int) -> dict:
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

    def get_series_changes(self, start_date: date, end_date: date, page: int):
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