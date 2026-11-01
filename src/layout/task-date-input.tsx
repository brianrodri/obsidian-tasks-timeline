import { useSignal } from "@preact/signals";
import { lowerCase } from "lodash";
import type { VNode } from "preact";
import { useRef } from "preact/hooks";

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
    const disabled = useSignal(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const onInput = (event: Event) => {
        const { value, valueAsDate } = event.currentTarget as HTMLInputElement;
        if (disabled.value) return;
        if (valueAsDate === null) return;
        event.preventDefault();
        disabled.value = true;
        actions
            .setTaskDate(task, field, value)
            .catch((error: unknown) => {
                // The task did not change, so nothing re-renders the input: put its value back by hand.
                if (inputRef.current) inputRef.current.value = fieldValue?.toString() ?? "";
                obsidian.reportError(`Failed to set the ${lowerCase(field)}`, error);
            })
            .finally(() => (disabled.value = false));
    };

    const onClick = () => {
        inputRef.current?.showPicker();
    };

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
