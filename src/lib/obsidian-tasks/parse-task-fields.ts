import { groupBy } from "lodash";
import { DateTime } from "luxon";
import type { PickByValue, ValuesType } from "utility-types";

import type { TaskFields } from "@/data/task";

const FIELD_KEY_BY_EMOJI = {
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
    "⛔": "dependsOn",
    "🆔": "id",
} as const satisfies Record<string, keyof TaskFields>;

const PRIORITY_BY_EMOJI = {
    "🔺": 0,
    "⏫": 1,
    "🔼": 2,
    "🔽": 4,
    "⏬": 5,
} as const satisfies Record<keyof PickByValue<typeof FIELD_KEY_BY_EMOJI, "priority">, number>;

const EMOJI_PATTERN = new RegExp(Object.keys(FIELD_KEY_BY_EMOJI).join("|"), "g");

const EMOJIS_BY_FIELD_KEY: Partial<Record<FieldKey, readonly Emoji[]>> = groupBy(
    Object.keys(FIELD_KEY_BY_EMOJI) as Emoji[],
    (emoji) => FIELD_KEY_BY_EMOJI[emoji],
);

type Emoji = keyof typeof FIELD_KEY_BY_EMOJI;
type PriorityEmoji = keyof typeof PRIORITY_BY_EMOJI;
type FieldKey = ValuesType<typeof FIELD_KEY_BY_EMOJI>;

export function readEmojiTaskFields(text: string): Partial<TaskFields> {
    const matches = [...text.matchAll(EMOJI_PATTERN)];
    const result: Partial<TaskFields> = { description: text.slice(0, matches[0]?.index ?? text.length).trim() };

    matches.forEach((match, i) => {
        const emoji = match[0] as Emoji;
        const fieldKey = FIELD_KEY_BY_EMOJI[emoji];
        const fieldValue = text.slice(match.index + emoji.length, matches[i + 1]?.index ?? text.length).trim();
        switch (fieldKey) {
            case "priority":
                result[fieldKey] = PRIORITY_BY_EMOJI[emoji as PriorityEmoji];
                break;
            case "createdDate":
            case "cancelledDate":
            case "doneDate":
            case "dueDate":
            case "startDate":
            case "scheduledDate":
                result[fieldKey] = DateTime.fromISO(fieldValue);
                break;
            case "dependsOn":
                result[fieldKey] = new Set(fieldValue.split(",").map((id) => id.trim()));
                break;
            default:
                result[fieldKey] = fieldValue;
                break;
        }
    });

    return result;
}

export function writeEmojiTaskField(text: string, fieldKey: FieldKey, value: string): string {
    const [primaryEmoji, ...otherEmojis] = EMOJIS_BY_FIELD_KEY[fieldKey] ?? [];
    if (!primaryEmoji) {
        return text;
    }

    const [start, next] = [...text.matchAll(new RegExp([primaryEmoji, ...otherEmojis].join("|"), "g"))];
    if (start) {
        const stop = next?.index ?? text.length;
        return `${text.slice(0, start.index + start[0].length)} ${value} ${text.slice(stop)}`;
    }

    const trailingWhitespaceStart = /\s*$/.exec(text)?.index ?? text.length;
    return `${text.slice(0, trailingWhitespaceStart)} ${primaryEmoji} ${value}${text.slice(trailingWhitespaceStart)}`;
}
