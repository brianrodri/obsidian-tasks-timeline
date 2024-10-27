import { Dictionary, groupBy, memoize, partition, sortedIndex } from "lodash";
import { DateTime } from "luxon";
import { useMemo } from "preact/hooks";

import { usePluginContext } from "@/context/plugin-context";
import { Task } from "@/lib/obsidian-dataview/api";

export interface ScheduledTasksValue {
    unscheduled: Task[];
    getScheduledOn: (date: DateTime<true>) => Task[];
}

export function useScheduledTasks(): ScheduledTasksValue {
    const { dataview, settings } = usePluginContext();
    const revision = dataview.revision.value;
    const pageQuery = settings.pageQuery;

    return useMemo(() => {
        const getScheduledDate = (task: Task) => dataview.getScheduledDate(task);

        const tasks = dataview.getPages(pageQuery).flatMap((page) => page.file.tasks?.array() ?? []);
        const [scheduled, unscheduled] = partition(tasks, getScheduledDate);
        const scheduledByDate = groupBy(scheduled, getScheduledDate);
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
                return prevKey ? scheduledByDate[prevKey].filter((task) => !task.checked) : [];
            },
            (date) => date.toISODate(),
        );

        return { revision, unscheduled, getScheduledOn } as const;
    }, [dataview, pageQuery, revision]);
}

function accumulateOpenTasks(tasksByDate: Dictionary<Task[]>, sortedDates: string[]) {
    const forwardedTasks = [];
    for (const date of sortedDates) {
        const openTasks = tasksByDate[date].filter((task) => !task.checked);
        tasksByDate[date].push(...forwardedTasks);
        forwardedTasks.push(...openTasks);
    }
}
