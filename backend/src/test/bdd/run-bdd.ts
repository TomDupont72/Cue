import "dotenv/config";
import { spawn } from "node:child_process";
import { createServer, type Server as NetServer } from "node:net";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

import { startPrismaDevServer, type Server as PrismaDevServer } from "@prisma/dev";
import { assertSafeTestDatabase } from "@/test/bdd/support/test-database-safety.js";

const require = createRequire(import.meta.url);
const prismaCli = require.resolve("prisma/build/index.js");
const cucumberCli = join(dirname(require.resolve("@cucumber/cucumber/package.json")), "bin/cucumber.js");

async function listenOnFreePort(server: NetServer): Promise<number> {
  await new Promise<void>((resolve, reject) => {
    const onError = (error: Error) => reject(error);

    server.once("error", onError);
    server.listen(0, "127.0.0.1", () => {
      server.off("error", onError);
      resolve();
    });
  });

  const address = server.address();

  if (address === null || typeof address === "string") {
    throw new Error("Unable to allocate a free TCP port");
  }

  return address.port;
}

async function closeNetServer(server: NetServer): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    server.close(error => (error ? reject(error) : resolve()));
  });
}

async function getFreePorts(count: number): Promise<number[]> {
  const reservations: NetServer[] = [];

  try {
    const ports: number[] = [];

    for (let index = 0; index < count; index += 1) {
      const reservation = createServer();
      reservations.push(reservation);
      ports.push(await listenOnFreePort(reservation));
    }

    return ports;
  } finally {
    await Promise.all(reservations.filter(server => server.listening).map(closeNetServer));
  }
}

function isAddressInUse(error: unknown): boolean {
  if (error instanceof AggregateError) {
    return error.errors.some(isAddressInUse);
  }

  return error instanceof Error && "code" in error && error.code === "EADDRINUSE";
}

async function startEphemeralDatabase(): Promise<PrismaDevServer> {
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const [port, databasePort, shadowDatabasePort] = await getFreePorts(3);

    try {
      return await startPrismaDevServer({
        name: `bdd-${process.pid}-${Date.now()}-${attempt}`,
        persistenceMode: "stateless",
        port,
        databasePort,
        shadowDatabasePort
      });
    } catch (error) {
      if (!isAddressInUse(error) || attempt === maxAttempts) {
        throw error;
      }
    }
  }

  throw new Error("Unable to start the ephemeral test database");
}

async function run(command: string, args: string[], env: NodeJS.ProcessEnv): Promise<number> {
  return await new Promise<number>((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: process.cwd(),
      env,
      shell: false,
      stdio: "inherit"
    });

    child.once("error", reject);
    child.once("exit", code => resolve(code ?? 1));
  });
}

async function runBdd(): Promise<number> {
  let server: PrismaDevServer | undefined;

  try {
    const env: NodeJS.ProcessEnv = {
      ...process.env,
      NODE_ENV: "test",
      INTEGRATION_TEST_DATABASE: "true"
    };

    delete env.BDD_EPHEMERAL_DATABASE;

    if (process.env.INTEGRATION_TEST_DATABASE !== "true") {
      server = await startEphemeralDatabase();

      env.BDD_EPHEMERAL_DATABASE = "true";
      env.DATABASE_URL = server.database.connectionString;
    }

    assertSafeTestDatabase(env);

    const migrationExitCode = await run(process.execPath, [prismaCli, "migrate", "deploy"], env);

    if (migrationExitCode !== 0) {
      return migrationExitCode;
    }

    return await run(
      process.execPath,
      [cucumberCli, "--config", "cucumber.mjs", ...process.argv.slice(2)],
      env
    );
  } finally {
    await server?.close();
  }
}

try {
  process.exitCode = await runBdd();
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
