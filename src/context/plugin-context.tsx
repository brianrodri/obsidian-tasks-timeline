import { createContext, PropsWithChildren, useContext } from "preact/compat";

import { Dataview } from "../compat/dataview-adapters";
import { Obsidian, WorkspaceLeaf } from "../compat/obsidian-adapters";
import { TasksApi } from "../compat/tasks-api-adapters";
import { TasksTimelineSettings as Settings } from "../config/settings";

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
