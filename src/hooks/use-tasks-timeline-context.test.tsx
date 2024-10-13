import { renderHook } from "@testing-library/preact";
import type { Plugin } from "obsidian";
import { describe, expect, it, vi } from "vitest";

import { Obsidian } from "../compat/obsidian-adapters";
import { DEFAULT_SETTINGS } from "../config/settings";
import { TasksTimelineContextProvider, useTasksTimelineContext } from "./use-tasks-timeline-context";

vi.mock("../compat/dataview-adapters", () => ({ Dataview: vi.fn() }));
vi.mock("../compat/obsidian-adapters", () => ({ Obsidian: vi.fn() }));

describe("TasksTimelineContext", () => {
    it("throws when used outside of context", () => {
        expect(() => renderHook(useTasksTimelineContext)).toThrowError("context must be used from within a provider");
    });

    it("returns provided values", () => {
        const settings = { ...DEFAULT_SETTINGS };
        const obsidian = new Obsidian({} as Plugin);

        const { result } = renderHook(useTasksTimelineContext, {
            wrapper: ({ children }) => (
                <TasksTimelineContextProvider settings={settings} obsidian={obsidian}>
                    {children}
                </TasksTimelineContextProvider>
            ),
        });

        expect(result.current.valid).toBe(true);
        expect(result.current.settings).toBe(settings);
        expect(result.current.obsidian).toBe(obsidian);
        expect(result.current.dataview).toBeDefined();
    });
});
