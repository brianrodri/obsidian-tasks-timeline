import { describe, expect, it } from "vitest";

import { Task, type TaskInput, type TaskLocation } from "../task";

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

    it("keeps the custom status of a custom task", () => {
        expect(Task.create({ status: "CUSTOM", customStatus: "?" }).customStatus).toEqual("?");
        expect(Task.create({ status: "OPEN", customStatus: "?" }).customStatus).toBeUndefined();
    });

    describe("identity", () => {
        const at = (fileLine: number, id?: string) =>
            Task.create({ id, location: { filePath: "a.md", fileLine, fileStartByte: 0, fileStopByte: 0 } });

        it("follows the task's id when it has one, wherever the line moves", () => {
            expect(at(1, "abc").identity).toEqual(at(9, "abc").identity);
            expect(at(1, "abc").identity).not.toEqual(at(1, "xyz").identity);
        });

        it("follows the task's line when it has no id", () => {
            expect(at(1).identity).toEqual(at(1).identity);
            expect(at(1).identity).not.toEqual(at(2).identity);
        });

        it("differs between files", () => {
            const other = Task.create({ id: "abc", location: { filePath: "b.md", fileStartByte: 0, fileStopByte: 0 } });
            expect(at(1, "abc").identity).not.toEqual(other.identity);
        });

        it("does not mistake an id for a line number", () => {
            expect(at(1, "1").identity).not.toEqual(at(1).identity);
        });
    });

    describe("equals", () => {
        const LOCATION: TaskLocation = {
            filePath: "notes/a.md",
            fileName: "a",
            fileSection: "Heading",
            fileLine: 3,
            fileStartByte: 10,
            fileStopByte: 20,
            obsidianHref: "[[a#Heading]]",
        };
        const FIELDS: TaskInput = {
            status: "OPEN",
            description: "do it",
            priority: 2,
            recurrenceRule: "every day",
            cancelledDate: "2024-10-20",
            createdDate: "2024-10-21",
            doneDate: "2024-10-22",
            dueDate: "2024-10-23",
            scheduledDate: "2024-10-24",
            startDate: "2024-10-25",
            tags: new Set(["#a", "#b"]),
            location: LOCATION,
            id: "abc",
            dependsOn: new Set(["x", "y"]),
        };
        const BASE = Task.create(FIELDS);

        /** Each row: the field, a change to only that field, and (optionally) what to change it from. */
        const CHANGES: [string, TaskInput, TaskInput?][] = [
            ["status", { status: "DONE" }],
            ["customStatus", { status: "CUSTOM", customStatus: "?" }, { status: "CUSTOM", customStatus: "!" }],
            ["description", { description: "do that" }],
            ["priority", { priority: 1 }],
            ["recurrenceRule", { recurrenceRule: "every week" }],
            ["cancelledDate", { cancelledDate: "2024-11-20" }],
            ["createdDate", { createdDate: "2024-11-21" }],
            ["doneDate", { doneDate: undefined }],
            ["dueDate", { dueDate: "2024-11-23" }],
            ["scheduledDate", { scheduledDate: "2024-11-24" }],
            ["startDate", { startDate: "2024-11-25" }],
            ["tags", { tags: new Set(["#a"]) }],
            ["location", { location: { ...LOCATION, fileStartByte: 11 } }],
            ["id", { id: "abd" }],
            ["dependsOn", { dependsOn: new Set(["x", "z"]) }],
        ];

        it("covers every field of a task", () => {
            expect(CHANGES.map(([field]) => field).sort()).toEqual(Object.keys(BASE).sort());
        });

        it.each(CHANGES)("is false when only %s differs", (_, change, from = {}) => {
            const before = Task.create({ ...FIELDS, ...from });
            const after = Task.create({ ...FIELDS, ...from, ...change });
            expect(before.equals(after)).toBe(false);
            expect(after.equals(before)).toBe(false);
        });

        it.each(Object.keys(LOCATION))("is false when only location.%s differs", (key) => {
            const location = { ...LOCATION, [key]: key.endsWith("Byte") || key === "fileLine" ? 99 : "other" };
            expect(BASE.equals(Task.create({ ...FIELDS, location }))).toBe(false);
        });

        it("is true for identical fields", () => {
            expect(BASE.equals(Task.create(FIELDS))).toBe(true);
            expect(Task.create({}).equals(Task.create({}))).toBe(true);
        });

        it("is true for sets with the same members in a different order", () => {
            const reordered = { ...FIELDS, tags: new Set(["#b", "#a"]), dependsOn: new Set(["y", "x"]) };
            expect(BASE.equals(Task.create(reordered))).toBe(true);
        });
    });
});
