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
  // parserOptions: {
  //   project: ["./tsconfig.json"],
  //   sourceType: "module",
  //   tsconfigRootDir: __dirname,
  // },
  plugins: ["@typescript-eslint", "unused-imports", "import"],
  rules: {
    "@typescript-eslint/no-var-requires": "warn",
    "unused-imports/no-unused-imports": "error",
    "@typescript-eslint/explicit-module-boundary-types": "off",
  },
};
