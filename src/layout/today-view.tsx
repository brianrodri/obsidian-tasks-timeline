import { DateTime } from "luxon";

import { useTasksState } from "@/context/tasks-state";

import { TaskTimeline } from "./timeline-entry";

export interface TodayViewProps {
    showFuture?: boolean;
}

export function TodayView({ showFuture = true }: TodayViewProps) {
    const { getHappeningBefore, getHappeningOn, getHappeningAfter, isDependencyFree, undated } = useTasksState();
    const today = DateTime.now().startOf("day");

    const todoToday = getHappeningOn(today).filter(isDependencyFree);
    const todoLater = Map.groupBy(showFuture ? getHappeningAfter(today).filter(isDependencyFree) : [], (task) =>
        task.happensDate.toISODate(),
    );
    const unplanned = [...getHappeningBefore(today).toReversed(), ...undated].filter(
        (task) => isDependencyFree(task) && task.status === "OPEN",
    );

    return (
        <div class="taskido" id="taskido">
            <div class="details">
                <TaskTimeline key="today" label={today.toRelativeCalendar()} tasks={todoToday} />
                <TaskTimeline key="unplanned" label={"To schedule"} tasks={unplanned} />
                {todoLater
                    .entries()
                    .map(([isoDate, tasks]) => <TaskTimeline key={isoDate} label={isoDate as string} tasks={tasks} />)
                    .toArray()}
            </div>
        </div>
    );
}
