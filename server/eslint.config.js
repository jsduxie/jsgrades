import { FlatCompat } from "@eslint/eslintrc";
import path from "path";

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  // Extend from the root config
  ...compat.extends([path.resolve(__dirname, "../eslint.config.js")]),

  {
    files: ["**/*.ts", "**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
    },
    env: {
      node: true,
      jest: true,
    },
    rules: {
      "@typescript-eslint/no-var-requires": "error",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "no-console": "warn",
    },
    parserOptions: {
      project: "./tsconfig.json",
    },
  },
];