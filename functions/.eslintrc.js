module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    // "plugin:import/errors",
    // "plugin:import/warnings",
    // "plugin:import/typescript",
    // "google",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["./tsconfig.json", "./tsconfig.test.json", "./tsconfig.dev.json"],
    sourceType: "module",
  },
  plugins: ["@typescript-eslint", "unused-imports", "import"],
  rules: {
    "@typescript-eslint/no-var-requires": "warn",
    "unused-imports/no-unused-imports": "error",
  },
};
