import { Signal } from "@preact/signals";
import { Plugin } from "obsidian";
import { PropsWithChildren, createContext, useContext, useMemo } from "preact/compat";

import { PluginSettings } from "@/data/settings";
import { TaskLookup } from "@/data/task-lookup";
import { LoadingView } from "@/layout/loading-view";
import { Dataview } from "@/lib/obsidian-dataview/api";
import { TasksApi } from "@/lib/obsidian-tasks/api";
import { Obsidian, WorkspaceLeaf } from "@/lib/obsidian/api";

export const PluginContext = createContext<PluginContextValue | null>(null);

export interface PluginContextValue {
    plugin: Plugin;
    leaf: WorkspaceLeaf;
    obsidian: Obsidian;
    dataview: Dataview;
    tasksApi: TasksApi;
    settings: PluginSettings;
    taskLookup: TaskLookup;
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
    plugin: Plugin;
    leaf: WorkspaceLeaf;
    obsidian: Obsidian;
    tasksApi: TasksApi;
    dataviewSignal: Signal<Dataview | undefined>;
    settingsSignal: Signal<PluginSettings>;
    setSettings: (part: Partial<PluginSettings>) => PluginSettings;
}

export function PluginContextProvider({
    children,
    dataviewSignal,
    settingsSignal,
    ...rest
}: PropsWithChildren<PluginContextProviderProps>) {
    const dataview = dataviewSignal.value;
    const settings = settingsSignal.value;

    const taskLookup = useMemo(
        () =>
            dataview ?
                new TaskLookup(dataview.getTasks(settings.pageQuery), dataview.revision.value)
            :   new TaskLookup(),
        [dataview, settings.pageQuery],
    );

    if (!dataview) {
        return <LoadingView />;
    }

    const value = { dataview, settings, taskLookup, ...rest };
    return <PluginContext.Provider value={value}>{children}</PluginContext.Provider>;
}
