import { renderHook } from "@testing-library/preact";
import { describe, expect, it, vi } from "vitest";

import { Dataview } from "../compat/dataview-adapters";
import { Obsidian, WorkspaceLeaf } from "../compat/obsidian-adapters";
import { DEFAULT_SETTINGS } from "../config/settings";
import { PluginContextProvider, usePluginContext } from "./plugin-context";
import { TasksApi } from "../compat/tasks-api-adapters";

vi.mock("../compat/dataview-adapters");
vi.mock("../compat/obsidian-adapters");
vi.mock("../compat/tasks-api-adapters");

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
