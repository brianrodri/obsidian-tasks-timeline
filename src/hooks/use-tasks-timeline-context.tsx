import { createContext, PropsWithChildren, useContext, useMemo } from "preact/compat";

import { Dataview } from "../compat/dataview-adapters";
import { Obsidian } from "../compat/obsidian-adapters";
import { TasksTimelineSettings as Settings } from "../config/settings";

const context = createContext<TasksTimelineContextValue<boolean>>({ valid: false });

export type TasksTimelineContextValue<Valid extends boolean> =
    Valid extends false ? { valid: false }
    :   {
            valid: true;
            settings: Settings;
            obsidian: Obsidian;
            dataview: Dataview;
        };

export function useTasksTimelineContext(): TasksTimelineContextValue<true> {
    const value = useContext(context);
    if (!value.valid) {
        throw new Error("context must be used from within a provider");
    }
    return value;
}

export interface TasksTimelineContextProviderProps {
    settings: Settings;
    obsidian: Obsidian;
}

export function TasksTimelineContextProvider({
    obsidian,
    settings,
    children,
}: PropsWithChildren<TasksTimelineContextProviderProps>) {
    const dataview = useMemo(() => new Dataview(obsidian.plugin), [obsidian.plugin]);

    return <context.Provider value={{ valid: true, settings, obsidian, dataview }}>{children}</context.Provider>;
}
