// @ts-check
import eslintReact from "@eslint-react/eslint-plugin";
import js from "@eslint/js";
import prettierConfig from "eslint-config-prettier";
import reactHooks from "eslint-plugin-react-hooks";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
// TODO(typescript-eslint/typescript-eslint#10940): typescript-eslint loads the `typescript` package, which is aliased to
// TypeScript 6 in package.json until typescript-eslint supports the TypeScript 7 API. See tsconfig.json.
import tseslint from "typescript-eslint";

export default defineConfig(
    globalIgnores(["coverage/", "docs/", "dist/", "test-vault/"]),
    js.configs.recommended,

    {
        files: ["*.config.js", ".husky/install.js"],
        languageOptions: { globals: { ...globals.node } },
    },

    {
        files: ["**/*.{ts,tsx}"],
        extends: [tseslint.configs.strictTypeChecked, tseslint.configs.stylisticTypeChecked],
        languageOptions: {
            parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
        },
        rules: {
            // Companions to tsconfig "verbatimModuleSyntax": keep type-only imports erasable.
            "@typescript-eslint/consistent-type-imports": ["error", { fixStyle: "inline-type-imports" }],
            "@typescript-eslint/no-import-type-side-effects": "error",
            "@typescript-eslint/restrict-template-expressions": ["error", { allowNumber: true }],
        },
    },

    {
        files: ["src/**/__tests__/**", "src/**/__mocks__/**"],
        rules: {
            // Tests reference mocked methods (e.g. `expect(MarkdownRenderer.render)`) without calling them.
            "@typescript-eslint/unbound-method": "off",
        },
    },

    // TODO(obsidianmd/eslint-plugin#198, obsidianmd/eslint-plugin#144): adopt the official eslint-plugin-obsidianmd once
    // its peer dependencies stop pinning obsidian@1.8.7 and @eslint/js@^9, which conflict with obsidian 1.14 / ESLint 10.
    {
        files: ["src/**/*.{ts,tsx}"],
        extends: [eslintReact.configs["recommended-type-checked"], reactHooks.configs.flat.recommended],
        languageOptions: { globals: { ...globals.browser } },
        settings: { "react-x": { importSource: "preact" } },
        rules: {
            // @preact/signals writes to `.value` are not React state mutations.
            "react-hooks/immutability": "off",
        },
    },

    prettierConfig,
);
