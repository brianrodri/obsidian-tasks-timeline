import { Dictionary, groupBy, memoize, partition, sortedIndex } from "lodash";
import { DateTime } from "luxon";
import { useMemo } from "preact/hooks";

import { Task } from "../compat/dataview-types";
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
        const getScheduledDate = memoize(
            (task) => dataview.getScheduledDate(task),
            (task) => `${task.path}@${revision}`,
        );

        const tasks = dataview.getPages(pageQuery).flatMap((page) => page.file.tasks?.array() ?? []);
        const [scheduled, unscheduled] = partition(tasks, getScheduledDate);
        const scheduledByDate = groupBy(scheduled, getScheduledDate);
        const sortedDates = Object.keys(scheduledByDate).sort();
        accumulateOpenTasks(scheduledByDate, sortedDates);


        return { unscheduled, getScheduledOn, revision } as const;
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
