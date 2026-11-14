import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["**/dist/**", "**/node_modules/**", "design/**", ".railway/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      // Hard rule 3: personal fields must never reach logs. Use the Fastify
      // logger (which redacts them) instead of console.
      "no-console": "error",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
  {
    // CLI scripts print progress to the terminal; they never handle orders.
    files: ["apps/api/src/db/migrate.ts", "apps/api/src/db/seed.ts"],
    rules: { "no-console": "off" },
  },
);
