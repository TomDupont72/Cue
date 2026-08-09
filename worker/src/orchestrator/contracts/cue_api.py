from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel


class CueApiModel(BaseModel):
    """Base model matching the camelCase JSON exposed by the Cue API."""

    model_config = ConfigDict(
        alias_generator=to_camel,
        extra="forbid",
        strict=True,
    )


class UserSeriesStatus(str, Enum):
    PLANNED = "PLANNED"
    WATCHING = "WATCHING"
    COMPLETED = "COMPLETED"
    DROPPED = "DROPPED"
    PAUSED = "PAUSED"


class SeriesResponse(CueApiModel):
    id: int
    adult: bool
    backdrop_path: str | None
    first_air_date: datetime | None
    tmdb_id: int
    in_production: bool
    last_air_date: datetime | None
    name: str
    number_of_episodes: int
    number_of_seasons: int
    original_language: str
    original_name: str
    overview: str | None
    popularity: float
    poster_path: str | None
    created_at: datetime
    updated_at: datetime


class UserSeriesResponse(CueApiModel):
    user_id: str
    series_id: int
    status: UserSeriesStatus
    is_favorite: bool
    watch_count: int
    added_at: datetime
    last_watched_at: datetime | None


class SeriesImportResponse(CueApiModel):
    series: SeriesResponse
    user_series: UserSeriesResponse | None


class SeriesChangeResponse(CueApiModel):
    tmdb_id: int


class SeriesChangesResponse(CueApiModel):
    results: list[SeriesChangeResponse]
    page: int
    total_pages: int
    total_results: int


class UserStatusRecalculateResponse(CueApiModel):
    updated_count: int = Field(ge=0)
