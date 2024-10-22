import { DateTime } from "luxon";
import { describe, expect, it } from "vitest";

import { TaskFields } from "../../../models/tasks/task-fields";
import { parseTask } from "../parse-task";

const TEST_CASES: [sourceText: string, parsedResult: Partial<TaskFields>][] = [
    // Description
    ["task text", { description: "task text" }],
    // Priority
    ["", { priority: 3 }], // Default value when omitted
    ["⏬", { priority: 5 }],
    ["🔽", { priority: 4 }],
    ["🔼", { priority: 2 }],
    ["⏫", { priority: 1 }],
    ["🔺", { priority: 0 }],
    // Recurrence Rule
    ["🔁 every day when done", { recurrenceRule: "every day when done" }],
    // Dates
    ["➕ 2024-10-25", { createdDate: DateTime.fromISO("2024-10-25") }],
    ["⏳ 2024-10-26", { scheduledDate: DateTime.fromISO("2024-10-26") }],
    ["⏳ 2024-10-26", { scheduledDate: DateTime.fromISO("2024-10-26") }],
    ["🛫 2024-10-27", { startDate: DateTime.fromISO("2024-10-27") }],
    ["📅 2024-10-28", { dueDate: DateTime.fromISO("2024-10-28") }],
    ["✅ 2024-10-29", { doneDate: DateTime.fromISO("2024-10-29") }],
    ["❌ 2024-10-30", { cancelledDate: DateTime.fromISO("2024-10-30") }],
];

describe("parseText", () => {
    it.each(TEST_CASES)('parses "%s" and extracts %s="%s"', (sourceText, parsedResult) => {
        expect(parseTask(sourceText)).toEqual(expect.objectContaining(parsedResult));
    });
});
