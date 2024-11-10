import { useCallback, useMemo } from "preact/hooks";

import { Task } from "@/data/task";
import { TaskEntry } from "@/layout/task-entry";
import { DateTime } from "luxon";

interface TaskTimelineProps {
    tasks: readonly Task[];
    date?: DateTime<true>;
    label?: string;
    showDone?: boolean;
    showDropped?: boolean;
    showCustom?: boolean;
}

export function TaskTimeline({
    tasks,
    date,
    label,
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

    return entries.length > 0 ?
            <>
                {date?.isValid ?
                    <div class="dateLine">
                        <div class="relative">{date.toRelativeCalendar()}</div>
                        <div class="date">{`${date.toISODate()} ${date.weekdayShort}`}</div>
                    </div>
                :   <div class="dateLine">{label}</div>}
                <div class="content">{entries}</div>
            </>
        :   null;
}
