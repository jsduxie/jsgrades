import rootConfig from "../eslint.config.js";

export default [
  ...rootConfig,
  {
    files: ["**/*.ts", "**/*.js"],
    rules: {
      "@typescript-eslint/no-var-requires": "error",
      "@typescript-eslint/explicit-module-boundary-types": "off",
    },
    parserOptions: {
      project: "./tsconfig.json",
    },
  },
];