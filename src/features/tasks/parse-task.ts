import { Dictionary, escapeRegExp } from "lodash";
import { DateTime } from "luxon";

export interface ExtractTaskMetadataResponse {
    description: string;
    overdue?: boolean;
    createdDate?: DateTime<true> | undefined;
    scheduledDate?: DateTime<true> | undefined;
    startDate?: DateTime<true> | undefined;
    dueDate?: DateTime<true> | undefined;
    doneDate?: DateTime<true> | undefined;
    cancelledDate?: DateTime<true> | undefined;
    rrule?: string;
    onCompletion?: string;
    taskId?: string;
    taskDependsOn?: string[];
    priority?: string;
}

export function extractTaskMetadata(
    text: string,
    tags: string[],
    now = DateTime.now().startOf("day"),
): ExtractTaskMetadataResponse {
    const {
        createdDate,
        scheduledDate,
        startDate,
        dueDate,
        doneDate,
        cancelledDate,
        priority,
        taskDependsOn,
        ...rest
    } = extractTaskRawMetadata(text, tags);

    const response: ExtractTaskMetadataResponse = {
        createdDate: getValidDateTime(createdDate),
        scheduledDate: getValidDateTime(scheduledDate),
        startDate: getValidDateTime(startDate),
        dueDate: getValidDateTime(dueDate),
        doneDate: getValidDateTime(doneDate),
        cancelledDate: getValidDateTime(cancelledDate),
        priority: priority ? `P${PRIORITY_VALUE[priority]}` : undefined,
        taskDependsOn: taskDependsOn?.split(",").map((id) => id.trim()),
        ...rest,
    };

    if (response.dueDate) {
        response.overdue = Math.floor(response.dueDate.diff(now).as("days")) < 0;
    }

    return response;
}

type ExtractTaskRawMetadataResponse = { [K in keyof Omit<ExtractTaskMetadataResponse, "overdue">]: string };

export function extractTaskRawMetadata(text: string, tags: string[]): ExtractTaskRawMetadataResponse {
    const tagsPattern = new RegExp(tags.map(escapeRegExp).join("|"), "g");
    text = text.replace(tagsPattern, "");

    const [emojiStart, ...emojiEnds] = [
        ...Array.from(text.matchAll(EMOJI_PATTERN)).map((match) => ({ index: match.index, emoji: match[0] })),
        { index: text.length, emoji: "" },
    ];

    const result: ExtractTaskRawMetadataResponse = { description: text.slice(0, emojiStart.index).trim() };

    let start = emojiStart;
    for (const end of emojiEnds) {
        const key = EMOJI_KEY_MAP[start.emoji];
        if (key) {
            result[key] = text.slice(start.index + start.emoji.length, end.index).trim() || start.emoji;
        }
        start = end;
    }

    return result;
}

function getValidDateTime(isoDate?: string) {
    if (!isoDate) return undefined;
    const date = DateTime.fromISO(isoDate);
    return date.isValid ? date : undefined;
}

const PRIORITY_VALUE: Readonly<Dictionary<number>> = {
    "🔺": 0,
    "⏫": 1,
    "🔼": 2,
    "🔽": 4,
    "⏬": 5,
};

const EMOJI_KEY_MAP: Readonly<Dictionary<keyof ExtractTaskRawMetadataResponse>> = {
    "➕": "createdDate",
    "⌛": "scheduledDate",
    "⏳": "scheduledDate",
    "🛫": "startDate",
    "📅": "dueDate",
    "✅": "doneDate",
    "❌": "cancelledDate",
    "🔁": "rrule",
    "🏁": "onCompletion",
    "🆔": "taskId",
    "⛔": "taskDependsOn",
    "⏬": "priority",
    "🔽": "priority",
    "🔼": "priority",
    "⏫": "priority",
    "🔺": "priority",
} as const;

const EMOJI_PATTERN = new RegExp(Object.keys(EMOJI_KEY_MAP).map(escapeRegExp).join("|"), "g");
