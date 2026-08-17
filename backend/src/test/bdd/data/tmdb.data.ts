import type { z } from "zod";
import {
  tmdbSeasonDetailsSchema,
  tmdbTvChangesSchema,
  tmdbTvDetailsSchema,
  tmdbTvSearchSchema
} from "@/external/tmdb/tmdb.schemas.js";
import type { TmdbDouble } from "@/test/bdd/doubles/tmdb.double.js";
import { TEST_TMDB_IDS } from "./database.data.js";

const searchResponse = {
  page: 1,
  results: [
    {
      id: TEST_TMDB_IDS.onePiece,
      name: "One Piece",
      original_name: "One Piece",
      overview: "Des pirates.",
      poster_path: "/op.jpg",
      backdrop_path: "/op-bg.jpg",
      first_air_date: "2000-01-01",
      original_language: "ja",
      vote_average: 8
    },
    {
      id: TEST_TMDB_IDS.naruto,
      name: "Naruto",
      original_name: "Naruto",
      overview: "Des ninjas.",
      poster_path: "/naruto.jpg",
      backdrop_path: "/naruto-bg.jpg",
      first_air_date: "2001-01-01",
      original_language: "ja",
      vote_average: 7
    }
  ],
  total_pages: 1,
  total_results: 2
} satisfies z.input<typeof tmdbTvSearchSchema>;

const changesResponse = {
  results: [{ id: TEST_TMDB_IDS.onePiece }, { id: TEST_TMDB_IDS.naruto }],
  page: 1,
  total_pages: 1,
  total_results: 2
} satisfies z.input<typeof tmdbTvChangesSchema>;

const onePieceDetails = {
  adult: false,
  backdrop_path: "/op-bg.jpg",
  created_by: [
    {
      gender: 2,
      id: 1,
      name: "Auteur OP",
      profile_path: null
    }
  ],
  first_air_date: "2000-01-01",
  genres: [
    {
      id: 1,
      name: "Aventure"
    }
  ],
  id: TEST_TMDB_IDS.onePiece,
  in_production: true,
  last_air_date: "2000-01-02",
  name: "One Piece",
  seasons: [
    {
      id: 11,
      season_number: 1
    }
  ],
  networks: [
    {
      id: 1,
      logo_path: "/chaine.jpg",
      name: "Chaîne"
    }
  ],
  number_of_episodes: 2,
  number_of_seasons: 1,
  original_language: "ja",
  original_name: "One Piece",
  overview: "Des pirates.",
  popularity: 10,
  poster_path: "/op.jpg"
} satisfies z.input<typeof tmdbTvDetailsSchema>;

const onePieceSeason = {
  air_date: "2000-01-01",
  episodes: [
    {
      air_date: "2000-01-01",
      crew: [],
      episode_number: 1,
      guest_stars: [],
      name: "Départ",
      overview: "Le départ.",
      id: 111,
      still_path: "/op-e1.jpg",
      runtime: 20,
      season_number: 1,
      vote_average: 8
    },
    {
      air_date: "2000-01-02",
      crew: [],
      episode_number: 2,
      guest_stars: [],
      name: "Rencontre",
      overview: "Une rencontre.",
      id: 112,
      still_path: "/op-e2.jpg",
      runtime: 20,
      season_number: 1,
      vote_average: 8
    }
  ],
  name: "Saison 1",
  overview: "Première saison.",
  id: 11,
  poster_path: "/op-s1.jpg",
  season_number: 1,
  vote_average: 8
} satisfies z.input<typeof tmdbSeasonDetailsSchema>;

const narutoDetails = {
  adult: false,
  backdrop_path: "/naruto-bg.jpg",
  created_by: [
    {
      gender: 2,
      id: 2,
      name: "Auteur Naruto",
      profile_path: null
    }
  ],
  first_air_date: "2001-01-01",
  genres: [
    {
      id: 1,
      name: "Aventure"
    }
  ],
  id: TEST_TMDB_IDS.naruto,
  in_production: false,
  last_air_date: "2001-01-02",
  name: "Naruto",
  seasons: [
    {
      id: 21,
      season_number: 1
    }
  ],
  networks: [
    {
      id: 1,
      logo_path: "/chaine.jpg",
      name: "Chaîne"
    }
  ],
  number_of_episodes: 2,
  number_of_seasons: 1,
  original_language: "ja",
  original_name: "Naruto",
  overview: "Des ninjas.",
  popularity: 9,
  poster_path: "/naruto.jpg"
} satisfies z.input<typeof tmdbTvDetailsSchema>;

const narutoSeason = {
  air_date: "2001-01-01",
  episodes: [
    {
      air_date: "2001-01-01",
      crew: [],
      episode_number: 1,
      guest_stars: [],
      name: "Début",
      overview: "Le début.",
      id: 211,
      still_path: "/naruto-e1.jpg",
      runtime: 20,
      season_number: 1,
      vote_average: 7
    },
    {
      air_date: "2001-01-02",
      crew: [],
      episode_number: 2,
      guest_stars: [],
      name: "Mission",
      overview: "Une mission.",
      id: 212,
      still_path: "/naruto-e2.jpg",
      runtime: 20,
      season_number: 1,
      vote_average: 7
    }
  ],
  name: "Saison 1",
  overview: "Première saison.",
  id: 21,
  poster_path: "/naruto-s1.jpg",
  season_number: 1,
  vote_average: 7
} satisfies z.input<typeof tmdbSeasonDetailsSchema>;

export function loadDefaultTmdbData(tmdb: TmdbDouble) {
  tmdb.respond("/3/search/tv", searchResponse);
  tmdb.respond("/3/tv/changes", changesResponse);

  tmdb.respond(`/3/tv/${TEST_TMDB_IDS.onePiece}`, onePieceDetails);
  tmdb.respond(`/3/tv/${TEST_TMDB_IDS.onePiece}/season/1`, onePieceSeason);

  tmdb.respond(`/3/tv/${TEST_TMDB_IDS.naruto}`, narutoDetails);
  tmdb.respond(`/3/tv/${TEST_TMDB_IDS.naruto}/season/1`, narutoSeason);
}
