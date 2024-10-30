import { DateTime, DurationLike } from "luxon";
import { VNode } from "preact";
import { useCallback } from "preact/hooks";

import { CancelledIcon, CompletedIcon, CreatedIcon, DueIcon, ScheduledIcon, StartedIcon } from "@/assets/icons";
import { usePluginContext } from "@/context/plugin-context";
import { Task, TaskFields } from "@/data/task";
import { updateEmojiTaskField } from "@/lib/obsidian-tasks/parse-task-fields";
import { KeysWithValueOf } from "@/utils/type-utils";
import { TaskInfoEntry } from "./task-info-entry";

type DateFields = KeysWithValueOf<Omit<Task, "happensDate">, DateTime>;

export type TaskDateInputProps = {
    symbol?: VNode;
    field: DateFields;
    task: Task;
};

export function TaskDateInput({ field, task }: TaskDateInputProps) {
    const { obsidian } = usePluginContext();
    const { filePath, fileStartByte, fileStopByte } = task.location;

    const onWheel = useCallback(
        (event: WheelEvent) => {
            const delta = { days: Math.sign(event.deltaY) }; // Scroll-up for past, scroll-down for future.
            if (delta.days !== 0 && filePath !== undefined) {
                event.preventDefault();
                if (filePath !== undefined) {
                    obsidian.processFileRange(filePath, fileStartByte, fileStopByte, (text) =>
                        updateEmojiTaskField(text, field, (date) => updateDateKey(field, date, delta)),
                    );
                }
            }
        },
        [field, filePath, fileStartByte, fileStopByte, obsidian],
    );

    const date = task[field];

    if (!date?.isValid && field !== "scheduledDate") return null;
    return (
        <TaskInfoEntry symbol={SYMBOL_MAP[field]} class="relative">
            <div class="date-input" onWheel={onWheel}>
                {date.toISODate() ?? "todo"}
            </div>
        </TaskInfoEntry>
    );
}

function updateDateKey(key: DateFields, oldDate: DateTime, delta: DurationLike): DateTime {
    const today = DateTime.now().startOf("day");
    switch (key) {
        case "scheduledDate":
            return DateTime.max(today, oldDate.plus(delta));
        case "doneDate":
        case "cancelledDate":
            return DateTime.min(today, oldDate.plus(delta));
        case "createdDate":
        case "dueDate":
        case "startDate":
            return oldDate.plus(delta);
    }
}

const SYMBOL_MAP = {
    cancelledDate: <CancelledIcon />,
    createdDate: <CreatedIcon />,
    doneDate: <CompletedIcon />,
    dueDate: <DueIcon />,
    scheduledDate: <ScheduledIcon />,
    startDate: <StartedIcon />,
} as const satisfies Record<KeysWithValueOf<TaskFields, DateTime>, VNode>;
