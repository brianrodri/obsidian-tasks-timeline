import { lowerCase } from "lodash";
import { DateTime } from "luxon";
import { VNode } from "preact";
import { TargetedEvent, useState } from "preact/compat";
import { useEventCallback } from "usehooks-ts";

import { usePluginContext } from "@/context/plugin-context";
import { Task, TaskFields } from "@/data/task";
import { writeEmojiTaskField } from "@/lib/obsidian-tasks/parse-task-fields";
import { PickByValue } from "utility-types";

export type TaskDateInputProps = {
    symbol?: VNode;
    field: keyof PickByValue<TaskFields, DateTime>;
    task: Task;
};

export function TaskDateInput({ symbol, field, task }: TaskDateInputProps) {
    const {
        [field]: fieldValue,
        location: { filePath, fileStartByte, fileStopByte },
    } = task;
    const { obsidian } = usePluginContext();
    const [disabled, setDisabled] = useState(false);

    const onInput = useEventCallback((event: TargetedEvent<HTMLInputElement>) => {
        const { value } = event.currentTarget;
        if (filePath !== undefined && !disabled && DateTime.fromISO(value).isValid) {
            event.preventDefault();
            const process = (text: string) => writeEmojiTaskField(text, field, value);
            setDisabled(true);
            obsidian
                .processFileRange(filePath, fileStartByte, fileStopByte, process)
                .catch((error) => console.error(error))
                .finally(() => setDisabled(false));
        }
    });

    if (field === "scheduledDate" || fieldValue.isValid) {
        return (
            <div class="relative">
                <label class="dateInput">
                    <div class="icon">{symbol}</div>
                    <input
                        aria-label={`Set ${lowerCase(field)}`}
                        type="date"
                        value={fieldValue.toISODate() ?? ""}
                        disabled={disabled}
                        onInput={onInput}
                    />
                </label>
                <span class="label">{fieldValue.toISODate() ?? "todo"}</span>
            </div>
        );
    }
    return null;
}
