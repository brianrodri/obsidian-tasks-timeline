import { chunk, escapeRegExp, uniq } from "lodash";
import { DateTime } from "luxon";

import { Task } from "../../models/tasks/task";
import { TaskFields } from "../../models/tasks/task-fields";
import { splitAtRegExp } from "../../utils/regexp-utils";

export function parseTask(text: string): Task {
    const symbolRegExp = RegExp(uniq(TASK_FIELD_SYMBOLS.values().toArray().flat()).map(escapeRegExp).join("|"), "g");
    const [description, ...symbolValuePairs] = splitAtRegExp(text, symbolRegExp);
    const rawEntries = [["description", description], ...chunk(symbolValuePairs, 2)];

    return Task.fromFields(
        Object.fromEntries(
            rawEntries.map(([symbol, value]) => {
                const [fieldName = "description"] = TASK_FIELD_SYMBOLS.entries()
                    .filter(([, symbols]) => symbols.includes(symbol))
                    .map(([fieldName]) => fieldName)
                    .take(1);

                switch (fieldName) {
                    case "description":
                    case "recurrenceRule":
                        return [fieldName, value.trim()];
                    case "priority":
                        return [fieldName, PRIORITY_SYMBOL_VALUES.get(symbol)];
                    case "cancelledDate":
                    case "createdDate":
                    case "doneDate":
                    case "dueDate":
                    case "scheduledDate":
                    case "startDate":
                        return [fieldName, DateTime.fromISO(value.trim())];
                }
            }),
        ),
    );
}

const TASK_FIELD_SYMBOLS: ReadonlyMap<keyof TaskFields, string[]> = new Map([
    ["createdDate", ["➕"]],
    ["scheduledDate", ["⌛", "⏳"]],
    ["startDate", ["🛫"]],
    ["dueDate", ["📅"]],
    ["doneDate", ["✅"]],
    ["cancelledDate", ["❌"]],
    ["recurrenceRule", ["🔁"]],
    ["priority", ["⏬", "🔽", "🔼", "⏫", "🔺"]],
]);

const PRIORITY_SYMBOL_VALUES: ReadonlyMap<string, number> = new Map([
    ["🔺", 0],
    ["⏫", 1],
    ["🔼", 2],
    ["🔽", 4],
    ["⏬", 5],
]);
