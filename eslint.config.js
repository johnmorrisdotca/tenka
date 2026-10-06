import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: [".readme-examples/", "dist/", "site/", "node_modules/", "test-results/", "playwright-report/"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.{ts,tsx}", "demo/**/*.js"],
    languageOptions: { globals: globals.browser },
    plugins: { "react-hooks": reactHooks },
    rules: reactHooks.configs.recommended.rules,
  },
  {
    files: ["scripts/**/*.mjs", "table/**/*.mjs", "*.config.{js,ts,mjs}", "src/docs.test.js"],
    languageOptions: { globals: { ...globals.node, document: "readonly", window: "readonly", localStorage: "readonly" } },
  },
  { files: ["scripts/readme-pictures.mjs", "scripts/readme-pictures-lib.mjs"], languageOptions: { globals: { console: "readonly", process: "readonly", window: "readonly", document: "readonly", localStorage: "readonly", getComputedStyle: "readonly", URL: "readonly", URLSearchParams: "readonly" } }, rules: { "no-redeclare": ["error", { builtinGlobals: false }] } },
);
