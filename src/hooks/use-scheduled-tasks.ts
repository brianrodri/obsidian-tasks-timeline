import { Dictionary, groupBy, partition, sortedIndex } from "lodash";
import { DateTime } from "luxon";
import { useMemo } from "preact/hooks";

import { Page, Task } from "../compat/dataview-types";
import { useTimelineContext } from "./use-timeline-context";

export interface ScheduledTasksValue {
    unscheduled: Task[];
    getScheduledOn: (date: DateTime<true>) => Task[];
}

export function useScheduledTasks(): ScheduledTasksValue {
    const { dataview, settings } = useTimelineContext();
    const revision = dataview.revision.value;
    const pageQuery = settings.pageQuery;

    return useMemo(() => {
        const getScheduledDate = (task: Task) => resolveScheduledDate(task, dataview.getPage(task.path));
        const tasks = dataview.getPages(pageQuery).flatMap((page) => page.file.tasks?.array() ?? []);

        const [scheduled, unscheduled] = partition(tasks, getScheduledDate);
        const scheduledByDate = groupBy(scheduled, getScheduledDate);
        const sortedDates = Object.keys(scheduledByDate).sort();
        accumulateOpenTasks(scheduledByDate, sortedDates);

        const getScheduledOn = (date: DateTime<true>) => {
            const key = date.toISODate();
            const lowerBound = sortedIndex(sortedDates, key);
            if (sortedDates[lowerBound] === key) {
                return scheduledByDate[key];
            } else {
                const prevKey = sortedDates[lowerBound - 1];
                return prevKey ? scheduledByDate[prevKey].filter((task) => !task.checked) : [];
            }
        };

        return { unscheduled, getScheduledOn, revision } as const;
    }, [dataview, pageQuery, revision]);
}

function resolveScheduledDate(task: Task, page?: Page): string {
    const scheduled = task.scheduled?.toISODate() ?? page?.file.day?.toISODate() ?? null;
    const start = task.start?.toISODate() ?? null;
    return scheduled && start && scheduled < start ? start : (scheduled ?? "");
}

function accumulateOpenTasks(tasksByDate: Dictionary<Task[]>, sortedDates: string[]) {
    const forwardedTasks = [];
    for (const date of sortedDates) {
        const openTasks = tasksByDate[date].filter((task) => !task.checked);
        tasksByDate[date].push(...forwardedTasks);
        forwardedTasks.push(...openTasks);
    }
}
