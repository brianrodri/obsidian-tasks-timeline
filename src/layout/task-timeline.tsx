import { useCallback, useMemo } from "preact/hooks";

import { Task } from "@/data/task";
import { TaskEntry } from "@/layout/task-entry";
import { DateTime } from "luxon";

interface TaskTimelineProps {
    tasks: readonly Task[];
    date?: DateTime<true>;
    label?: string;
    relativeCalendar?: string | null;
    showDone?: boolean;
    showDropped?: boolean;
    showCustom?: boolean;
}

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
        () => tasks.filter(taskFilter).map((task) => <TaskEntry task={task} key={task.key} />),
        [tasks, taskFilter],
    );

    if (entries.length > 0) {
        return (
            <>
                <div class="dateLine">
                    <div class="relative">{label ?? relativeCalendar}</div>
                    {date?.isValid ?
                        <div class="date">{`${date.toISODate()} ${date.weekdayShort}`}</div>
                    :   null}
                </div>
                <div class="content">{entries}</div>
            </>
        );
    }
}
