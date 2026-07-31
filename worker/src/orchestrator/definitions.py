import dagster as dg

from orchestrator.jobs.sync_series import sync_all_series_job
from orchestrator.resources.cue_api import CueApiResource
from orchestrator.resources.database import DatabaseResource

sync_series_schedule = dg.ScheduleDefinition(
    job=sync_all_series_job,
    cron_schedule="0 3 * * *",
    execution_timezone="Europe/Paris",
    default_status=dg.DefaultScheduleStatus.RUNNING,
)

@dg.definitions
def defs():
    return dg.Definitions(
        jobs=[sync_all_series_job],
        schedules=[sync_series_schedule],
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