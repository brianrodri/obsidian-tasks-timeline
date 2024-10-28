import { chunk, escapeRegExp } from "lodash";
import { DateTime } from "luxon";

import { TaskFields } from "@/data/task";
import { splitAtRegExp } from "@/utils/regexp-utils";
import { KeysWithValueOf } from "@/utils/type-utils";

export function parseEmojiTaskFields(text: string): Partial<TaskFields> {
    const anySymbolsPattern = new RegExp(Object.keys(TASK_FIELD_KEY_BY_SYMBOL).map(escapeRegExp).join("|"), "g");
    const [description, ...symbolValuePairs] = splitAtRegExp(text, anySymbolsPattern);

    const rawEntries = chunk(symbolValuePairs, 2).map(([symbol, value]) => {
        const key = TASK_FIELD_KEY_BY_SYMBOL[symbol as keyof TaskFieldKeyBySymbol];
        switch (key) {
            case "priority":
                // TODO: Why can't TypeScript figure this out on its own?
                return ["priority", symbol as KeysWithValueOf<TaskFieldKeyBySymbol, "priority">] as const;
            default:
                return [key, value.trim()] as const;
        }
    });

    return Object.fromEntries([
        ["description", description.trim()],
        ...rawEntries.map(([key, rawValue]) => {
            switch (key) {
                case "recurrenceRule":
                    return [key, rawValue];
                case "priority":
                    return [key, PRIORITY_VALUE_BY_SYMBOL[rawValue]];
                case "cancelledDate":
                case "createdDate":
                case "doneDate":
                case "dueDate":
                case "scheduledDate":
                case "startDate":
                    return [key, DateTime.fromISO(rawValue)];
            }
        }),
    ]);
}

const TASK_FIELD_KEY_BY_SYMBOL = {
    "➕": "createdDate",
    "⌛": "scheduledDate",
    "⏳": "scheduledDate",
    "🛫": "startDate",
    "📅": "dueDate",
    "✅": "doneDate",
    "❌": "cancelledDate",
    "🔁": "recurrenceRule",
    "🔺": "priority",
    "⏫": "priority",
    "🔼": "priority",
    "🔽": "priority",
    "⏬": "priority",
} as const satisfies Record<string, keyof TaskFields>;

type TaskFieldKeyBySymbol = typeof TASK_FIELD_KEY_BY_SYMBOL;

const PRIORITY_VALUE_BY_SYMBOL = {
    "🔺": 0,
    "⏫": 1,
    "🔼": 2,
    "🔽": 4,
    "⏬": 5,
} as const satisfies Record<KeysWithValueOf<TaskFieldKeyBySymbol, "priority">, number>;
