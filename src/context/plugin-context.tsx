import { PropsWithChildren, createContext, useContext } from "preact/compat";

import { PluginSettings as Settings } from "@/data/settings";
import { Dataview } from "@/lib/obsidian-dataview/api";
import { TasksApi } from "@/lib/obsidian-tasks/api";
import { Obsidian, WorkspaceLeaf } from "@/lib/obsidian/api";

const PluginContext = createContext<PluginContextValue | null>(null);

export interface PluginContextValue {
    leaf: WorkspaceLeaf;
    settings: Settings;
    obsidian: Obsidian;
    dataview: Dataview;
    tasksApi: TasksApi;
}

export function usePluginContext(): PluginContextValue {
    const value = useContext(PluginContext);
    if (!value) {
        throw new Error("context must be used from within a provider");
    }
    return value;
}

export function PluginContextProvider({ children, ...value }: PropsWithChildren<PluginContextValue>) {
    return <PluginContext.Provider value={value}>{children}</PluginContext.Provider>;
}
