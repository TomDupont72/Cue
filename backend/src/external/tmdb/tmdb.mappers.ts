import type { TmdbSeasonDetailsResponse, TmdbTvDetailsResponse } from "./tmdb.types.js";
import { dropKeys } from "@/shared/utils/object.js";

type TmdbEpisode = TmdbSeasonDetailsResponse["episodes"][number];
type TmdbPeople = TmdbTvDetailsResponse["createdBy"][number];

function toDate(value: string | null) {
  return value ? new Date(value) : null;
}

export function mapTmdbPeople(people: TmdbPeople) {
  return {
    adult: people.adult,
    gender: people.gender,
    tmdbId: people.tmdbId,
    knownForDepartment: people.knownForDepartment,
    name: people.name,
    popularity: people.popularity,
    profilePath: people.profilePath
  };
}

export function mapTmdbSeries(series: TmdbTvDetailsResponse) {
  return {
    ...dropKeys(series, ["createdBy", "genres", "networks", "seasons"] as const),
    firstAirDate: toDate(series.firstAirDate),
    lastAirDate: toDate(series.lastAirDate)
  };
}

export function mapTmdbSeason(season: TmdbSeasonDetailsResponse) {
  return {
    ...dropKeys(season, ["episodes"] as const),
    airDate: toDate(season.airDate)
  };
}

export function mapTmdbEpisode(episode: TmdbEpisode) {
  return {
    ...dropKeys(episode, ["crew", "guestStars"] as const),
    airDate: toDate(episode.airDate),
    runtime: episode.runtime ?? 0
  };
}
