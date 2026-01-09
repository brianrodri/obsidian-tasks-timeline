import { useSignal } from "@preact/signals";
import { useEventCallback } from "usehooks-ts";

import { usePluginContext } from "@/context/plugin-context";
import { TaskLocation, TaskStatus } from "@/data/task";

export interface TaskCheckboxProps {
    status: TaskStatus;
    location: TaskLocation;
}

export function TaskCheckbox({ status, location: { filePath, fileStartByte, fileStopByte } }: TaskCheckboxProps) {
    const { obsidian, tasksApi } = usePluginContext();
    const waiting = useSignal(false);

    const onClick = useEventCallback(() => {
        if (!filePath || waiting.value) return;
        waiting.value = true;
        obsidian
            .processFileRange(filePath, fileStartByte, fileStopByte, (data: string) =>
                tasksApi.executeToggleTaskDoneCommand(data, filePath),
            )
            .catch((error) => console.error(error))
            .finally(() => (waiting.value = false));
    });

    return (
        <input
            type="checkbox"
            checked={status === "DONE"}
            data-task={status === "DROPPED" ? "-" : ""}
            onClick={onClick}
        />
    );
}
