import { Signal } from "@preact/signals";
import { PropsWithChildren, createContext, useCallback, useContext } from "preact/compat";

import { PluginSettings } from "@/data/settings";
import { Dataview } from "@/lib/obsidian-dataview/api";
import { TasksApi } from "@/lib/obsidian-tasks/api";
import { Obsidian, WorkspaceLeaf } from "@/lib/obsidian/api";

export const PluginContext = createContext<PluginContextValue | null>(null);

export interface PluginContextValue {
    leaf: WorkspaceLeaf;
    settings: PluginSettings;
    setSettings: (part: Partial<PluginSettings>) => PluginSettings;
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

interface PluginContextProviderProps {
    leaf: WorkspaceLeaf;
    settings: Signal<PluginSettings>;
    obsidian: Obsidian;
    dataview: Dataview;
    tasksApi: TasksApi;
}

export function PluginContextProvider({ children, settings, ...rest }: PropsWithChildren<PluginContextProviderProps>) {
    const value: PluginContextValue = {
        settings: settings.value,
        setSettings: useCallback((part) => (settings.value = { ...settings.value, ...part }), [settings]),
        ...rest,
    };
    return <PluginContext.Provider value={value}>{children}</PluginContext.Provider>;
}
