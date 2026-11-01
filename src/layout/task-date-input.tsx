import { lowerCase } from "lodash";
import type { VNode } from "preact";
import { useRef, useState } from "preact/hooks";
import { useEventCallback } from "usehooks-ts";

import { usePluginContext } from "@/context/plugin-context";
import type { Task, TaskDateField } from "@/data/task";
import { writeEmojiTaskField } from "@/lib/obsidian-tasks/parse-task-fields";
import { toPlainDate } from "@/lib/temporal/plain-date";

export interface TaskDateInputProps {
    symbol?: VNode;
    field: TaskDateField;
    task: Task;
}

export function TaskDateInput({ symbol, field, task }: TaskDateInputProps) {
    const {
        [field]: fieldValue,
        location: { filePath, fileStartByte, fileStopByte },
    } = task;
    const { obsidian } = usePluginContext();
    const [disabled, setDisabled] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const onInput = useEventCallback((event: Event) => {
        const { value } = event.currentTarget as HTMLInputElement;
        if (filePath !== undefined && !disabled && toPlainDate(value)) {
            event.preventDefault();
            const process = (text: string) => writeEmojiTaskField(text, field, value);
            setDisabled(true);
            obsidian
                .processFileRange(filePath, fileStartByte, fileStopByte, process)
                .catch((error: unknown) => {
                    console.error(error);
                })
                .finally(() => {
                    setDisabled(false);
                });
        }
    });

    const onClick = useEventCallback(() => {
        inputRef.current?.showPicker();
    });

    if (field === "scheduledDate" || fieldValue) {
        return (
            <div class="relative date-input" onClick={onClick}>
                <div class="icon">{symbol}</div>
                <span class="label">{fieldValue?.toString() ?? "todo"}</span>
                <input
                    ref={inputRef}
                    aria-label={`Set ${lowerCase(field)}`}
                    type="date"
                    value={fieldValue?.toString() ?? ""}
                    disabled={disabled}
                    onInput={onInput}
                />
            </div>
        );
    }
    return null;
}
