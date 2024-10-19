import { renderHook } from "@testing-library/preact";
import type { Plugin } from "obsidian";
import { describe, expect, it, vi } from "vitest";

import { Dataview } from "../compat/dataview-adapters";
import { Obsidian } from "../compat/obsidian-adapters";
import { DEFAULT_SETTINGS } from "../config/settings";
import { TimelineContextProvider, useTimelineContext } from "./use-timeline-context";

vi.mock("../compat/dataview-adapters", () => ({ Dataview: vi.fn() }));
vi.mock("../compat/obsidian-adapters", () => ({ Obsidian: vi.fn() }));

describe("TasksTimelineContext", () => {
    it("throws when used outside of context", () => {
        expect(() => renderHook(useTimelineContext)).toThrowError("context must be used from within a provider");
    });

    it("returns provided values", () => {
        const settings = { ...DEFAULT_SETTINGS };
        const obsidian = new Obsidian({} as Plugin);
        const dataview = new Dataview({} as Plugin);

        const { result } = renderHook(useTimelineContext, {
            wrapper: ({ children }) => (
                <TimelineContextProvider settings={settings} obsidian={obsidian} dataview={dataview}>
                    {children}
                </TimelineContextProvider>
            ),
        });

        expect(result.current.settings).toBe(settings);
        expect(result.current.obsidian).toBe(obsidian);
        expect(result.current.dataview).toBe(dataview);
    });
});
