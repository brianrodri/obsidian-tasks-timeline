import { Signal, useComputed } from "@preact/signals";
import { Plugin } from "obsidian";
import { PropsWithChildren, createContext, useContext } from "preact/compat";

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
    taskLookup: Signal<TaskLookup>;
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
    const taskLookup = useComputed(
        () =>
            new TaskLookup(
                dataviewSignal.value?.getTasks(settingsSignal.value.pageQuery) ?? [],
                dataviewSignal.value?.revision.value ?? 0,
            ),
    );

    if (!dataviewSignal.value) {
        return <LoadingView />;
    }

    const value = { dataview: dataviewSignal.value, settings: settingsSignal.value, taskLookup, ...rest };
    return <PluginContext.Provider value={value}>{children}</PluginContext.Provider>;
}
