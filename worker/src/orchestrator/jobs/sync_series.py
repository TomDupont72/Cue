import datetime
import json
from collections.abc import Iterator, Sequence
from dataclasses import dataclass

import dagster as dg
from sqlalchemy import text

from orchestrator.resources.cue_api import CueApiResource
from orchestrator.resources.database import DatabaseResource


SYNC_RUN_TAG = "cue/sync_series"
SYNC_MODE_TAG = "cue/sync_mode"
SCHEDULED_EXECUTION_TIME_TAG = "cue/scheduled_execution_time"
FAILED_SERIES_IDS_TAG = "cue/failed_series_ids"
STATUS_RECALC_FAILED_TAG = "cue/status_recalc_failed"
INCREMENTAL_MODE = "incremental"
FULL_RECONCILIATION_MODE = "full_reconciliation"
TMDB_MAX_WINDOW_DAYS = 14
MAX_PARALLEL_IMPORTS = 4
IMPORT_BATCH_SIZE = 20
WATERMARK_HISTORY_LIMIT = 100
MAX_QUEUED_FAILURE_IDS = 500

API_RETRY_POLICY = dg.RetryPolicy(
    max_retries=2,
    delay=5,
    backoff=dg.Backoff.EXPONENTIAL,
    jitter=dg.Jitter.PLUS_MINUS,
)


class SyncSeriesConfig(dg.Config):
    scheduled_execution_time: str
    full_reconciliation: bool = False


@dataclass(frozen=True)
class ChangeWindow:
    start_date: datetime.date
    end_date: datetime.date


@dataclass(frozen=True)
class SyncRunState:
    watermark: datetime.datetime
    failed_series_ids: frozenset[int]


@dataclass(frozen=True)
class SyncBatchResult:
    synced_ids: tuple[int, ...]
    failed_ids: tuple[int, ...]


def _require_aware(value: datetime.datetime, field_name: str) -> datetime.datetime:
    if value.tzinfo is None or value.utcoffset() is None:
        raise ValueError(f"{field_name} must include a timezone")
    return value


def _parse_scheduled_execution_time(value: str) -> datetime.datetime:
    parsed = datetime.datetime.fromisoformat(value.replace("Z", "+00:00"))
    return _require_aware(parsed, SCHEDULED_EXECUTION_TIME_TAG)


def _parse_failed_series_ids(value: str | None) -> frozenset[int]:
    if value is None:
        return frozenset()

    parsed = json.loads(value)
    if not isinstance(parsed, list) or any(
        not isinstance(tmdb_id, int) or isinstance(tmdb_id, bool) or tmdb_id <= 0
        for tmdb_id in parsed
    ):
        raise ValueError(f"Invalid {FAILED_SERIES_IDS_TAG} run tag")

    return frozenset(parsed)


def latest_successful_sync_state(
    instance: dg.DagsterInstance,
    job_name: str,
) -> SyncRunState | None:
    """Return the newest successful sync's watermark and retry queue.

    Run tags live in Dagster's persistent run storage. A failed run therefore never
    advances this state. Full reconciliations establish a valid watermark too.
    """

    states: list[SyncRunState] = []
    for mode in (INCREMENTAL_MODE, FULL_RECONCILIATION_MODE):
        runs = instance.get_runs(
            filters=dg.RunsFilter(
                job_name=job_name,
                statuses=[dg.DagsterRunStatus.SUCCESS],
                tags={SYNC_MODE_TAG: mode},
            ),
            limit=WATERMARK_HISTORY_LIMIT,
        )

        for run in runs:
            value = run.tags.get(SCHEDULED_EXECUTION_TIME_TAG)
            if value is None:
                continue
            try:
                states.append(
                    SyncRunState(
                        watermark=_parse_scheduled_execution_time(value),
                        failed_series_ids=_parse_failed_series_ids(
                            run.tags.get(FAILED_SERIES_IDS_TAG)
                        ),
                    )
                )
            except (json.JSONDecodeError, ValueError):
                continue

    return max(states, key=lambda state: state.watermark) if states else None


