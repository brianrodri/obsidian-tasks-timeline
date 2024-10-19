import { useCallback } from "preact/hooks";

import { CancelledIcon, DoneIcon, TaskIcon } from "../assets/icons";
import { Task } from "../compat/dataview-types";
import { useTimelineContext } from "../hooks/use-timeline-context";

export interface TaskCheckboxProps {
    task: Task;
}

export function TaskCheckbox({ task }: TaskCheckboxProps) {
    const { obsidian, tasksApi } = useTimelineContext();

    const icon = getIcon(task);

    const onClick = useCallback(() => {
        obsidian.processFilePosition(task.path, task.position, (taskContent: string) =>
            tasksApi.executeToggleTaskDoneCommand(taskContent, task.path),
        );
    }, [obsidian, tasksApi, task]);

    return (
        <div class="icon" onClick={onClick}>
            {icon}
        </div>
    );
}

function getIcon(task: Task) {
    if (task.completed) {
        return DoneIcon;
    }
    if (task.checked) {
        return CancelledIcon;
    }
    return TaskIcon;
}
