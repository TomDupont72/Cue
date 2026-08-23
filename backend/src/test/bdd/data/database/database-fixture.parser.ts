import { readFileSync } from "node:fs";
import { AstBuilder, GherkinClassicTokenMatcher, Parser } from "@cucumber/gherkin";
import { IdGenerator, type Scenario } from "@cucumber/messages";
import type { DatabaseState } from "@/test/bdd/doubles/prisma.double.js";
import {
  type DatabaseFixtureCollection,
  type DatabaseFixtureRecordByCollection,
  type DatabaseFixtureReferences,
  parseDatabaseFixtureRow
} from "./database-fixture.schemas.js";

const FIXTURE_DEFINITIONS = [
  ["series", "series.fixture.feature"],
  ["seasons", "seasons.fixture.feature"],
  ["episodes", "episodes.fixture.feature"],
  ["userSeries", "userSeries.fixture.feature"],
  ["userEpisodes", "userEpisodes.fixture.feature"]
] as const satisfies readonly (readonly [DatabaseFixtureCollection, string])[];

type LoadedDatabaseFixtures = {
  state: DatabaseState;
  references: DatabaseFixtureReferences;
};

function createEmptyReferences(): DatabaseFixtureReferences {
  return {
    series: new Map(),
    seasons: new Map(),
    episodes: new Map(),
    userSeries: new Map(),
    userEpisodes: new Map()
  };
}

function parseFeature(source: string) {
  const parser = new Parser(
    new AstBuilder(IdGenerator.incrementing()),
    new GherkinClassicTokenMatcher()
  );

  return parser.parse(source);
}

function getScenarioRows(filename: string, fixtureName: string): Record<string, string>[] {
  const source = readFileSync(new URL(filename, import.meta.url), "utf8");
  const document = parseFeature(source);
  const feature = document.feature;

  if (!feature) {
    throw new Error(`Database fixture ${filename} does not contain a Feature`);
  }

  const scenarios = feature.children.flatMap((child) => {
    if (child.scenario) {
      return [child.scenario];
    }

    return child.rule?.children.flatMap((ruleChild) => ruleChild.scenario ?? []) ?? [];
  });
  const matchingScenarios = scenarios.filter((scenario) => scenario.name === fixtureName);

  if (matchingScenarios.length !== 1) {
    throw new Error(
      `Database fixture ${filename} must contain exactly one Scenario named "${fixtureName}"`
    );
  }

  return getTableRows(filename, matchingScenarios[0]);
}

function getTableRows(filename: string, scenario: Scenario): Record<string, string>[] {
  if (scenario.steps.length !== 1 || !scenario.steps[0].dataTable) {
    throw new Error(
      `Scenario "${scenario.name}" in ${filename} must contain exactly one step with a table`
    );
  }

  const [headerRow, ...bodyRows] = scenario.steps[0].dataTable.rows;

  if (!headerRow) {
    throw new Error(`Scenario "${scenario.name}" in ${filename} has an empty table`);
  }

  const headers = headerRow.cells.map((cell) => cell.value);

  if (new Set(headers).size !== headers.length) {
    throw new Error(`Scenario "${scenario.name}" in ${filename} has duplicate columns`);
  }

  return bodyRows.map((row) =>
    Object.fromEntries(row.cells.map((cell, index) => [headers[index], cell.value]))
  );
}

function addFixtureRecord(
  collection: DatabaseFixtureCollection,
  key: string,
  record: DatabaseFixtureRecordByCollection[DatabaseFixtureCollection],
  loadedFixtures: LoadedDatabaseFixtures
) {
  const collectionReferences = loadedFixtures.references[collection] as Map<string, typeof record>;

  if (collectionReferences.has(key)) {
    throw new Error(`Duplicate database fixture reference @${collection}.${key}`);
  }

  collectionReferences.set(key, record);

  switch (collection) {
    case "series":
      loadedFixtures.state.series.push(record as DatabaseFixtureRecordByCollection["series"]);
      break;
    case "seasons":
      loadedFixtures.state.seasons.push(record as DatabaseFixtureRecordByCollection["seasons"]);
      break;
    case "episodes":
      loadedFixtures.state.episodes.push(record as DatabaseFixtureRecordByCollection["episodes"]);
      break;
    case "userSeries":
      loadedFixtures.state.userSeries.push(
        record as DatabaseFixtureRecordByCollection["userSeries"]
      );
      break;
    case "userEpisodes":
      loadedFixtures.state.userEpisodes.push(
        record as DatabaseFixtureRecordByCollection["userEpisodes"]
      );
      break;
  }
}

export function loadDatabaseFixtures(fixtureName: string): LoadedDatabaseFixtures {
  const loadedFixtures: LoadedDatabaseFixtures = {
    state: {
      series: [],
      seasons: [],
      episodes: [],
      userSeries: [],
      userEpisodes: []
    },
    references: createEmptyReferences()
  };

  for (const [collection, filename] of FIXTURE_DEFINITIONS) {
    const rows = getScenarioRows(filename, fixtureName);

    for (const [index, row] of rows.entries()) {
      try {
        const { key, record } = parseDatabaseFixtureRow(collection, row, loadedFixtures.references);

        addFixtureRecord(collection, key, record, loadedFixtures);
      } catch (error) {
        throw new Error(`Invalid ${collection} fixture in ${filename}, row ${index + 2}`, {
          cause: error
        });
      }
    }
  }

  return loadedFixtures;
}
