import { VNode } from "preact";
import { useCallback } from "preact/hooks";

import { CancelledIcon, CompletedIcon, TaskIcon } from "@/assets/icons";
import { usePluginContext } from "@/context/plugin-context";
import { TaskLocation, TaskStatus } from "@/data/task";

export interface TaskCheckboxProps {
    status: TaskStatus;
    location: TaskLocation;
}

export function TaskCheckbox({ status, location: { filePath, fileStartByte, fileStopByte } }: TaskCheckboxProps) {
    const { obsidian, tasksApi } = usePluginContext();

    const onClick = useCallback(async () => {
        if (filePath) {
            const process = (data: string) => tasksApi.executeToggleTaskDoneCommand(data, filePath);
            await obsidian.processFileRange(filePath, fileStartByte, fileStopByte, process);
        }
    }, [obsidian, tasksApi, filePath, fileStartByte, fileStopByte]);

    return (
        <div class="icon" onClick={onClick}>
            {STATUS_ICON_MAP[status]}
        </div>
    );
}

const STATUS_ICON_MAP: Readonly<Record<TaskStatus, VNode>> = {
    OPEN: <TaskIcon />,
    DONE: <CompletedIcon />,
    DROPPED: <CancelledIcon />,
    CUSTOM: <CancelledIcon />,
};
