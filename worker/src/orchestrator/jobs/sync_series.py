import datetime

import dagster as dg
from sqlalchemy import text

from orchestrator.resources.cue_api import CueApiResource
from orchestrator.resources.database import DatabaseResource


class SyncSeriesConfig(dg.Config):
    tmdb_id: int


def select_tmdb_ids_to_sync(
    series_ids: list[int],
    changed_tmdb_ids: list[int],
) -> list[int]:
    existing_tmdb_ids = set(series_ids)

    return list(
        dict.fromkeys(
            tmdb_id for tmdb_id in changed_tmdb_ids if tmdb_id in existing_tmdb_ids
        )
    )


@dg.op
def get_series_changes(context: dg.OpExecutionContext, cue_api: CueApiResource) -> list[int]:
    tmdb_ids = []

    current_date = datetime.date.today()

    start_date = (current_date - datetime.timedelta(days=2)).isoformat()
    end_date = current_date.isoformat()

    first_page = cue_api.get_series_changes(start_date, end_date, 1)

    tmdb_ids += [result["tmdbId"] for result in first_page["results"]]

    for page in range(2, first_page["totalPages"] + 1):
        current_page = cue_api.get_series_changes(start_date, end_date, page)

        tmdb_ids += [result["tmdbId"] for result in current_page["results"]]

    context.log.info(f"{first_page['totalResults']} changements TMDB")

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

    context.log.info(f"{len(tmdb_ids)} séries récupérées")

    return tmdb_ids


@dg.op
def sync_series(
    context: dg.OpExecutionContext,
    cue_api: CueApiResource,
    changed_tmdb_ids: list[int],
    series_tmdb_ids: list[int],
) -> list[int]:
    tmdb_ids_to_sync = select_tmdb_ids_to_sync(series_tmdb_ids, changed_tmdb_ids)

    context.log.info(f"Synchronisation de {len(tmdb_ids_to_sync)} séries")

    for tmdb_id_to_sync in tmdb_ids_to_sync:
        cue_api.post_user_series_import(tmdb_id_to_sync)

        context.log.info(f"Série TMDB {tmdb_id_to_sync} synchronisée")

    return tmdb_ids_to_sync


@dg.op
def reconcile_series(
    context: dg.OpExecutionContext,
    cue_api: CueApiResource,
    tmdb_ids: list[int],
) -> None:
    result = cue_api.post_series_reconcile(tmdb_ids)

    context.log.info(
        f"Séries réconciliées : {result['updatedCount']} série(s) modifiée(s)"
    )


@dg.op(ins={"after_series_reconcile": dg.In(dg.Nothing)})
def reconcile_user_series(
    context: dg.OpExecutionContext,
    database: DatabaseResource,
    cue_api: CueApiResource,
) -> None:
    with database.get_engine().connect() as connection:
        rows = connection.execute(
            text("""
                SELECT "id"
                FROM "user"
            """)
        )

        user_ids = [row.id for row in rows]

    context.log.info(f"{len(user_ids)} utilisateurs récupérés")

    for user_id in user_ids:
        result = cue_api.post_user_series_reconcile(user_id)

        context.log.info(
            f"Séries de l'utilisateur {user_id} réconciliées : "
            f"{result['updatedCount']} série(s) modifiée(s)"
        )


@dg.job
def sync_all_series_job():
    reconcile_user_series(
        reconcile_series(
            sync_series(
                get_series_changes(),
                get_all_series(),
            )
        )
    )
