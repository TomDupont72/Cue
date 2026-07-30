import dagster as dg

from orchestrator.jobs.sync_series import sync_all_series_job
from orchestrator.resources.cue_api import CueApiResource
from orchestrator.resources.database import DatabaseResource


@dg.definitions
def defs():
    return dg.Definitions(
        jobs=[sync_all_series_job],
        resources={
            "cue_api": CueApiResource(
                base_url=dg.EnvVar("CUE_API_URL"),
                worker_token=dg.EnvVar("CUE_WORKER_TOKEN"),
            ),
            "database": DatabaseResource(
                database_url=dg.EnvVar("DATABASE_URL"),
            ),
        },
    )