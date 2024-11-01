import { groupBy } from "lodash";
import { DateTime } from "luxon";
import { PickByValue, ValuesType } from "utility-types";

import { TaskFields } from "@/data/task";
import { pairwise } from "@/utils/iter-utils";

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

const EMOJIS_BY_FIELD_KEY = groupBy(
    Object.keys(FIELD_KEY_BY_EMOJI) as Emoji[],
    (emoji) => FIELD_KEY_BY_EMOJI[emoji] as FieldKey,
);

type Emoji = keyof typeof FIELD_KEY_BY_EMOJI;
type PriorityEmoji = keyof typeof PRIORITY_BY_EMOJI;
type FieldKey = ValuesType<typeof FIELD_KEY_BY_EMOJI>;

export function readEmojiTaskFields(text: string): Partial<TaskFields> {
    const matches = [
        ...text.matchAll(new RegExp(Object.keys(FIELD_KEY_BY_EMOJI).join("|"), "g")),
        /$/.exec(text) as RegExpExecArray,
    ];

    const result: Partial<TaskFields> = { description: text.slice(0, matches[0].index).trim() };

    for (const [start, stop] of pairwise(matches)) {
        const emoji = start[0] as Emoji;
        const fieldKey = FIELD_KEY_BY_EMOJI[emoji] as FieldKey;
        const fieldValue = text.slice(start.index + emoji.length, stop.index).trim();
        if (fieldKey) {
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
        }
    }

    return result;
}

export function writeEmojiTaskField(text: string, fieldKey: FieldKey, value: string): string {
    const emojis = EMOJIS_BY_FIELD_KEY[fieldKey];
    if (!emojis) {
        return text;
    }

    const [start, stop] = [...text.matchAll(new RegExp(emojis.join("|"), "g")), /$/.exec(text) as RegExpExecArray];
    if (start && stop) {
        return `${text.slice(0, start.index + start[0].length)} ${value} ${text.slice(stop.index)}`;
    }

    const trailingWhitespaceStart = /\s*$/.exec(text)?.index ?? text.length;
    return `${text.slice(0, trailingWhitespaceStart)} ${emojis[0]} ${value}${text.slice(trailingWhitespaceStart)}`;
}
