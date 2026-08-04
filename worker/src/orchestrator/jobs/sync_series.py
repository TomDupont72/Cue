import dagster as dg
from sqlalchemy import text
import datetime

from orchestrator.resources.cue_api import CueApiResource
from orchestrator.resources.database import DatabaseResource


class SyncSeriesConfig(dg.Config):
    tmdb_id: int

@dg.op
def get_series_changes(
    context: dg.OpExecutionContext,
    cue_api: CueApiResource
) -> list[int]:
    tmdb_ids = []

    current_date = datetime.date.today()

    start_date = (current_date - datetime.timedelta(days=2)).isoformat()
    end_date = current_date.isoformat()

    first_page = cue_api.get_series_changes(
        start_date,
        end_date,
        1
    )

    tmdb_ids += [result["tmbdId"] for result in first_page["results"]]

    for page in range(2, first_page["totalPages"] + 1):
        current_page = cue_api.get_series_changes(
            start_date,
            end_date,
            page
        )

        tmdb_ids += [result["tmbdId"] for result in current_page["results"]]

    context.log.info(
        f"{first_page["totalResults"]} changements TMDB"
    )

    return tmdb_ids

@dg.op
def get_all_series(
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
    cue_api: CueApiResource,
    series_ids: list[int],
    tmdb_ids: list[int],
) -> None:
    tmbd_ids_to_sync = list(set(series_ids) & set(tmdb_ids))

    context.log.info(
        f"Synchronisation de {len(tmbd_ids_to_sync)} séries"
    )
    
    for tmbd_id_to_sync in tmbd_ids_to_sync:
        cue_api.sync_series(tmbd_id_to_sync)

        context.log.info(
            f"Série TMDB {tmbd_id_to_sync} synchronisée"
        )

@dg.job
def sync_all_series_job():
    sync_series(
        get_series_changes(), 
        get_all_series()
    )