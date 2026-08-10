import dagster as dg

from orchestrator.jobs.sync_series import (
    reconcile_all_series_schedule,
    sync_all_series_job,
    sync_series_schedule,
)
from orchestrator.resources.cue_api import CueApiResource
from orchestrator.resources.database import DatabaseResource


@dg.definitions
def defs():
    return dg.Definitions(
        jobs=[sync_all_series_job],
        schedules=[sync_series_schedule, reconcile_all_series_schedule],
        resources={
            "cue_api": CueApiResource(
                base_url=dg.EnvVar("API_URL"),
                worker_token=dg.EnvVar("WORKER_TOKEN"),
            ),
            "database": DatabaseResource(
                database_url=dg.EnvVar("DATABASE_URL"),
            ),
        },
    )
