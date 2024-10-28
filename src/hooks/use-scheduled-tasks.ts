import { Dictionary, groupBy, memoize, partition, sortedIndex } from "lodash";
import { DateTime } from "luxon";
import { useMemo } from "preact/hooks";

import { usePluginContext } from "@/context/plugin-context";
import { Task } from "@/data/task";

export interface ScheduledTasksValue {
    revision: number;
    unscheduled: Task[];
    getScheduledOn: (date: DateTime<true>) => Task[];
}

export function useScheduledTasks(): ScheduledTasksValue {
    const { dataview, settings } = usePluginContext();
    const revision = dataview.revision.value;
    const pageQuery = settings.pageQuery;

    return useMemo(() => {
        const tasks = dataview.getTasks(pageQuery);
        const [scheduled, unscheduled] = partition(tasks, ({ scheduledDate }) => scheduledDate.isValid);
        const scheduledByDate = groupBy(scheduled, (task) => task.scheduledDate?.toISODate());
        const sortedDates = Object.keys(scheduledByDate).sort();
        accumulateOpenTasks(scheduledByDate, sortedDates);

        const getScheduledOn: (date: DateTime<true>) => Task[] = memoize(
            (date) => {
                const key = date.toISODate();
                const lowerBound = sortedIndex(sortedDates, key);
                if (sortedDates[lowerBound] === key) {
                    return scheduledByDate[key];
                }
                const prevKey = sortedDates[lowerBound - 1];
                return prevKey ? scheduledByDate[prevKey].filter((task) => task.status === "OPEN") : [];
            },
            (date) => date.toISODate(),
        );

        return { revision, unscheduled, getScheduledOn } as const;
    }, [dataview, pageQuery, revision]);
}

function accumulateOpenTasks(tasksByDate: Dictionary<Task[]>, sortedDates: string[]) {
    const forwardedTasks = [];
    for (const date of sortedDates) {
        const openTasks = tasksByDate[date].filter((task) => task.status === "OPEN");
        tasksByDate[date].push(...forwardedTasks);
        forwardedTasks.push(...openTasks);
    }
}
