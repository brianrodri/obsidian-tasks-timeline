import { useSignal } from "@preact/signals";
import { VNode } from "preact";
import { useEventCallback } from "usehooks-ts";

import { CancelledIcon, CompletedIcon, OverdueIcon, TaskIcon } from "@/components/icons";
import { usePluginContext } from "@/context/plugin-context";
import { TaskLocation, TaskStatus } from "@/data/task";

export interface TaskCheckboxProps {
    status: TaskStatus;
    overdue?: boolean;
    location: TaskLocation;
}

export function TaskCheckbox({
    status,
    overdue,
    location: { filePath, fileStartByte, fileStopByte },
}: TaskCheckboxProps) {
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
        <div class="icon" onClick={onClick}>
            {status === "OPEN" ?
                overdue ?
                    <OverdueIcon />
                :   <TaskIcon />
            :   STATUS_ICON_MAP[status]}
        </div>
    );
}

const STATUS_ICON_MAP = {
    DONE: <CompletedIcon />,
    DROPPED: <CancelledIcon />,
    CUSTOM: <CancelledIcon />,
} as const satisfies { [K in TaskStatus]?: VNode };