def latest_successful_watermark(
    instance: dg.DagsterInstance,
    job_name: str,
) -> datetime.datetime | None:
    state = latest_successful_sync_state(instance, job_name)
    return state.watermark if state is not None else None


def build_change_windows(
    watermark: datetime.datetime,
    scheduled_execution_time: datetime.datetime,
) -> list[ChangeWindow]:
    """Split a date interval into TMDB-compatible 14-day windows.

    The first date is deliberately inclusive. Consecutive runs replay the boundary
    day, which prevents changes after the previous 03:00 tick from being skipped.
    Series imports are upserts, so this overlap is idempotent. The caller falls back
    to a full reconciliation when the interval exceeds TMDB's retained history.
    """

    watermark = _require_aware(watermark, "watermark")
    scheduled_execution_time = _require_aware(
        scheduled_execution_time,
        "scheduled_execution_time",
    )

    local_watermark = watermark.astimezone(scheduled_execution_time.tzinfo)
    start_date = local_watermark.date()
    final_date = scheduled_execution_time.date()
    windows: list[ChangeWindow] = []

    while start_date <= final_date:
        end_date = min(
            start_date + datetime.timedelta(days=TMDB_MAX_WINDOW_DAYS - 1),
            final_date,
        )
        windows.append(ChangeWindow(start_date=start_date, end_date=end_date))
        start_date = end_date + datetime.timedelta(days=1)

    return windows


def change_feed_retention_exceeded(
    watermark: datetime.datetime,
    scheduled_execution_time: datetime.datetime,
    current_time: datetime.datetime | None = None,
) -> bool:
    watermark = _require_aware(watermark, "watermark")
    scheduled_execution_time = _require_aware(
        scheduled_execution_time,
        "scheduled_execution_time",
    )
    start_date = watermark.astimezone(scheduled_execution_time.tzinfo).date()
    inclusive_days = (scheduled_execution_time.date() - start_date).days + 1
    if current_time is None:
        current_time = datetime.datetime.now(datetime.timezone.utc)
    current_time = _require_aware(current_time, "current_time")
    oldest_available_date = current_time.astimezone(datetime.timezone.utc).date() - (
        datetime.timedelta(days=TMDB_MAX_WINDOW_DAYS - 1)
    )
    return (
        inclusive_days > TMDB_MAX_WINDOW_DAYS
        or start_date < oldest_available_date
    )


def _get_all_series_ids(database: DatabaseResource) -> set[int]:
    with database.get_engine().connect() as connection:
        rows = connection.execute(
            text(
                """
                SELECT "tmdbId"
                FROM "Series"
                ORDER BY "id"
                """
            )
        )
        return {row.tmdbId for row in rows}


def _get_changed_series_ids(
    context: dg.OpExecutionContext,
    cue_api: CueApiResource,
    windows: Sequence[ChangeWindow],
) -> set[int]:
    changed_ids: set[int] = set()

    for window in windows:
        first_page = cue_api.get_series_changes(
            window.start_date,
            window.end_date,
            1,
        )
        changed_ids.update(result.tmdb_id for result in first_page.results)

        for page in range(2, first_page.total_pages + 1):
            current_page = cue_api.get_series_changes(
                window.start_date,
                window.end_date,
                page,
            )
            changed_ids.update(result.tmdb_id for result in current_page.results)

        context.log.info(
            "Fenêtre TMDB %s → %s : %s changement(s)",
            window.start_date.isoformat(),
            window.end_date.isoformat(),
            first_page.total_results,
        )

    return changed_ids


