import { useSignal } from "@preact/signals";

import { useAppContext } from "@/context/app-context";
import type { Task } from "@/data/task";

export interface TaskCheckboxProps {
    task: Task;
}

export function TaskCheckbox({ task }: TaskCheckboxProps) {
    const { actions, obsidian } = useAppContext();
    const waiting = useSignal(false);

    const onClick = () => {
        if (waiting.value) return;
        waiting.value = true;
        actions
            .toggleTask(task)
            .catch((error: unknown) => {
                obsidian.reportError("Failed to toggle the task", error);
            })
            .finally(() => (waiting.value = false));
    };

    return (
        <input
            type="checkbox"
            checked={task.status === "DONE"}
            data-task={task.status === "DROPPED" ? "-" : ""}
            disabled={waiting}
            onClick={onClick}
        />
    );
}
