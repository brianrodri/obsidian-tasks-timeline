import { DateTime } from "luxon";

import { useScheduledTasks } from "../hooks/use-scheduled-tasks";
import { TaskEntry } from "./task-entry";

export function TimelineView() {
    const { unscheduled, getScheduledOn } = useScheduledTasks();
    const tasks = [...getScheduledOn(DateTime.now()), ...unscheduled];
    const taskEntries = tasks.map((task) => <TaskEntry task={task} />);

    return (
        <div class="taskido" id="taskido">
            <div class="details">
                <div class="content">{taskEntries}</div>
            </div>
        </div>
    );
}
