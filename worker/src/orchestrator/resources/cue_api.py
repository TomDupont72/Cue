import httpx
import dagster as dg


class CueApiResource(dg.ConfigurableResource):
    base_url: str
    worker_token: str

    def sync_series(self, tmdb_id: int) -> dict:
        response = httpx.post(
            f"{self.base_url}/api/import",
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