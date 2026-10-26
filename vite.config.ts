/// <reference types="vitest/config" />
import preact from "@preact/preset-vite";
import path from "node:path";
import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig(({ mode }) => ({
    plugins: [preact(), viteStaticCopy({ targets: [{ src: "manifest.json", dest: "./" }] })],
    build: {
        emptyOutDir: false, // Otherwise helpful files like ".hotreload" will be wiped.
        lib: {
            entry: "src/main.tsx",
            fileName: () => "main.js",
            formats: ["cjs"],
            cssFileName: "styles",
        },
        rolldownOptions: { external: ["obsidian"] },
        sourcemap: mode === "development" ? "inline" : false,
    },
    resolve: {
        alias: { "@": path.resolve(import.meta.dirname, "src") },
    },
    test: {
        environment: "jsdom",
        include: ["src/**/__tests__/*.{ts,tsx}"],
        coverage: {
            include: ["src/"],
            exclude: ["src/main.tsx", "**/__mocks__/*", "**/__tests__/*"],
        },
        // NOTE(vitest-dev/vitest#4029): obsidian package has no "main" entrypoint so we need to mock the entire lib.
        alias: { obsidian: path.resolve(import.meta.dirname, "src/lib/obsidian/__mocks__/types.ts") },
    },
}));
