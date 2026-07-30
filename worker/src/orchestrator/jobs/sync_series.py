import dagster as dg

from orchestrator.resources.cue_api import CueApiResource
from orchestrator.resources.database import DatabaseResource


class SyncSeriesConfig(dg.Config):
    tmdb_id: int

@dg.op
def get_series_to_sync(
    context: dg.OpExecutionContext,
    database: DatabaseResource,
) -> list[int]:
    with database.get_engine().connect() as connection:
        rows = connection.execute(
            text("""
                SELECT "tmdbId"
                FROM "Series"
                ORDER BY "id"
            """)
        )

        tmdb_ids = [row.tmdbId for row in rows]

    context.log.info(
        f"{len(tmdb_ids)} séries récupérées"
    )

    return tmdb_ids

@dg.op
def sync_series(
    context: dg.OpExecutionContext,
    tmdb_ids: list[int],
    cue_api: CueApiResource,
) -> None:
    for tmdb_id in tmdb_ids:
        cue_api.sync_series(tmdb_id)

        context.log.info(
            f"Série TMDB {tmdb_id} synchronisée"
        )

@dg.job
def sync_all_series_job():
    sync_series(get_series_to_sync())