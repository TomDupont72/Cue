import { dropKeys } from "../../shared/utils/object/object.js";
function toDate(value) {
    return value ? new Date(value) : null;
}
export function mapTmdbPeople(people) {
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
export function mapTmdbSeries(series) {
    return {
        ...dropKeys(series, ["createdBy", "genres", "networks", "seasons"]),
        firstAirDate: toDate(series.firstAirDate),
        lastAirDate: toDate(series.lastAirDate)
    };
}
export function mapTmdbSeason(season) {
    return {
        ...dropKeys(season, ["episodes"]),
        airDate: toDate(season.airDate)
    };
}
export function mapTmdbEpisode(episode) {
    return {
        ...dropKeys(episode, ["crew", "guestStars"]),
        airDate: toDate(episode.airDate),
        runtime: episode.runtime ?? 0
    };
}
