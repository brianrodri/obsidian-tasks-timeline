import type { ReadonlySignal } from "@preact/signals";
import { memo } from "preact/compat";

import { useAppContext } from "@/context/app-context";
import { TaskTimeline } from "@/layout/task-timeline";
import type { UpcomingGroup } from "@/store/create-store.types";

export interface TodayViewProps {
    showFuture?: boolean;
}

/** Passes each section down as a signal, so only the timeline reading a changed section re-renders. */
export function TodayView({ showFuture = true }: TodayViewProps) {
    const { store } = useAppContext();

    return (
        <div class="ott" id="ott">
            <div class="details">
                <TaskTimeline key="today" label="today" tasks={store.planned} />
                <TaskTimeline key="unplanned" label="backlog" tasks={store.backlog} />
                {showFuture ?
                    <GroupedTaskTimelines groups={store.upcoming} />
                :   null}
            </div>
        </div>
    );
}

interface GroupedTaskTimelinesProps {
    groups: ReadonlySignal<readonly UpcomingGroup[]>;
}

const GroupedTaskTimelines = memo(({ groups }: GroupedTaskTimelinesProps) => {
    const { store } = useAppContext();
    const today = store.today.value;
    let prevRelativeDate: string | null = null;

    return groups.value.map(({ date, tasks }) => {
        const relativeDate = toRelativeCalendar(date, today);
        const timeline = (
            <TaskTimeline
                key={date.toString()}
                tasks={tasks}
                date={date}
                relativeCalendar={relativeDate !== prevRelativeDate ? relativeDate : null}
            />
        );
        prevRelativeDate = relativeDate;
        return timeline;
    });
});

/**
 * Describes `date` relative to `base` in the coarsest calendar unit that differs, like "tomorrow" or "next month".
 *
 * Matches the output of Luxon's `DateTime#toRelativeCalendar`.
 */
export function toRelativeCalendar(
    date: Temporal.PlainDate,
    base: Temporal.PlainDate,
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
