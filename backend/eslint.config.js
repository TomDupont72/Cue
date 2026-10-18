import js from "@eslint/js";
import globals from "globals";
import perfectionist from "eslint-plugin-perfectionist";
import path from "eslint-plugin-path";
import unusedImports from "eslint-plugin-unused-imports";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist", "node_modules"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    languageOptions: {
      globals: globals.node
    },
    plugins: {
      perfectionist,
      path,
      "unused-imports": unusedImports
    },
    settings: {
      path: {
        config: "tsconfig.json"
      }
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          ignoreRestSiblings: true
        }
      ],

      "unused-imports/no-unused-imports": "error",

      "perfectionist/sort-imports": [
        "error",
        {
          type: "natural",
          order: "asc",
          newlinesBetween: 1,
          internalPattern: ["^@/"],
          tsconfig: {
            rootDir: ""
          }
        }
      ],

      "path/only-absolute-imports": "error"
    }
  }
]);
