import { useCallback, useMemo } from "preact/hooks";

import type { Task } from "@/data/task";
import { TaskEntry } from "@/layout/task-entry";

interface TaskTimelineProps {
    tasks: readonly Task[];
    date?: Temporal.PlainDate;
    label?: string;
    relativeCalendar?: string | null;
    showDone?: boolean;
    showDropped?: boolean;
    showCustom?: boolean;
}

/**
 * Renders the tasks under a heading of `date`, or of `label` when there is no date. The heading counts the tasks when
 * there is more than one.
 *
 * Hides done, dropped, and custom-status tasks unless asked to show them. Renders nothing when no task is visible.
 */
export function TaskTimeline({
    tasks,
    date,
    label,
    relativeCalendar,
    showDone = false,
    showDropped = false,
    showCustom = false,
}: TaskTimelineProps) {
    const taskFilter = useCallback(
        (task: Task) =>
            (task.status !== "DONE" || showDone) &&
            (task.status !== "DROPPED" || showDropped) &&
            (task.status !== "CUSTOM" || showCustom),
        [showDone, showDropped, showCustom],
    );

    const entries = useMemo(
        () => tasks.filter(taskFilter).map((task) => <TaskEntry task={task} key={task.identity} />),
        [tasks, taskFilter],
    );

    if (entries.length > 0) {
        return (
            <>
                <div class="date-line">
                    <div class="date">
                        {date ?
                            [date.toString(), date.toLocaleString(undefined, { weekday: "short" })].join(" ")
                        :   label}
                        {entries.length > 1 ?
                            <span class="counter">{` (${entries.length})`}</span>
                        :   null}
                    </div>
                    <div class="relative">{relativeCalendar}</div>
                </div>
                <div class="content">{entries}</div>
            </>
        );
    }
    return null;
}
