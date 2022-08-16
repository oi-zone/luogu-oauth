module.exports = {
  root: true,
  env: { es2021: true, node: true },
  extends: ["eslint:recommended", "airbnb-base", "plugin:prettier/recommended"],
  parserOptions: { ecmaVersion: "latest" },
  overrides: [
    {
      files: ["src/**"],
      extends: [
        "airbnb-typescript/base",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        "plugin:prettier/recommended",
      ],
      parser: "@typescript-eslint/parser",
      parserOptions: { project: "tsconfig.json", tsconfigRootDir: __dirname },
      rules: {
        quotes: [
          "error",
          "double",
          { avoidEscape: true, allowTemplateLiterals: false },
        ],
      },
    },
  ],
};
