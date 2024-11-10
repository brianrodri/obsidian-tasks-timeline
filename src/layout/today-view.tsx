/* eslint-disable prettier/prettier */
import { DateTime } from "luxon";

import { usePluginContext } from "@/context/plugin-context";
import { TaskTimeline } from "@/layout/task-timeline";

export interface TodayViewProps {
    showFuture?: boolean;
}

export function TodayView({ showFuture = true }: TodayViewProps) {
    const { taskLookup } = usePluginContext();
    const { getTasksHappeningBefore, getTasksHappeningOn, getTasksHappeningAfter, isTaskActionable, undatedTasks } =
        taskLookup.value;

    const today = DateTime.now().startOf("day");
    const plannedToday = getTasksHappeningOn(today);
    const unplanned = [...getTasksHappeningBefore(today).toReversed(), ...undatedTasks];
    const plannedLater = Map.groupBy(showFuture ? getTasksHappeningAfter(today) : [], (task) => task.happensDate.toISODate());

    return (
        <div class="taskido" id="taskido">
            <div class="details">
                <TaskTimeline key="today" date={today} tasks={plannedToday.filter(isTaskActionable)} />
                <TaskTimeline key="unplanned" label={"To schedule"} tasks={unplanned.filter(isTaskActionable)} />
                {plannedLater
                    .entries()
                    .map(([isoDate, tasks]) => (
                        <TaskTimeline
                            key={isoDate}
                            date={DateTime.fromISO(isoDate as string) as DateTime<true>}
                            tasks={tasks.filter(isTaskActionable)}
                        />
                    ))
                    .toArray()}
            </div>
        </div>
    );
}
