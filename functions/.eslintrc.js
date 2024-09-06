module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "google",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["tsconfig.json", "tsconfig.dev.json"],
    sourceType: "module",
  },
  ignorePatterns: [
    "/lib/**/*", // Ignore built files.
  ],
  plugins: ["@typescript-eslint", "import"],
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
    "jsdoc/require-jsdoc": "off",
    "valid-jsdoc": "off",
    ["jsdoc"]: "off",
    "max-len": ["error", {code: 200}],
    ["camelcase"]: "off",
    ["quotes"]: ["error", "double"],
    "import/no-unresolved": 0,
    "operator-linebreak": [
      "error",
      "before",
      {
        overrides: {
          ">": "after",
          "=": "after",
          "||": "after",
          "&&": "after",
          "?": "before",
          ":": "before",
        },
      },
    ],
    ["indent"]: ["error", 2, {SwitchCase: 1}],
  },
};
