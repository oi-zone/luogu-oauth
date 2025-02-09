// @ts-check
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import configPrettier from "eslint-config-prettier";

import { dirname } from "path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

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