@dg.op(out=dg.DynamicOut(list[int]), retry_policy=API_RETRY_POLICY)
def discover_series(
    context: dg.OpExecutionContext,
    config: SyncSeriesConfig,
    database: DatabaseResource,
    cue_api: CueApiResource,
) -> Iterator[dg.DynamicOutput[list[int]]]:
    scheduled_execution_time = _parse_scheduled_execution_time(
        config.scheduled_execution_time,
    )
    stored_ids = _get_all_series_ids(database)

    if config.full_reconciliation:
        selected_ids = stored_ids
        context.log.info(
            "Réconciliation complète de %s série(s)",
            len(selected_ids),
        )
    else:
        state = latest_successful_sync_state(context.instance, context.job_name)
        if state is None:
            selected_ids = stored_ids
            context.log.info(
                "Aucun watermark incrémental : réconciliation initiale de %s série(s)",
                len(selected_ids),
            )
        elif change_feed_retention_exceeded(
            state.watermark,
            scheduled_execution_time,
        ):
            selected_ids = stored_ids
            context.log.warning(
                "Watermark %s hors de la rétention TMDB de %s jours : "
                "réconciliation complète de %s série(s)",
                state.watermark.isoformat(),
                TMDB_MAX_WINDOW_DAYS,
                len(selected_ids),
            )
        else:
            windows = build_change_windows(
                state.watermark,
                scheduled_execution_time,
            )
            changed_ids = _get_changed_series_ids(context, cue_api, windows)
            selected_ids = stored_ids & changed_ids
            context.log.info(
                "Watermark %s, exécution planifiée %s : %s série(s) à synchroniser",
                state.watermark.isoformat(),
                scheduled_execution_time.isoformat(),
                len(selected_ids),
            )

        if state is not None:
            failed_ids_to_retry = stored_ids & state.failed_series_ids
            selected_ids |= failed_ids_to_retry
            if failed_ids_to_retry:
                context.log.info(
                    "Nouvelle tentative pour %s série(s) en échec isolé",
                    len(failed_ids_to_retry),
                )

    ordered_ids = sorted(selected_ids)
    for offset in range(0, len(ordered_ids), IMPORT_BATCH_SIZE):
        batch = ordered_ids[offset : offset + IMPORT_BATCH_SIZE]
        yield dg.DynamicOutput(
            batch,
            mapping_key=f"batch_{offset // IMPORT_BATCH_SIZE:05d}",
            metadata={
                "batch_size": len(batch),
                "first_tmdb_id": batch[0],
                "last_tmdb_id": batch[-1],
            },
        )


@dg.op(retry_policy=API_RETRY_POLICY)
def sync_series_batch(
    context: dg.OpExecutionContext,
    cue_api: CueApiResource,
    tmdb_ids: list[int],
) -> SyncBatchResult:
    synced_ids: list[int] = []
    failures: list[tuple[int, Exception]] = []

    for tmdb_id in tmdb_ids:
        try:
            cue_api.post_user_series_import(tmdb_id)
        except Exception as error:
            failures.append((tmdb_id, error))
            context.log.exception(
                "Échec de la série TMDB %s ; le batch continue",
                tmdb_id,
            )
        else:
            synced_ids.append(tmdb_id)
            context.log.info("Série TMDB %s synchronisée", tmdb_id)

    if failures and _retry_number(context) < API_RETRY_POLICY.max_retries:
        failed_ids = ", ".join(str(tmdb_id) for tmdb_id, _ in failures)
        raise RuntimeError(
            f"Échec de {len(failures)} import(s) TMDB dans le batch : {failed_ids}"
        ) from failures[0][1]

    failed_ids = tuple(tmdb_id for tmdb_id, _ in failures)
    if failed_ids:
        context.log.error(
            "%s série(s) placée(s) dans la file de nouvelle tentative : %s",
            len(failed_ids),
            ", ".join(str(tmdb_id) for tmdb_id in failed_ids),
        )
        context.add_output_metadata({"failed_tmdb_ids": list(failed_ids)})

    return SyncBatchResult(
        synced_ids=tuple(synced_ids),
        failed_ids=failed_ids,
    )


def _retry_number(context: dg.OpExecutionContext) -> int:
    try:
        return context.retry_number
    except AttributeError:
        # Direct op invocation in unit tests has no step execution context.
        return API_RETRY_POLICY.max_retries


