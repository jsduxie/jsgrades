import js from "@eslint/js";
import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";
import prettierPlugin from "eslint-plugin-prettier";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  importPlugin.configs.errors,
  importPlugin.configs.warnings,
  importPlugin.configs.typescript,
  {
    plugins: {
      prettier: prettierPlugin,
    },
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    rules: {
      semi: ["error", "always"],
      quotes: ["error", "single", { avoidEscape: true }],
      "no-console": "warn",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "import/order": [
        "error",
        {
          groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
      "prettier/prettier": "error",
    },
  },
];