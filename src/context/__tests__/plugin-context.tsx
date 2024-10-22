import { renderHook } from "@testing-library/preact";
import { describe, expect, it, vi } from "vitest";

import { Dataview } from "../../lib/dataview-adapters";
import { Obsidian, WorkspaceLeaf } from "../../lib/obsidian-adapters";
import { DEFAULT_SETTINGS } from "../../data/settings";
import { PluginContextProvider, usePluginContext } from "../plugin-context";
import { TasksApi } from "../../lib/tasks-api-adapters";

vi.mock("../../lib/dataview-adapters");
vi.mock("../../lib/obsidian-adapters");
vi.mock("../../lib/tasks-api-adapters");

describe("useTimelineContext", () => {
    it("throws when used outside of context", () => {
        expect(() => renderHook(usePluginContext)).toThrowError("context must be used from within a provider");
    });

    it("returns provided values", () => {
        const settings = { ...DEFAULT_SETTINGS };
        const obsidian = new Obsidian();
        const dataview = new Dataview();
        const tasksApi = new TasksApi();
        const leaf = new WorkspaceLeaf();

        const { result } = renderHook(usePluginContext, {
            wrapper: ({ children }) => (
                <PluginContextProvider
                    leaf={leaf}
                    settings={settings}
                    obsidian={obsidian}
                    dataview={dataview}
                    tasksApi={tasksApi}
                >
                    {children}
                </PluginContextProvider>
            ),
        });

        expect(result.current).toEqual({ settings, obsidian, dataview, tasksApi, leaf });
    });
});
