import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Obsidian } from "@/lib/obsidian/adapters";
import type { Plugin } from "@/lib/obsidian/types";

import { connectStore } from "../connect-store";
import { createStore } from "../create-store";

function createFakePlugin() {
    const handlers = new Map<string, () => void>();
    const disposers: (() => void)[] = [];
    const plugin = {
        app: {
            metadataCache: {
                on: vi.fn((name: string, handler: () => void) => {
                    handlers.set(name, handler);
                    return { name };
                }),
            },
        },
        registerEvent: vi.fn(),
        registerInterval: vi.fn((id: number) => id),
        register: vi.fn((disposer: () => void) => disposers.push(disposer)),
        saveData: vi.fn(() => Promise.resolve()),
    };
    return {
        plugin,
        obsidian: new Obsidian(plugin as unknown as Plugin),
        fire: (name: string) => handlers.get(name)?.(),
        unload: () => {
            disposers.forEach((dispose) => {
                dispose();
            });
        },
    };
}

describe("connectStore", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("bumps the revision when dataview metadata changes", () => {
        const store = createStore();
        const { plugin, obsidian, fire } = createFakePlugin();
        connectStore(store, obsidian);
        const before = store.revision.value;

        fire("dataview:metadata-change");

        expect(store.revision.value).toBeGreaterThan(before);
        expect(plugin.registerEvent).toHaveBeenCalledWith({ name: "dataview:metadata-change" });
    });

    it("rolls today over to the next date", () => {
        vi.setSystemTime(new Date(2024, 9, 25, 23, 59, 30));
        const store = createStore();
        const { plugin, obsidian } = createFakePlugin();
        connectStore(store, obsidian);
        expect(store.today.value).toEqual(Temporal.PlainDate.from("2024-10-25"));

        vi.advanceTimersByTime(60_000);

        expect(store.today.value).toEqual(Temporal.PlainDate.from("2024-10-26"));
        expect(plugin.registerInterval).toHaveBeenCalledOnce();
    });

    it("keeps today unchanged on a same-day tick", () => {
        vi.setSystemTime(new Date(2024, 9, 25, 12, 0, 0));
        const store = createStore();
        const { obsidian } = createFakePlugin();
        connectStore(store, obsidian);
        const before = store.today.value;

        vi.advanceTimersByTime(60_000);

        expect(store.today.value).toBe(before);
    });
});
