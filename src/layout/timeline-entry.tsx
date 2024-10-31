import { useCallback, useMemo } from "preact/hooks";

import { Task } from "@/data/task";
import { TaskEntry } from "./task-entry";

interface TaskTimelineProps {
    label: string;
    tasks: readonly Task[];
    showDone?: boolean;
    showDropped?: boolean;
    showCustom?: boolean;
}

export function TaskTimeline({
    label,
    tasks,
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
        () => tasks.filter(taskFilter).map((task) => <TaskEntry task={task} key={task.getKey()} />),
        [tasks, taskFilter],
    );

    return entries.length > 0 ?
            <>
                <div class="dateLine">
                    <div class="date">{label}</div>
                </div>
                <div class="content">{entries}</div>
            </>
        :   null;
}
