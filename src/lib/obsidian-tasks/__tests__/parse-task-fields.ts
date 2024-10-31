import { DateTime } from "luxon";
import { describe, expect, it } from "vitest";

import { readEmojiTaskFields } from "../parse-task-fields";

describe("parseText", () => {
    it.each([
        [{ description: "task text" }, " \t task text \t "],
        [{ priority: 0 }, "🔺"],
        [{ priority: 1 }, "⏫"],
        [{ priority: 2 }, "🔼"],
        [{ priority: 4 }, "🔽"],
        [{ priority: 5 }, "⏬"],
        [{ recurrenceRule: "every day" }, "🔁 every day"],
        [{ createdDate: DateTime.fromISO("2024-10-25") }, "➕ 2024-10-25"],
        [{ scheduledDate: DateTime.fromISO("2024-10-26") }, "⏳ 2024-10-26"],
        [{ scheduledDate: DateTime.fromISO("2024-10-27") }, "⏳ 2024-10-27"],
        [{ startDate: DateTime.fromISO("2024-10-28") }, "🛫 2024-10-28"],
        [{ dueDate: DateTime.fromISO("2024-10-29") }, "📅 2024-10-29"],
        [{ doneDate: DateTime.fromISO("2024-10-30") }, "✅ 2024-10-30"],
        [{ cancelledDate: DateTime.fromISO("2024-10-31") }, "❌ 2024-10-31"],
    ])("parses %j from input=%j", (expectedPart, inputText) => {
        expect(readEmojiTaskFields(inputText)).toEqual(expect.objectContaining(expectedPart));
    });

    it("parses sequential fields", () => {
        expect(
            readEmojiTaskFields(`
                TODO ⏫ 🔁 every day ➕ 2024-10-25 ⏳ 2024-10-26 🛫 2024-10-27 📅 2024-10-28 ✅ 2024-10-29 ❌ 2024-10-30
            `),
        ).toEqual(
            expect.objectContaining({
                description: "TODO",
                priority: 1,
                recurrenceRule: "every day",
                createdDate: DateTime.fromISO("2024-10-25"),
                scheduledDate: DateTime.fromISO("2024-10-26"),
                startDate: DateTime.fromISO("2024-10-27"),
                dueDate: DateTime.fromISO("2024-10-28"),
                doneDate: DateTime.fromISO("2024-10-29"),
                cancelledDate: DateTime.fromISO("2024-10-30"),
            }),
        );
    });
});
