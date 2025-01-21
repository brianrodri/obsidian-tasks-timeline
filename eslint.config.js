import typescriptPlugin from "@typescript-eslint/eslint-plugin";
import typescriptPluginParser from "@typescript-eslint/parser";
import preactConfig from "eslint-config-preact";
import prettierConfig from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import globals from "globals";

/** @type { import("eslint").Linter.Config[] } */
export default [
    { ignores: ["coverage/", "docs/", "dist/", "node_modules/", "test-vault/"] },

    ...preactConfig.flat,

    {
        files: ["*.config.js", ".husky/install.js"],
        languageOptions: {
            globals: { ...globals.node },
        },
    },

    {
        files: ["src/**/*.{ts,tsx}"],
        plugins: {
            "@typescript-eslint": typescriptPlugin,
            "react-hooks": reactHooksPlugin,
        },
        rules: {
            ...typescriptPlugin.configs.recommended.rules,
            ...typescriptPlugin.configs.strict.rules,
            ...reactHooksPlugin.configs.recommended.rules,
        },
        languageOptions: {
            globals: { ...globals.browser },
            parser: typescriptPluginParser,
            parserOptions: {
                ecmaFeatures: { modules: true },
                ecmaVersion: "latest",
            },
        },
    },

    {
        files: ["src/**/*.{ts,tsx}", "*.config.js"],
        plugins: { prettier: prettierPlugin },
        rules: {
            ...prettierConfig.rules,
            "prettier/prettier": "error",
        },
    },
];
