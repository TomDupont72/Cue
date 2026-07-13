import type { TestContext } from "node:test";

export const onePieceTmdbSearchResponse = {
  page: 1,
  results: [
    {
      id: 37854,
      name: "One Piece",
      original_name: "ワンピース",
      overview: "Monkey D. Luffy prend la mer avec son équipage.",
      poster_path: "/one-piece-anime.jpg",
      backdrop_path: "/one-piece-anime-backdrop.jpg",
      first_air_date: "1999-10-20",
      original_language: "ja",
      vote_average: 8.7
    },
    {
      id: 111110,
      name: "ONE PIECE",
      original_name: "ONE PIECE",
      overview: "Une adaptation en prises de vues réelles du manga.",
      poster_path: "/one-piece-live-action.jpg",
      backdrop_path: "/one-piece-live-action-backdrop.jpg",
      first_air_date: "2023-08-31",
      original_language: "en",
      vote_average: 8.2
    }
  ],
  total_pages: 1,
  total_results: 2
};

const creator = {
  adult: false,
  gender: 2,
  id: 123,
  known_for_department: "Writing",
  name: "Eiichiro Oda",
  popularity: 10,
  profile_path: "/oda.jpg"
};

const crewMember = {
  adult: false,
  gender: 2,
  id: 125,
  known_for_department: "Directing",
  name: "Konosuke Uda",
  popularity: 8,
  profile_path: "/uda.jpg"
};

const luffyGuestStar = {
  adult: false,
  character: "Monkey D. Luffy",
  gender: 1,
  id: 124,
  known_for_department: "Acting",
  name: "Mayumi Tanaka",
  popularity: 12,
  profile_path: "/tanaka.jpg"
};

export const onePieceTmdbDetailsResponse = {
  adult: false,
  backdrop_path: "/one-piece-backdrop.jpg",
  created_by: [creator],
  first_air_date: "1999-10-20",
  genres: [
    { id: 16, name: "Animation" },
    { id: 10759, name: "Action & Adventure" }
  ],
  id: 37854,
  in_production: true,
  last_air_date: "2026-01-01",
  name: "One Piece",
  seasons: [
    { id: 10001, season_number: 1 },
    { id: 10002, season_number: 2 }
  ],
  networks: [{ id: 1, logo_path: "/fuji-tv.jpg", name: "Fuji TV" }],
  number_of_episodes: 4,
  number_of_seasons: 2,
  original_language: "ja",
  original_name: "ワンピース",
  overview: "Monkey D. Luffy parcourt Grand Line à la recherche du One Piece.",
  popularity: 150,
  poster_path: "/one-piece-poster.jpg"
};

function episode(
  id: number,
  seasonNumber: number,
  episodeNumber: number,
  name: string,
  airDate: string
) {
  return {
    air_date: airDate,
    crew: [crewMember],
    episode_number: episodeNumber,
    guest_stars: [luffyGuestStar],
    name,
    overview: `Résumé de ${name}`,
    id,
    still_path: `/episode-${id}.jpg`,
    runtime: 24,
    season_number: seasonNumber,
    vote_average: 8.5
  };
}

export const onePieceTmdbSeasonResponses = {
  1: {
    air_date: "1999-10-20",
    episodes: [
      episode(20001, 1, 1, "Je suis Luffy !", "1999-10-20"),
      episode(20002, 1, 2, "Le grand épéiste apparaît", "1999-11-17")
    ],
    name: "East Blue",
    overview: "Le début du voyage de Luffy.",
    id: 10001,
    poster_path: "/east-blue.jpg",
    season_number: 1,
    vote_average: 8.5
  },
  2: {
    air_date: "2001-03-21",
    episodes: [
      episode(20003, 2, 1, "En route pour Alabasta", "2001-03-21"),
      episode(20004, 2, 2, "Le combat pour le royaume", "2001-04-15")
    ],
    name: "Alabasta",
    overview: "L’équipage aide Vivi à sauver son royaume.",
    id: 10002,
    poster_path: "/alabasta.jpg",
    season_number: 2,
    vote_average: 8.7
  }
};

export function mockTmdbFetch(t: TestContext) {
  return t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    const url = new URL(String(input));
    let responseBody: unknown;

    if (url.pathname === "/3/search/tv") {
      responseBody = onePieceTmdbSearchResponse;
    } else if (url.pathname === "/3/tv/37854") {
      responseBody = onePieceTmdbDetailsResponse;
    } else if (url.pathname === "/3/tv/37854/season/1") {
      responseBody = onePieceTmdbSeasonResponses[1];
    } else if (url.pathname === "/3/tv/37854/season/2") {
      responseBody = onePieceTmdbSeasonResponses[2];
    } else {
      return new Response(null, { status: 404 });
    }

    return new Response(JSON.stringify(responseBody), {
      status: 200,
      headers: { "content-type": "application/json" }
    });
  });
}
