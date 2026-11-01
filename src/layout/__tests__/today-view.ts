import { describe, expect, it } from "vitest";

import { toRelativeCalendar } from "../today-view";

describe("toRelativeCalendar", () => {
    const base = Temporal.PlainDate.from("2024-10-25");

    it.each([
        ["2024-10-25", "today"],
        ["2024-10-26", "tomorrow"],
        ["2024-10-24", "yesterday"],
        ["2024-10-30", "in 5 days"],
        ["2024-10-01", "24 days ago"],
        ["2024-11-02", "next month"],
        ["2024-12-31", "in 2 months"],
        ["2024-09-30", "last month"],
        ["2025-01-02", "next year"],
        ["2022-03-01", "2 years ago"],
    ])("formats %s as %j", (iso, expected) => {
        expect(toRelativeCalendar(Temporal.PlainDate.from(iso), base, "en-US")).toEqual(expected);
    });
});
