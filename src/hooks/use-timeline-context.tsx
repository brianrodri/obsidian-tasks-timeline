import { createContext, PropsWithChildren, useContext } from "preact/compat";

import { Dataview } from "../compat/dataview-adapters";
import { Obsidian, WorkspaceLeaf } from "../compat/obsidian-adapters";
import { TasksTimelineSettings as Settings } from "../config/settings";

const TimelineContext = createContext<TimelineContextValue | null>(null);

export interface TimelineContextValue {
    leaf: WorkspaceLeaf;
    settings: Settings;
    obsidian: Obsidian;
    dataview: Dataview;
}

export function useTimelineContext(): TimelineContextValue {
    const value = useContext(TimelineContext);
    if (!value) {
        throw new Error("context must be used from within a provider");
    }
    return value;
}

export function TimelineContextProvider({ children, ...value }: PropsWithChildren<TimelineContextValue>) {
    return <TimelineContext.Provider value={value}>{children}</TimelineContext.Provider>;
}
