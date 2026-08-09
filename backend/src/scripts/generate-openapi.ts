import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const contractUrl = new URL("../../../contracts/openapi.json", import.meta.url);
const httpMethods = new Set(["delete", "get", "head", "options", "patch", "post", "put"]);
const errorResponseReference = "#/components/schemas/ErrorResponse";

const generationEnvironment = {
  NODE_ENV: "test",
  HOST: "localhost",
  DATABASE_URL: "postgresql://cue:cue@localhost:5432/cue_openapi",
  BETTER_AUTH_SECRET: "openapi-generation-secret-at-least-32-characters",
  BETTER_AUTH_URL: "http://localhost:8000",
  CLIENT_ORIGIN: "http://localhost:5173",
  WORKER_TOKEN: "openapi-worker-token-at-least-32-characters",
  TMDB_API_TOKEN: "openapi-tmdb-token-at-least-32-characters",
  TMDB_API_KEY: "openapi-tmdb-key-placeholder"
} satisfies NodeJS.ProcessEnv;

for (const [name, value] of Object.entries(generationEnvironment)) {
  process.env[name] ??= value;
}

function sortObjectKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortObjectKeys);
  }

  if (value === null || typeof value !== "object") {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value)
      .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
      .map(([key, child]) => [key, sortObjectKeys(child)])
  );
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === "object"
    ? (value as Record<string, unknown>)
    : undefined;
}

function validateOpenApiContract(document: unknown): void {
  const paths = asRecord(asRecord(document)?.paths);

  if (!paths) {
    throw new TypeError("The generated OpenAPI contract has no paths");
  }

  const operationIds = new Set<string>();

  for (const [path, pathItemValue] of Object.entries(paths)) {
    const pathItem = asRecord(pathItemValue);

    if (!pathItem) {
      continue;
    }

    for (const [method, operationValue] of Object.entries(pathItem)) {
      if (!httpMethods.has(method)) {
        continue;
      }

      const operation = asRecord(operationValue);

      if (!operation) {
        throw new TypeError(`${method.toUpperCase()} ${path} is not an OpenAPI operation`);
      }

      const operationId = operation.operationId;

      if (typeof operationId !== "string" || operationId.length === 0) {
        throw new TypeError(`${method.toUpperCase()} ${path} has no operationId`);
      }

      if (operationIds.has(operationId)) {
        throw new TypeError(`The operationId ${operationId} is duplicated`);
      }

      operationIds.add(operationId);

      if (
        path.startsWith("/api/") &&
        (!Array.isArray(operation.security) || operation.security.length === 0)
      ) {
        throw new TypeError(`${method.toUpperCase()} ${path} has no security declaration`);
      }

      const defaultResponse = asRecord(asRecord(operation.responses)?.default);
      const content = asRecord(defaultResponse?.content);
      const jsonContent = asRecord(content?.["application/json"]);
      const schema = asRecord(jsonContent?.schema);

      if (schema?.$ref !== errorResponseReference) {
        throw new TypeError(
          `${method.toUpperCase()} ${path} does not expose the shared error contract`
        );
      }
    }
  }
}

async function generateOpenApi(): Promise<string> {
  const { buildApp } = await import("@/app.js");
  const app = await buildApp({ docs: false, openapi: true });

  try {
    await app.ready();

    const document = app.swagger();
    validateOpenApiContract(document);

    return `${JSON.stringify(sortObjectKeys(document), null, 2)}\n`;
  } finally {
    await app.close();
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const check = args.length === 1 && args[0] === "--check";

  if (args.length > 0 && !check) {
    throw new Error("Usage: tsx src/scripts/generate-openapi.ts [--check]");
  }

  const generated = await generateOpenApi();

  if (check) {
    let committed: string;

    try {
      committed = await readFile(contractUrl, "utf8");
    } catch (error) {
      if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
        throw new Error("contracts/openapi.json is missing. Run npm run openapi:generate.", {
          cause: error
        });
      }

      throw error;
    }

    if (committed !== generated) {
      throw new Error("contracts/openapi.json is stale. Run npm run openapi:generate.");
    }

    return;
  }

  const contractPath = fileURLToPath(contractUrl);
  await mkdir(dirname(contractPath), { recursive: true });
  await writeFile(contractPath, generated, "utf8");
}

await main();
