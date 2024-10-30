import { createContext } from "preact";
import { PropsWithChildren } from "preact/compat";
import { useContext, useMemo } from "preact/hooks";

import { usePluginContext } from "@/context/plugin-context";
import { TasksState } from "@/data/tasks-state";

const context = createContext(new TasksState());

export function useTasksState(): TasksState {
    return useContext(context);
}

export function TasksStateProvider({ children }: PropsWithChildren) {
    const { dataview, settings } = usePluginContext();
    const revision = dataview.revision.value;
    const pageQuery = settings.pageQuery;

    const state = useMemo(
        () => new TasksState(dataview.getTasks(pageQuery), revision),
        [dataview, pageQuery, revision],
    );

    return <context.Provider value={state}>{children}</context.Provider>;
}
