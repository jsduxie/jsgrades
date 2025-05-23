import rootConfig from "../eslint.config.js";
import reactPlugin from "eslint-plugin-react";
import jestPlugin from "eslint-plugin-jest";
import importPlugin from "eslint-plugin-import";
import prettierPlugin from "eslint-plugin-prettier";

export default [
  ...rootConfig,
  {
    plugins: {
      react: reactPlugin,
      jest: jestPlugin,
      import: importPlugin,
      prettier: prettierPlugin,
    },
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    env: {
      browser: true,
      jest: true,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "prettier/prettier": "error",
    },
  },
];