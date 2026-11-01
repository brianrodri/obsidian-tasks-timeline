import { describe, expect, it } from "vitest";

import type { App } from "@/lib/obsidian/types";

import { getPlugin, isPluginEnabled } from "../adapters";

const dataview = { api: { version: "0.5.68" } };

const app = {
    plugins: { enabledPlugins: new Set(["dataview"]), plugins: { dataview } },
} as unknown as App;

const appWithoutRegistry = {} as App;

describe("getPlugin", () => {
    it("returns the instance of an installed plugin", () => {
        expect(getPlugin<typeof dataview>(app, "dataview")).toBe(dataview);
    });

    it("returns undefined for a plugin that is not installed", () => {
        expect(getPlugin(app, "obsidian-tasks-plugin")).toBeUndefined();
    });

    it("returns undefined when the plugin registry is unavailable", () => {
        expect(getPlugin(appWithoutRegistry, "dataview")).toBeUndefined();
    });
});

describe("isPluginEnabled", () => {
    it("returns true for an enabled plugin", () => {
        expect(isPluginEnabled(app, "dataview")).toBe(true);
    });

    it("returns false for a plugin that is not enabled", () => {
        expect(isPluginEnabled(app, "obsidian-tasks-plugin")).toBe(false);
    });

    it("returns false when the plugin registry is unavailable", () => {
        expect(isPluginEnabled(appWithoutRegistry, "dataview")).toBe(false);
    });
});
