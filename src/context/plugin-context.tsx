import { createContext, PropsWithChildren, useContext } from "preact/compat";

import { Dataview } from "../lib/dataview-adapters";
import { Obsidian, WorkspaceLeaf } from "../lib/obsidian-adapters";
import { TasksApi } from "../lib/tasks-api-adapters";
import { PluginSettings as Settings } from "../data/settings";

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