@dg.op(retry_policy=API_RETRY_POLICY)
def update_user_statuses(
    context: dg.OpExecutionContext,
    cue_api: CueApiResource,
    synced_batches: list[SyncBatchResult],
) -> None:
    synced_count = sum(len(batch.synced_ids) for batch in synced_batches)
    failed_ids = sorted(
        {
            tmdb_id
            for batch in synced_batches
            for tmdb_id in batch.failed_ids
        }
    )
    if len(failed_ids) > MAX_QUEUED_FAILURE_IDS:
        raise RuntimeError(
            f"La file d'échecs contient {len(failed_ids)} séries, au-delà de la "
            f"limite de {MAX_QUEUED_FAILURE_IDS}; le watermark reste inchangé"
        )

    try:
        result = cue_api.post_user_statuses_recalculate()
    except Exception:
        if _retry_number(context) < API_RETRY_POLICY.max_retries:
            raise

        context.instance.add_run_tags(
            context.run_id,
            {
                FAILED_SERIES_IDS_TAG: json.dumps(
                    failed_ids,
                    separators=(",", ":"),
                ),
                STATUS_RECALC_FAILED_TAG: "true",
            },
        )
        context.log.exception(
            "Le recalcul global des statuts reste en échec après les retries ; "
            "il sera retenté au prochain run",
        )
        return

    context.instance.add_run_tags(
        context.run_id,
        {
            FAILED_SERIES_IDS_TAG: json.dumps(failed_ids, separators=(",", ":")),
            STATUS_RECALC_FAILED_TAG: "false",
        },
    )
    context.log.info(
        "Statuts utilisateur à jour après %s import(s) : "
        "%s série(s) passée(s) à DROPPED",
        synced_count,
        result.updated_count,
    )
    if failed_ids:
        context.log.warning(
            "%s série(s) seront retentées au prochain run",
            len(failed_ids),
        )


sync_executor = dg.multiprocess_executor.configured(
    {"max_concurrent": MAX_PARALLEL_IMPORTS},
    name="sync_series_executor",
)


@dg.job(
    executor_def=sync_executor,
    run_tags={SYNC_RUN_TAG: "true"},
)
def sync_all_series_job():
    synced_batches = discover_series().map(sync_series_batch)
    update_user_statuses(synced_batches.collect())


def _scheduled_run_request(
    context: dg.ScheduleEvaluationContext,
    *,
    full_reconciliation: bool,
) -> dg.RunRequest:
    scheduled_execution_time = context.scheduled_execution_time
    if scheduled_execution_time is None:
        raise ValueError("A scheduled execution time is required")

    scheduled_execution_time = _require_aware(
        scheduled_execution_time,
        "scheduled_execution_time",
    )
    mode = FULL_RECONCILIATION_MODE if full_reconciliation else INCREMENTAL_MODE
    scheduled_value = scheduled_execution_time.isoformat()

    return dg.RunRequest(
        run_key=f"sync-series:{mode}:{scheduled_value}",
        run_config=dg.RunConfig(
            ops={
                "discover_series": SyncSeriesConfig(
                    scheduled_execution_time=scheduled_value,
                    full_reconciliation=full_reconciliation,
                )
            }
        ),
        tags={
            SYNC_RUN_TAG: "true",
            SYNC_MODE_TAG: mode,
            SCHEDULED_EXECUTION_TIME_TAG: scheduled_value,
        },
    )


@dg.schedule(
    job=sync_all_series_job,
    cron_schedule="0 3 * * *",
    execution_timezone="Europe/Paris",
    default_status=dg.DefaultScheduleStatus.RUNNING,
)
def sync_series_schedule(context: dg.ScheduleEvaluationContext) -> dg.RunRequest:
    return _scheduled_run_request(context, full_reconciliation=False)


@dg.schedule(
    job=sync_all_series_job,
    cron_schedule="0 4 * * 0",
    execution_timezone="Europe/Paris",
    default_status=dg.DefaultScheduleStatus.RUNNING,
)
def reconcile_all_series_schedule(
    context: dg.ScheduleEvaluationContext,
) -> dg.RunRequest:
    return _scheduled_run_request(context, full_reconciliation=True)
