import { renderHook } from "@testing-library/preact";
import { describe, expect, it, vi } from "vitest";

import { Dataview } from "../compat/dataview-adapters";
import { Obsidian } from "../compat/obsidian-adapters";
import { DEFAULT_SETTINGS } from "../config/settings";
import { TimelineContextProvider, useTimelineContext } from "./use-timeline-context";

vi.mock("../compat/dataview-adapters");
vi.mock("../compat/obsidian-adapters");

describe("useTimelineContext", () => {
    it("throws when used outside of context", () => {
        expect(() => renderHook(useTimelineContext)).toThrowError("context must be used from within a provider");
    });

    it("returns provided values", () => {
        const settings = { ...DEFAULT_SETTINGS };
        const obsidian = new Obsidian();
        const dataview = new Dataview();

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
