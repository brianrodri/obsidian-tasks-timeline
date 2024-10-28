import { DateTime } from "luxon";
import { describe, expect, it } from "vitest";

import { Task } from "../task";

const EMPTY = Task.create({});
const VALID_DATE = DateTime.now();
const INVALID_DATE = DateTime.invalid("uh-oh");
const UNTESTED_DATE = DateTime.fromISO("2024-10-26");

describe("Task", () => {
    it("uses valid date", () => {
        const { cancelledDate } = Task.create({ cancelledDate: VALID_DATE });
        expect(cancelledDate).toEqual(VALID_DATE);
    });

    it("uses invalid date", () => {
        const { createdDate } = Task.create({ createdDate: INVALID_DATE });
        expect(createdDate).toEqual(INVALID_DATE);
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
});
