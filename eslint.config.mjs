import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import configPrettier from "eslint-config-prettier";

import path from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: pluginJs.configs.recommended,
  allConfig: pluginJs.configs.all,
});

const shadcn = "src/components/ui/*.tsx";

/** @type {import('eslint').Linter.Config[]} */
export default tseslint.config(
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
  { ignores: ["node_modules/", "dist/", ".next/"] },
  { files: ["**/*.js"], languageOptions: { sourceType: "commonjs" } },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
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
  configPrettier,
);
