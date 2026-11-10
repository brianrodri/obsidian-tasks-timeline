import { lowerCase } from "lodash";
import type { VNode } from "preact";
import { useRef, useState } from "preact/hooks";
import { useEventCallback } from "usehooks-ts";

import { useAppContext } from "@/context/app-context";
import type { Task, TaskDateField } from "@/data/task";

export interface TaskDateInputProps {
    symbol?: VNode;
    field: TaskDateField;
    task: Task;
}

/**
 * Renders the task's `field` date with a date picker. Picking a date writes it to the task's file.
 *
 * Renders nothing when the task has no such date, except for the scheduled date, which reads "todo" when unset. The
 * input is disabled while a write is pending. A failed write is reported to the user.
 */
export function TaskDateInput({ symbol, field, task }: TaskDateInputProps) {
    const fieldValue = task[field];
    const { actions, obsidian } = useAppContext();
    const [disabled, setDisabled] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const onInput = useEventCallback((event: Event) => {
        const { value, valueAsDate } = event.currentTarget as HTMLInputElement;
        if (disabled) return;
        if (valueAsDate === null) return;
        event.preventDefault();
        setDisabled(true);
        actions
            .setTaskDate(task, field, value)
            .catch((error: unknown) => {
                obsidian.reportError(`Failed to set the ${lowerCase(field)}`, error);
            })
            .finally(() => {
                setDisabled(false);
            });
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
