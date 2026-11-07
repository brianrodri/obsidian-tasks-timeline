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
