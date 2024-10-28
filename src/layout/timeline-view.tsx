import { DateTime } from "luxon";

import { useScheduledTasks } from "@/hooks/use-scheduled-tasks";
import { TaskEntry } from "./task-entry";
import { useMemo } from "preact/hooks";

export function TimelineView() {
    const { unscheduled, getScheduledOn, revision } = useScheduledTasks();

    const taskEntries = useMemo(() => {
        return [...getScheduledOn(DateTime.now()), ...unscheduled].map((task, i) => (
            <TaskEntry key={`${revision}:${i}`} task={task} />
        ));
    }, [revision, getScheduledOn, unscheduled]);

    return (
        <div class="taskido" id="taskido">
            <div class="details">
                <div class="content">{taskEntries}</div>
            </div>
        </div>
    );
}
