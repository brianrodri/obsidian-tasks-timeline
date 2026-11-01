import { sortedLastIndexBy } from "lodash";
import { memo } from "preact/compat";
import { useMemo } from "preact/hooks";

import { usePluginContext } from "@/context/plugin-context";
import type { Task } from "@/data/task";
import { TaskTimeline } from "@/layout/task-timeline";

export interface TodayViewProps {
    showFuture?: boolean;
}

export function TodayView({ showFuture = true }: TodayViewProps) {
    const { taskLookup } = usePluginContext();
    const { getTasksHappeningBefore, getTasksHappeningOn, getTasksHappeningAfter, isTaskActionable, undatedTasks } =
        taskLookup.value;

    const today = Temporal.Now.plainDateISO();

    const plannedToday = useMemo(
        () => getTasksHappeningOn(today).filter(isTaskActionable),
        [getTasksHappeningOn, isTaskActionable, today],
    );

    const unplanned = useMemo(
        () => [...getTasksHappeningBefore(today).toReversed(), ...undatedTasks].filter(isTaskActionable),
        [today, undatedTasks, getTasksHappeningBefore, isTaskActionable],
    );

    const plannedLater = useMemo(
        () => (showFuture ? getTasksHappeningAfter(today).filter(isTaskActionable) : []),
        [showFuture, today, getTasksHappeningAfter, isTaskActionable],
    );

    return (
        <div class="ott" id="ott">
            <div class="details">
                <TaskTimeline key="today" label="today" tasks={plannedToday} />
                <TaskTimeline key="unplanned" label="backlog" tasks={unplanned} />
                <GroupedTaskTimelines tasks={plannedLater} />
            </div>
        </div>
    );
}

interface GroupedTaskTimelinesProps {
    tasks: readonly Task[];
}

const GroupedTaskTimelines = memo(({ tasks }: GroupedTaskTimelinesProps) => {
    const timelines = [];
    let prevRelativeDate: string | null = null;

    for (let indexStartIncl = 0; indexStartIncl < tasks.length;) {
        const firstTask = tasks[indexStartIncl];
        if (!firstTask) break;
        const indexStopExcl = sortedLastIndexBy(tasks, firstTask, (task) => task.happensDate?.toString());
        const relativeDate = firstTask.happensDate ? toRelativeCalendar(firstTask.happensDate) : null;

        timelines.push(
            <TaskTimeline
                key={firstTask.happensDate?.toString()}
                tasks={tasks.slice(indexStartIncl, indexStopExcl)}
                date={firstTask.happensDate}
                relativeCalendar={relativeDate !== prevRelativeDate ? relativeDate : null}
            />,
        );

        indexStartIncl = indexStopExcl;
        prevRelativeDate = relativeDate;
    }

    return timelines;
});

/**
 * Describes `date` relative to `base` in the coarsest calendar unit that differs, like "tomorrow" or "next month".
 *
 * Matches the output of Luxon's `DateTime#toRelativeCalendar`.
 */
export function toRelativeCalendar(
    date: Temporal.PlainDate,
    base: Temporal.PlainDate = Temporal.Now.plainDateISO(),
    locales?: Intl.LocalesArgument,
): string {
    const formatter = new Intl.RelativeTimeFormat(locales, { numeric: "auto" });

    const years = date.year - base.year;
    if (years !== 0) {
        return formatter.format(years, "years");
    }

    const months = date.month - base.month;
    if (months !== 0) {
        return formatter.format(months, "months");
    }

    return formatter.format(base.until(date).days, "days");
}
