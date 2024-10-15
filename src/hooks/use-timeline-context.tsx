import { createContext, PropsWithChildren, useContext, useMemo } from "preact/compat";

import { Dataview } from "../compat/dataview-adapters";
import { Obsidian } from "../compat/obsidian-adapters";
import { TasksTimelineSettings as Settings } from "../config/settings";

export interface TimelineContext {
    settings: Settings;
    obsidian: Obsidian;
    dataview: Dataview;
}

type Context<V extends boolean = boolean> = V extends true ? { valid: true } & TimelineContext : { valid: false };

const timelineContext = createContext<Context>({ valid: false });

export interface TimelineContextProviderProps extends PropsWithChildren {
    settings: Settings;
    obsidian: Obsidian;
}

export function TimelineContextProvider({ obsidian, settings, children }: TimelineContextProviderProps) {
    const dataview = useMemo(() => new Dataview(obsidian.plugin), [obsidian.plugin]);
    const { Provider } = timelineContext;

    return <Provider value={{ valid: true, settings, obsidian, dataview }}>{children}</Provider>;
}

export function useTimelineContext(): Context<true> {
    const value = useContext(timelineContext);
    if (!value.valid) {
        throw new Error("context must be used from within a provider");
    }
    return value;
}
