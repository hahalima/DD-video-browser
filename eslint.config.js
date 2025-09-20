import js from "@eslint/js";
import globals from "globals";

export default [
  {
    files: ["server/**/*.js"],
    ignores: ["client/**", "node_modules/**", "dist/**", "client/dist/**"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      globals: globals.node,
    },
    rules: {
      ...js.configs.recommended.rules,
    },
  },
];