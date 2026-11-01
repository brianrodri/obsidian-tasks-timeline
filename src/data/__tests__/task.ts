import mapValues from "lodash/mapValues";
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

    it("uses untested date", () => {
        const { doneDate } = Task.create({ doneDate: UNTESTED_DATE });
        expect(doneDate).toEqual(UNTESTED_DATE);
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
        [{ createdDate: "2024-10-24" }, "createdDate"],
    ])("happens on %s when task defines exactly %j", (isoDates, expected) => {
        const dates = mapValues(isoDates, (d) => Temporal.PlainDate.from(d));
        const { happensDate } = Task.create(dates);
        const expectedDate = isoDates[expected as keyof typeof isoDates];
        expect(happensDate).toEqual(Temporal.PlainDate.from(expectedDate));
    });
});
