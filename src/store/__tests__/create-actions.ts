import { describe, expect, it, vi } from "vitest";

import type { Obsidian } from "@/lib/obsidian/adapters";

import { createActions } from "../create-actions";
import { createStore } from "../create-store";

function setup() {
    const store = createStore();
    const obsidian = {
        saveData: vi.fn<Obsidian["saveData"]>(() => Promise.resolve()),
    };
    const actions = createActions(store, obsidian as unknown as Obsidian);
    return { store, obsidian, actions };
}

describe("createActions", () => {
    it("merges a settings update into the store and saves it", async () => {
        const { store, obsidian, actions } = setup();
        const before = store.settings.value;

        await actions.updateSettings({ pageQuery: "#work" });

        expect(store.settings.value).toEqual({ ...before, pageQuery: "#work" });
        expect(obsidian.saveData).toHaveBeenCalledExactlyOnceWith(store.settings.value);
    });

    it("rejects when the settings fail to save", async () => {
        const { obsidian, actions } = setup();
        const error = new Error("boom");
        obsidian.saveData.mockRejectedValue(error);

        await expect(actions.updateSettings({ pageQuery: "#work" })).rejects.toBe(error);
    });
});
