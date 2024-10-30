import { DateTime, Interval } from "luxon";
import { useMemo } from "preact/compat";

import { useVaultTaskState } from "@/context/vault-task-state";

import { Task } from "@/data/task";
import { TaskEntry } from "./task-entry";
import { isString, upperFirst } from "lodash";

export interface TodayViewProps {
    showFuture?: boolean;
}

export function TodayView({ showFuture = false }: TodayViewProps) {
    const { getHappeningBefore, getDatesAfter, undated } = useVaultTaskState();
    // Use a number so that React can properly identify updates.
    const today = DateTime.now();
    const todayStartEpoch = today.startOf("day").toMillis();

    const toSchedule = useMemo(
        () => [
            ...getHappeningBefore(DateTime.fromMillis(todayStartEpoch) as DateTime<true>)
                .filter((task) => task.status === "OPEN")
                .reverse(),
            ...undated,
        ],
        [getHappeningBefore, todayStartEpoch, undated],
    );

    const futureDates = showFuture ? getDatesAfter(today) : [];
    const futureIntervals = futureDates.map((date) => <TimelineEntry key={date} date={date} />);

    return (
        <div class="taskido" id="taskido">
            <div class="details">
                <TimelineEntry label="Today" date={today} />
                <div class="dateLine">
                    <div class="date">To Schedule</div>
                    <div class="weekday" />
                </div>
                <div class="content">{toSchedule.map(toTaskEntry)}</div>
                {futureIntervals}
            </div>
        </div>
    );
}

interface TimelineEntryProps {
    date: DateTime<true> | string;
    label?: string;
}

function TimelineEntry({ date, label }: TimelineEntryProps) {
    const { getHappeningOn, revision } = useVaultTaskState();

    date = isString(date) ? (DateTime.fromISO(date) as DateTime<true>) : date;
    const start = date.startOf("day");
    const end = start.plus({ days: 1 });
    const interval = Interval.fromDateTimes(start, end) as Interval<true>;

    const entries = getHappeningOn(interval)
        .filter((task) => task.status === "OPEN")
        .map((task) => <TaskEntry task={task} key={task.getKey(revision)} />);

    if (entries.length === 0) return null;
    return (
        <>
            <div class="dateLine">
                <div class="date">{label ?? getDefaultDateLabel(start)}</div>
                <div class="weekday" />
            </div>
            <div class="content">{entries}</div>
        </>
    );
}

function getDefaultDateLabel(date: DateTime<true>): string {
    if (Math.abs(date.diffNow().as("days")) < 1) {
        return upperFirst(date.toRelativeCalendar({ unit: "days" }));
    }
    return upperFirst(date.toISODate());
}

const toTaskEntry = (task: Task) => <TaskEntry task={task} key={task.getKey()} />;
