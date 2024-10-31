import { useSignal } from "@preact/signals";
import { lowerCase } from "lodash";
import { DateTime } from "luxon";
import { VNode } from "preact";
import { useEventCallback } from "usehooks-ts";

import { usePluginContext } from "@/context/plugin-context";
import { Task } from "@/data/task";
import { updateEmojiTaskField } from "@/lib/obsidian-tasks/parse-task-fields";
import { KeysWithValueOf } from "@/utils/type-utils";

type DateFields = KeysWithValueOf<Omit<Task, "happensDate">, DateTime>;

export type TaskDateInputProps = {
    symbol?: VNode;
    field: DateFields;
    task: Task;
};

export function TaskDateInput({ symbol, field, task }: TaskDateInputProps) {
    const { obsidian } = usePluginContext();
    const {
        [field]: date,
        location: { filePath, fileStartByte, fileStopByte },
    } = task;
    const waiting = useSignal(false);

    const setDate = useEventCallback((newDate: DateTime) => {
        if (filePath === undefined || !newDate.isValid || waiting.value) return;
        waiting.value = true;
        const process = (text: string) => updateEmojiTaskField(text, field, () => newDate);
        obsidian
            .processFileRange(filePath, fileStartByte, fileStopByte, process)
            .catch((error) => console.error(error))
            .finally(() => (waiting.value = false));
    });

    if (date.isValid || field === "scheduledDate") {
        return (
            <div class="relative">
                <label class="dateInput">
                    <div class="icon">{symbol}</div>
                    <input
                        aria-label={`Set ${lowerCase(field)}`}
                        type="date"
                        value={date.toISODate() ?? ""}
                        disabled={waiting.value}
                        onInput={(event) => setDate(DateTime.fromISO(event.currentTarget.value))}
                    />
                </label>
                <span class="label">{date.toISODate() ?? "todo"}</span>
            </div>
        );
    }
    return null;
}
