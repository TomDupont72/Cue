export default {
  paths: ["src/modules/**/__tests__/*.test.feature", "src/shared/**/__tests__/*.test.feature"],

  import: [
    "./tsx-register.js",

    "src/test/bdd/support/world.ts",
    "src/test/bdd/support/hooks.ts",
    "src/test/bdd/steps/**/*.ts"
  ],

  format: ["progress"],
  strict: true,
  parallel: 0
};
