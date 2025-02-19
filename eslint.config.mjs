// @ts-check
import { fileURLToPath } from "node:url";
import { dirname } from "path";
import { FlatCompat } from "@eslint/eslintrc";
import pluginJs from "@eslint/js";
import configPrettier from "eslint-config-prettier";
import pluginReact from "eslint-plugin-react";
import tseslint from "typescript-eslint";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const shadcn = "src/components/ui/*.tsx";

export default tseslint.config(
  { ignores: [".next/"] },
  { files: ["**/*.cjs"], languageOptions: { sourceType: "commonjs" } },
  pluginJs.configs.recommended,
  {
    files: ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
    ignores: [shadcn],
    extends: [
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": "error",
    },
  },
  { files: [shadcn], extends: tseslint.configs.strict },
  pluginReact.configs.flat.recommended,
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    files: ["*.config.*ts"],
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
  configPrettier,
);
