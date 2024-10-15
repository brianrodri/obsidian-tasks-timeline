import { Dictionary, groupBy, partition, sortedIndex } from "lodash";
import { DateTime } from "luxon";
import { useCallback, useMemo } from "preact/hooks";

import { Page, Task } from "../compat/dataview-types";
import { useTimelineContext } from "./use-timeline-context";

export interface ScheduledTasksValue {
    unscheduled: Task[];
    useScheduledOn: (date: DateTime<true>) => Task[];
}

export function useScheduledTasks(): ScheduledTasksValue {
    const { dataview, settings } = useTimelineContext();
    const revision = dataview.revision?.value;
    const pageQuery = settings.pageQuery;

    const { byScheduledDate, sortedDates, unscheduled } = useMemo(() => {
        const tasks = dataview.getPages(pageQuery).flatMap((page) => page.file.tasks?.array() ?? []);
        const getScheduledDate = (task: Task) => resolveScheduledDate(task, dataview.getPage(task.path));
        const [scheduled, unscheduled] = partition(tasks, getScheduledDate);
        const byScheduledDate = groupBy(scheduled, getScheduledDate);
        const sortedDates = Object.keys(byScheduledDate).sort();
        accumulateScheduledTasks(byScheduledDate, sortedDates);

        return { revision, byScheduledDate, sortedDates, unscheduled } as const;
    }, [revision, dataview, pageQuery]);

    const useScheduledOn = useCallback(
        (date: DateTime<true>) => {
            const key = date.toISODate();
            const lowerBound = sortedIndex(sortedDates, key);
            if (sortedDates[lowerBound] === key) {
                return byScheduledDate[key];
            } else {
                const pastKey = sortedDates[lowerBound - 1];
                return pastKey ? byScheduledDate[pastKey].filter((task) => !task.checked) : [];
            }
        },
        [byScheduledDate, sortedDates],
    );

    return { unscheduled, useScheduledOn } as const;
}

function resolveScheduledDate(task: Task, page?: Page): string {
    const scheduled = task.scheduled?.toISODate() ?? page?.file.day?.toISODate() ?? null;
    const start = task.start?.toISODate() ?? null;

    if (scheduled && start) {
        return scheduled < start ? start : scheduled;
    } else {
        return scheduled || start || "";
    }
}

function accumulateScheduledTasks(tasksByDate: Dictionary<Task[]>, sortedDates: string[]) {
    const forwardedTasks: Task[] = [];

    for (const date of sortedDates) {
        const tasks = tasksByDate[date];
        const uncheckedTasks = tasks.filter((task) => !task.checked);

        tasks.push(...forwardedTasks);
        forwardedTasks.push(...uncheckedTasks);
    }
}
