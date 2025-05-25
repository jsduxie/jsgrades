import js from "@eslint/js";
import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";
import prettierPlugin from "eslint-plugin-prettier";
import reactPlugin from 'eslint-plugin-react';
import jestPlugin from 'eslint-plugin-jest';

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      import: importPlugin,
      prettier: prettierPlugin,
    },
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: ["./client/tsconfig.json", "./server/tsconfig.json"],
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
  {
    files: ["client/**/*.{js,jsx,ts,tsx}"],
    plugins: {
      react: reactPlugin,
      jest: jestPlugin,
      import: importPlugin,
      prettier: prettierPlugin,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        project: "./client/tsconfig.json",
      }
    },
    settings: {
      react: {
        version: 'detect',
      }
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'prettier/prettier': 'error',
    },
  },
  {
    files: ["server/**/*.{ts,js}"],
    plugins: {
      import: importPlugin,
      prettier: prettierPlugin,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './server/tsconfig.json',
      }
    },
    rules: {
      "@typescript-eslint/no-var-requires": "error",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      'prettier/prettier': 'error',
    },
  }
];