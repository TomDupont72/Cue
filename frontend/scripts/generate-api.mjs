import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createClient } from "@hey-api/openapi-ts";

const frontendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contractPath = path.resolve(frontendRoot, "../contracts/openapi.json");
const generatedPath = path.resolve(frontendRoot, "src/api/generated");

function getConfig(outputPath) {
  return {
    input: contractPath,
    output: {
      clean: true,
      fileName: {
        name: (name) => (name === "index" ? "cue-api" : name),
        suffix: null
      },
      path: outputPath,
      tsConfigPath: path.resolve(frontendRoot, "tsconfig.app.json")
    },
    plugins: [
      {
        enums: false,
        name: "@hey-api/typescript"
      },
      {
        baseUrl: false,
        bundle: true,
        name: "@hey-api/client-fetch"
      },
      {
        auth: false,
        client: "@hey-api/client-fetch",
        name: "@hey-api/sdk",
        paramsStructure: "grouped"
      }
    ]
  };
}

async function getFiles(root, current = root) {
  const entries = await readdir(current, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(current, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await getFiles(root, absolutePath)));
    } else if (entry.isFile()) {
      files.push(path.relative(root, absolutePath));
    }
  }

  return files.sort();
}

async function compareGeneratedFiles(expectedPath, actualPath) {
  let expectedFiles;

  try {
    expectedFiles = await getFiles(expectedPath);
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      throw new Error("Le client API n'a pas encore été généré.");
    }

    throw error;
  }

  const actualFiles = await getFiles(actualPath);
  const expectedFileSet = new Set(expectedFiles);
  const actualFileSet = new Set(actualFiles);
  const added = actualFiles.filter((file) => !expectedFileSet.has(file));
  const removed = expectedFiles.filter((file) => !actualFileSet.has(file));
  const changed = [];

  for (const file of expectedFiles) {
    if (!actualFileSet.has(file)) {
      continue;
    }

    const [expected, actual] = await Promise.all([
      readFile(path.join(expectedPath, file)),
      readFile(path.join(actualPath, file))
    ]);

    if (!expected.equals(actual)) {
      changed.push(file);
    }
  }

  if (added.length > 0 || removed.length > 0 || changed.length > 0) {
    const details = [
      ...added.map((file) => `ajouté: ${file}`),
      ...removed.map((file) => `supprimé: ${file}`),
      ...changed.map((file) => `modifié: ${file}`)
    ];

    throw new Error(`Le client API généré n'est pas à jour:\n${details.join("\n")}`);
  }
}

async function generate() {
  const args = process.argv.slice(2);
  const check = args.length === 1 && args[0] === "--check";

  if (args.length > 0 && !check) {
    throw new Error("Usage : node scripts/generate-api.mjs [--check]");
  }

  process.chdir(frontendRoot);

  if (!check) {
    await createClient(getConfig(generatedPath));
    return;
  }

  const temporaryRoot = await mkdtemp(path.join(tmpdir(), "cue-api-check-"));
  const temporaryOutput = path.join(temporaryRoot, "generated");

  try {
    await createClient(getConfig(temporaryOutput));
    await compareGeneratedFiles(generatedPath, temporaryOutput);
  } finally {
    await rm(temporaryRoot, { force: true, recursive: true });
  }
}

await generate();
