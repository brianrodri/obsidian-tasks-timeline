import { vi } from "vitest";

import { PluginContextProvider, PluginContextValue } from "@/context/plugin-context";
import { DEFAULT_SETTINGS } from "@/data/settings";
import { Dataview } from "@/lib/obsidian-dataview/__mocks__/api";
import { TasksApi } from "@/lib/obsidian-tasks/__mocks__/api";
import { Obsidian, WorkspaceLeaf } from "@/lib/obsidian/__mocks__/api";

// TODO: Change this into a vitest-compatible mock
export class MockPluginContext {
    public constructor(
        public readonly obsidian = vi.mocked(new Obsidian()),
        public readonly dataview = vi.mocked(new Dataview()),
        public readonly leaf = vi.mocked(new WorkspaceLeaf()),
        public readonly tasksApi = vi.mocked(new TasksApi()),
        public readonly settings = vi.mocked(DEFAULT_SETTINGS),
    ) {}

    public toValue(): PluginContextValue {
        return {
            dataview: this.dataview,
            obsidian: this.obsidian,
            leaf: this.leaf,
            tasksApi: this.tasksApi,
            settings: this.settings,
        } as unknown as PluginContextValue;
    }

    public readonly wrapper = ({ children }: { children: Element }) => (
        <PluginContextProvider {...this.toValue()}>{children}</PluginContextProvider>
    );
}
