import { describe, expect, it } from "vitest";

import { Task } from "../task";

const EMPTY = Task.create({});
const VALID_DATE = Temporal.Now.plainDateISO();
const UNTESTED_DATE = Temporal.PlainDate.from("2024-10-26");

describe("Task", () => {
    it("uses valid date", () => {
        const { cancelledDate } = Task.create({ cancelledDate: VALID_DATE });
        expect(cancelledDate).toEqual(VALID_DATE);
    });

    it.each([
        ["an ISO date", "2024-10-26"],
        ["an ISO date and time", "2024-10-26T13:00"],
        ["a property bag", { year: 2024, month: 10, day: 26 }],
    ])("validates %s", (_, dueDate) => {
        expect(Task.create({ dueDate }).dueDate).toEqual(UNTESTED_DATE);
    });

    it.each([
        ["null", null],
        ["text that is not a date", "tomorrow"],
        ["an ISO date that does not exist", "2024-02-31"],
        ["a property bag that does not exist", { year: 2024, month: 2, day: 31 }],
    ])("drops %s", (_, dueDate) => {
        expect(Task.create({ dueDate }).dueDate).toBeUndefined();
    });

    it("can be converted to and from itself", () => {
        const fields = EMPTY;
        const copy = Task.create(fields);
        expect(copy).toEqual(EMPTY);
        expect(copy).toEqual(fields);
    });

    it.each([
        [{ doneDate: "2024-10-30", cancelledDate: "2024-10-31", dueDate: "2024-10-01" }, "doneDate"],
        [{ scheduledDate: "2024-10-26", startDate: "2024-10-27", dueDate: "2024-10-28" }, "startDate"],
        [{ scheduledDate: "2024-10-26", startDate: "2024-10-27", dueDate: "2024-10-25" }, "dueDate"],
        [{ scheduledDate: "2024-10-26", dueDate: "2024-10-25" }, "dueDate"],
        [{ startDate: "2024-10-27", dueDate: "2024-10-28" }, "startDate"],
        [{ cancelledDate: "2024-10-31", dueDate: "2024-10-01" }, "cancelledDate"],
        [{ scheduledDate: "2024-10-26", startDate: "2024-10-27" }, "startDate"],
        [{ scheduledDate: "2024-10-28", startDate: "2024-10-27" }, "scheduledDate"],
        [{ scheduledDate: "2024-10-26", createdDate: "2024-10-24" }, "scheduledDate"],
        [{ startDate: "2024-10-27", createdDate: "2024-10-24" }, "startDate"],
        [{ dueDate: "2024-10-28", createdDate: "2024-10-24" }, "dueDate"],
        [{ createdDate: "2024-10-24" }, "createdDate"],
    ])("happens on %s when task defines exactly %j", (isoDates, expected) => {
        const { happensDate } = Task.create(isoDates);
        const expectedDate = isoDates[expected as keyof typeof isoDates];
        expect(happensDate).toEqual(Temporal.PlainDate.from(expectedDate));
    });
});
