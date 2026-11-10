import type { ReadonlySignal } from "@preact/signals";
import { For } from "@preact/signals/utils";
import { memo } from "preact/compat";

import type { Task } from "@/data/task";
import { TaskEntry } from "@/layout/task-entry";

interface TaskTimelineProps {
    /** A store section as a signal, so only this timeline re-renders when it changes, or an upcoming group's tasks. */
    tasks: ReadonlySignal<readonly Task[]> | readonly Task[];
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
 *
 * Re-renders only when its props or its section change, and then only renders the entries of new or changed tasks.
 */
export const TaskTimeline = memo(
    ({
        tasks,
        date,
        label,
        relativeCalendar,
        showDone = false,
        showDropped = false,
        showCustom = false,
    }: TaskTimelineProps) => {
        const visibleTasks = ("value" in tasks ? tasks.value : tasks).filter(
            (task) =>
                (task.status !== "DONE" || showDone) &&
                (task.status !== "DROPPED" || showDropped) &&
                (task.status !== "CUSTOM" || showCustom),
        );

        if (visibleTasks.length === 0) return null;

        return (
            <>
                <div class="date-line">
                    <div class="date">
                        {date ?
                            [date.toString(), date.toLocaleString(undefined, { weekday: "short" })].join(" ")
                        :   label}
                        {visibleTasks.length > 1 ?
                            <span class="counter">{` (${visibleTasks.length})`}</span>
                        :   null}
                    </div>
                    <div class="relative">{relativeCalendar}</div>
                </div>
                <div class="content">
                    {/* For reuses the rendered entry of every task instance it has seen, so only new tasks render. */}
                    <For each={visibleTasks} getKey={(task) => task.identity}>
                        {(task) => <TaskEntry task={task} />}
                    </For>
                </div>
            </>
        );
    },
);
