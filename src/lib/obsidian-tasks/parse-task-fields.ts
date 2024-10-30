import { chunk, escapeRegExp, invert } from "lodash";
import { DateTime } from "luxon";

import { TaskFields } from "@/data/task";
import { pairwise } from "@/utils/iter-utils";
import { splitAtRegExp } from "@/utils/regexp-utils";
import { KeysWithValueOf } from "@/utils/type-utils";

export function parseEmojiTaskFields(text: string): Partial<TaskFields> {
    const [description, ...symbolValuePairs] = splitAtRegExp(text, TASK_FIELD_SYMBOL_PATTERN);

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

export function updateEmojiTaskField<K extends KeysWithValueOf<TaskFields, DateTime>>(
    text: string,
    key: K,
    process: (old: DateTime) => DateTime,
): string {
    const matches = [...text.matchAll(TASK_FIELD_SYMBOL_PATTERN), /$/.exec(text) as RegExpExecArray];

    for (const [match, nextMatch] of pairwise(matches)) {
        // Process if found
        const symbol = match[0] as keyof TaskFieldKeyBySymbol;
        if (TASK_FIELD_KEY_BY_SYMBOL[symbol] === key) {
            const value = DateTime.fromISO(text.slice(match.index + symbol.length, nextMatch.index).trim());

            return `${text.slice(0, match.index)}${symbol} ${process(value).toISODate()} ${text.slice(nextMatch.index)}`;
        }
    }

    // Append if missing
    const symbol = SYMBOL_BY_TASK_FIELD_KEY[key];
    const trailingWhitespaceStart = /\s*$/.exec(text)?.index ?? text.length;
    return `${text.slice(0, trailingWhitespaceStart)} ${symbol} ${DateTime.now().toISODate()}${text.slice(trailingWhitespaceStart)}`;
}

export const TASK_FIELD_KEY_BY_SYMBOL = {
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

export const SYMBOL_BY_TASK_FIELD_KEY = invert(TASK_FIELD_KEY_BY_SYMBOL);

const TASK_FIELD_SYMBOL_PATTERN = new RegExp(Object.keys(TASK_FIELD_KEY_BY_SYMBOL).map(escapeRegExp).join("|"), "g");

type TaskFieldKeyBySymbol = typeof TASK_FIELD_KEY_BY_SYMBOL;

const PRIORITY_VALUE_BY_SYMBOL = {
    "🔺": 0,
    "⏫": 1,
    "🔼": 2,
    "🔽": 4,
    "⏬": 5,
} as const satisfies Record<KeysWithValueOf<TaskFieldKeyBySymbol, "priority">, number>;
