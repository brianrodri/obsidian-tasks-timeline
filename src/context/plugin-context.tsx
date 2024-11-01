import { Signal } from "@preact/signals";
import { PropsWithChildren, createContext, useCallback, useContext } from "preact/compat";

import { PluginSettings } from "@/data/settings";
import { LoadingView } from "@/layout/loading-view";
import { Dataview } from "@/lib/obsidian-dataview/api";
import { TasksApi } from "@/lib/obsidian-tasks/api";
import { Obsidian, WorkspaceLeaf } from "@/lib/obsidian/api";

export const PluginContext = createContext<PluginContextValue | null>(null);

export interface PluginContextValue {
    leaf: WorkspaceLeaf;
    obsidian: Obsidian;
    dataview: Dataview;
    tasksApi: TasksApi;
    settings: PluginSettings;
    setSettings: (part: Partial<PluginSettings>) => PluginSettings;
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
    settingsSignal: Signal<PluginSettings>;
    obsidian: Obsidian;
    dataviewSignal: Signal<Dataview | undefined>;
    tasksApi: TasksApi;
}

export function PluginContextProvider({
    children,
    settingsSignal,
    dataviewSignal,
    ...rest
}: PropsWithChildren<PluginContextProviderProps>) {
    const setSettings = useCallback(
        (part: Partial<PluginSettings>) => (settingsSignal.value = { ...settingsSignal.value, ...part }),
        [settingsSignal],
    );

    const dataview = dataviewSignal.value;
    if (!dataview) {
        return <LoadingView />;
    }

    const value = { dataview, settings: settingsSignal.value, setSettings, ...rest };
    return <PluginContext.Provider value={value}>{children}</PluginContext.Provider>;
}
