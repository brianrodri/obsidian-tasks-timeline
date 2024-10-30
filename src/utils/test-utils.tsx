import { vi } from "vitest";

import { PluginContext, PluginContextValue } from "@/context/plugin-context";
import { DEFAULT_SETTINGS, PluginSettings } from "@/data/settings";
import { Dataview } from "@/lib/obsidian-dataview/__mocks__/api";
import { TasksApi } from "@/lib/obsidian-tasks/__mocks__/api";
import { Obsidian, WorkspaceLeaf } from "@/lib/obsidian/__mocks__/api";
import { Signal } from "@preact/signals";

// TODO: Change this into a vitest-compatible mock
export class MockPluginContext {
    public constructor(
        public readonly obsidian = vi.mocked(new Obsidian()),
        public readonly dataview = vi.mocked(new Dataview()),
        public readonly leaf = vi.mocked(new WorkspaceLeaf()),
        public readonly tasksApi = vi.mocked(new TasksApi()),
        public readonly settings = { value: vi.mocked(DEFAULT_SETTINGS) } as Signal<PluginSettings>,
        public readonly setSettings = vi.fn(),
    ) {}

    public readonly wrapper = ({ children }: { children: Element }) => {
        const value = {
            dataview: this.dataview,
            obsidian: this.obsidian,
            leaf: this.leaf,
            tasksApi: this.tasksApi,
            settings: this.settings,
            setSettings: this.setSettings,
        } as unknown as PluginContextValue;

        return <PluginContext.Provider value={value}>{children}</PluginContext.Provider>;
    };
}
