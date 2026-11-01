import { describe, expect, it } from "vitest";

import { toPlainDate } from "../plain-date";

describe("toPlainDate", () => {
    const expected = Temporal.PlainDate.from("2024-10-25");

    it.each<[string, Temporal.PlainDateLike]>([
        ["an ISO date", "2024-10-25"],
        ["a PlainDate", expected],
        ["a PlainDateTime", Temporal.PlainDateTime.from("2024-10-25T13:00")],
        ["a property bag", { year: 2024, month: 10, day: 25 }],
    ])("validates %s", (_, value) => {
        expect(toPlainDate(value)).toEqual(expected);
    });

    it.each<[string, Temporal.PlainDateLike | null | undefined]>([
        ["undefined", undefined],
        ["null", null],
        ["text that is not a date", "tomorrow"],
        ["an ISO date that does not exist", "2024-02-31"],
        ["a property bag that does not exist", { year: 2024, month: 2, day: 31 }],
    ])("rejects %s", (_, value) => {
        expect(toPlainDate(value)).toBeUndefined();
    });
});
