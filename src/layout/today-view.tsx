import { DateTime } from "luxon";

import { useTasksState } from "@/context/tasks-state";
import { Task } from "@/data/task";

import { TaskEntry } from "./task-entry";
import { TimelineEntry } from "./timeline-entry";

export interface TodayViewProps {
    showFuture?: boolean;
}

export function TodayView({ showFuture = true }: TodayViewProps) {
    const { getHappeningBefore, getDatesAfter, undated } = useTasksState();

    const today = DateTime.now().startOf("day");
    const futureDates = showFuture ? getDatesAfter(today) : [];
    const futureIntervals = futureDates.map((date) => <TimelineEntry key={date} date={date} />);
    const unscheduled = [...getHappeningBefore(today), ...undated].filter((task) => task.status === "OPEN");
    const unscheduledEntries = (
        <>
            <div class="dateLine">
                <div class="date">To Schedule</div>
            </div>
            <div class="content">{unscheduled.map(toTaskEntry)}</div>
        </>
    );

    return (
        <div class="taskido" id="taskido">
            <div class="details">
                <TimelineEntry label="Today" date={today} showDone={true} showDropped={true} />
                {unscheduled.length > 0 ? unscheduledEntries : null}
                {futureIntervals}
            </div>
        </div>
    );
}

const toTaskEntry = (task: Task) => <TaskEntry task={task} key={task.getKey()} />;
