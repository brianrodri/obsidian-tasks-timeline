import preact from "@preact/preset-vite";
import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
import path from "path";

export default defineConfig(({ mode }) => ({
    plugins: [
        preact(),
        viteStaticCopy({
            targets: [
                { src: "styles.css", dest: "./" },
                { src: "manifest.json", dest: "./" },
            ],
        }),
    ],
    build: {
        emptyOutDir: false, // Otherwise helpful files like ".hotreload" will be wiped.
        lib: {
            entry: "src/main.tsx",
            fileName: () => "main.js",
            formats: ["cjs"],
        },
        rollupOptions: {
            treeshake: true,
            external: ["obsidian"],
        },
        sourcemap: mode === "development" ? "inline" : false,
    },
    resolve: { alias: { "@": path.resolve(__dirname, "/src") } },
    test: {
        environment: "jsdom",
        include: ["src/**/__tests__/*.{ts,tsx}"],
        coverage: {
            all: true,
            include: ["src/"],
            exclude: ["src/main.tsx", "src/lib/*/api.ts", "**/__mocks__/", "**/__tests__/"],
        },
    },
}));
