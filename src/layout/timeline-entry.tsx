import { isString, upperFirst } from "lodash";
import { DateTime, Interval } from "luxon";

import { useTasksState } from "@/context/tasks-state";
import { TaskEntry } from "./task-entry";

export interface TimelineEntryProps {
    date: DateTime<true> | string;
    label?: string;
    showDone?: boolean;
    showDropped?: boolean;
}

export function TimelineEntry({ date, label, showDone = false, showDropped = false }: TimelineEntryProps) {
    const { getHappeningOn, revision } = useTasksState();

    date = isString(date) ? (DateTime.fromISO(date) as DateTime<true>) : date;
    const start = date.startOf("day");
    const end = start.plus({ days: 1 });
    const interval = Interval.fromDateTimes(start, end) as Interval<true>;

    const entries = getHappeningOn(interval)
        .filter(
            (task) =>
                task.status === "OPEN" ||
                (showDone && task.status === "DONE") ||
                (showDropped && task.status === "DROPPED"),
        )
        .map((task) => <TaskEntry task={task} key={task.getKey(revision)} />);

    if (entries.length === 0) return null;
    return (
        <>
            <div class="dateLine">
                <div class="date">{label ?? getDefaultDateLabel(start)}</div>
            </div>
            <div class="content">{entries}</div>
        </>
    );
}

export function getDefaultDateLabel(date: DateTime<true>): string {
    if (Math.abs(date.diffNow().as("days")) < 1) {
        return upperFirst(date.toRelativeCalendar({ unit: "days" }));
    }
    return upperFirst(date.toISODate());
}
