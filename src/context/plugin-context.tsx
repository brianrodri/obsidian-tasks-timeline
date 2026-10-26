import { type Signal, useComputed } from "@preact/signals";
import { type PropsWithChildren, createContext, use } from "preact/compat";

import type { PluginSettings } from "@/data/settings";
import { TaskLookup } from "@/data/task-lookup";
import { LoadingView } from "@/layout/loading-view";
import type { Dataview } from "@/lib/obsidian-dataview/api";
import type { TasksApi } from "@/lib/obsidian-tasks/api";
import type { Obsidian } from "@/lib/obsidian/adapters";
import type { Plugin, WorkspaceLeaf } from "@/lib/obsidian/types";

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
    const value = use(PluginContext);
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
    const taskLookup = useComputed(() =>
        dataviewSignal.value ?
            new TaskLookup(
                dataviewSignal.value.getTasks(settingsSignal.value.pageQuery),
                dataviewSignal.value.revision.value,
            )
        :   new TaskLookup(),
    );

    return dataviewSignal.value ?
            <PluginContext
                value={{ dataview: dataviewSignal.value, settings: settingsSignal.value, taskLookup, ...rest }}
            >
                {children}
            </PluginContext>
        :   <LoadingView />;
}
