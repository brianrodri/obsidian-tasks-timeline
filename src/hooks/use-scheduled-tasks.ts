import { groupBy, partition } from "lodash";
import { entriesIn, flow, reduce, sortBy } from "lodash/fp";
import { useMemo } from "preact/hooks";

import { Page, Task } from "../compat/dataview-types";
import { useTimelineContext } from "./use-timeline-context";

export function useScheduledTasks() {
    const { dataview, settings } = useTimelineContext();
    const revision = dataview.revision?.value;
    const pageQuery = settings.pageQuery;

    return useMemo(() => {
        const tasks = dataview.getPages(pageQuery).flatMap((page) => page.file.tasks?.array() ?? []);
        const getScheduledDate = (task: Task) => resolveScheduledDate(task, dataview.getPage(task.path));
        const [scheduledTasks, unscheduledTasks] = partition(tasks, flow(getScheduledDate, Boolean));
        const tasksByScheduledDate = groupBy(scheduledTasks, getScheduledDate);
        accumulateScheduledTasks(tasksByScheduledDate);

        return { revision, tasksByScheduledDate, unscheduledTasks } as const;
    }, [dataview, pageQuery, revision]);
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

const accumulateScheduledTasks = flow(
    entriesIn,
    sortBy(([scheduledDate]) => scheduledDate),
    reduce((forwardedTasks: Task[], [, scheduledTasks]) => {
        const tasksToForward = [...forwardedTasks, ...scheduledTasks.filter((task: Task) => !task.checked)];
        scheduledTasks.push(...forwardedTasks);
        return tasksToForward;
    }, []),
);
