import { DateTime } from "luxon";

import { usePluginContext } from "@/context/plugin-context";
import { TaskTimeline } from "@/layout/timeline-entry";

export interface TodayViewProps {
    showFuture?: boolean;
}

export function TodayView({ showFuture = true }: TodayViewProps) {
    const { taskLookup } = usePluginContext();
    const {
        getTasksHappeningBefore,
        getTasksHappeningOn,
        getTasksHappeningAfter,
        isTaskActionable,
        undatedTasks: undated,
    } = taskLookup.value;
    const today = DateTime.now().startOf("day");

    const todoToday = getTasksHappeningOn(today).filter(isTaskActionable);
    const todoLater = Map.groupBy(showFuture ? getTasksHappeningAfter(today).filter(isTaskActionable) : [], (task) =>
        task.happensDate.toISODate(),
    );
    const unplanned = [...getTasksHappeningBefore(today).toReversed(), ...undated].filter(
        (task) => isTaskActionable(task) && task.status === "OPEN",
    );

    return (
        <div class="taskido" id="taskido">
            <div class="details">
                <TaskTimeline key="today" date={today} tasks={todoToday} />
                <TaskTimeline key="unplanned" label={"To schedule"} tasks={unplanned} />
                {todoLater
                    .entries()
                    .map(([isoDate, tasks]) => (
                        <TaskTimeline
                            key={isoDate}
                            date={isoDate ? (DateTime.fromISO(isoDate) as DateTime<true>) : undefined}
                            tasks={tasks}
                        />
                    ))
                    .toArray()}
            </div>
        </div>
    );
}
