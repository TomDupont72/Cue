function databaseNameFromPostgresUrl(databaseUrl: string) {
  let url: URL;

  try {
    url = new URL(databaseUrl);
  } catch {
    return null;
  }

  if (url.protocol !== "postgres:" && url.protocol !== "postgresql:") {
    return null;
  }

  const databaseName = decodeURIComponent(url.pathname.replace(/^\/+/, ""));

  return databaseName || null;
}

function hasTestSegment(databaseName: string) {
  return databaseName
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .includes("test");
}

export function assertSafeTestDatabase(environment: NodeJS.ProcessEnv) {
  if (environment.NODE_ENV !== "test") {
    throw new Error('BDD database writes require NODE_ENV="test"');
  }

  if (environment.INTEGRATION_TEST_DATABASE !== "true") {
    throw new Error('BDD database writes require INTEGRATION_TEST_DATABASE="true"');
  }

  if (environment.BDD_EPHEMERAL_DATABASE === "true") {
    return;
  }

  const databaseUrl = environment.DATABASE_URL;
  const databaseName = databaseUrl ? databaseNameFromPostgresUrl(databaseUrl) : null;

  if (!databaseName || !hasTestSegment(databaseName)) {
    throw new Error(
      'BDD database writes require BDD_EPHEMERAL_DATABASE="true" or a PostgreSQL database name containing a "test" segment'
    );
  }
}
