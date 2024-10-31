import { join } from "lodash";
import { DateTime } from "luxon";

import { TaskFields } from "@/data/task";
import { pairwise } from "@/utils/iter-utils";

const FIELD_KEY_BY_EMOJI = new Map([
    ["➕", "createdDate"],
    ["⌛", "scheduledDate"],
    ["⏳", "scheduledDate"],
    ["🛫", "startDate"],
    ["📅", "dueDate"],
    ["✅", "doneDate"],
    ["❌", "cancelledDate"],
    ["🔁", "recurrenceRule"],
    ["🔺", "priority"],
    ["⏫", "priority"],
    ["🔼", "priority"],
    ["🔽", "priority"],
    ["⏬", "priority"],
] as const);

const PRIORITY_BY_EMOJI = new Map([
    ["🔺", 0],
    ["⏫", 1],
    ["🔼", 2],
    ["🔽", 4],
    ["⏬", 5],
] as const);

const EMOJIS_BY_FIELD_KEY = Map.groupBy(FIELD_KEY_BY_EMOJI.keys(), (key) => FIELD_KEY_BY_EMOJI.get(key) as FieldKey);

type Emoji = typeof FIELD_KEY_BY_EMOJI extends ReadonlyMap<infer K, string> ? K : never;
type FieldKey = typeof FIELD_KEY_BY_EMOJI extends ReadonlyMap<string, infer V> ? V : never;
type PriorityEmoji = typeof PRIORITY_BY_EMOJI extends ReadonlyMap<infer K, number> ? K : never;

export function readEmojiTaskFields(text: string): Partial<TaskFields> {
    const matches = [
        ...text.matchAll(new RegExp(join(FIELD_KEY_BY_EMOJI.keys().toArray(), "|"), "g")),
        /$/.exec(text) as RegExpExecArray,
    ];

    const result: Partial<TaskFields> = { description: text.slice(0, matches[0].index).trim() };

    for (const [start, stop] of pairwise(matches)) {
        const emoji = start[0] as Emoji;
        const fieldKey = FIELD_KEY_BY_EMOJI.get(emoji) as FieldKey;
        if (fieldKey) {
            switch (fieldKey) {
                case "priority":
                    result[fieldKey] = PRIORITY_BY_EMOJI.get(emoji as PriorityEmoji);
                    break;
                case "createdDate":
                case "cancelledDate":
                case "doneDate":
                case "dueDate":
                case "startDate":
                case "scheduledDate":
                    result[fieldKey] = DateTime.fromISO(text.slice(start.index + emoji.length, stop.index).trim());
                    break;
                default:
                    result[fieldKey] = text.slice(start.index + emoji.length, stop.index).trim();
                    break;
            }
        }
    }

    return result;
}

export function writeEmojiTaskField(text: string, fieldKey: FieldKey, value: string): string {
    const emojis = EMOJIS_BY_FIELD_KEY.get(fieldKey);
    if (!emojis) {
        return text;
    }

    const [start, stop] = [...text.matchAll(new RegExp(join(emojis, "|"), "g")), /$/.exec(text) as RegExpExecArray];
    if (start && stop) {
        return `${text.slice(0, start.index + start[0].length)} ${value} ${text.slice(stop.index)}`;
    }

    const trailingWhitespaceStart = /\s*$/.exec(text)?.index ?? text.length;
    return `${text.slice(0, trailingWhitespaceStart)} ${emojis[0]} ${value}${text.slice(trailingWhitespaceStart)}`;
}
