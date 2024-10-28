import { DateTime } from "luxon";
import { describe, expect, expectTypeOf, it } from "vitest";

import { Task } from "../task";

describe("Task", () => {
    describe(".fromFields", () => {
        it("carries strong type-information from valid input", () => {
            const { cancelledDate } = Task.fromFields({ cancelledDate: DateTime.now() });
            expectTypeOf(cancelledDate).toEqualTypeOf<DateTime<true>>();
        });

        it("carries strong type-information from invalid input", () => {
            const { createdDate } = Task.fromFields({ createdDate: DateTime.invalid("uh-oh") });
            expectTypeOf(createdDate).toEqualTypeOf<DateTime<false>>();
        });

        it("carries weak type-information from unknown input", () => {
            const { doneDate } = Task.fromFields({ doneDate: DateTime.fromISO("2024-10-26") });
            expectTypeOf(doneDate).toEqualTypeOf<DateTime<boolean>>();
        });

        it("can be converted to and from fields", () => {
            const fields = Task.EMPTY;
            const copy = Task.fromFields(fields);
            expect(copy).toEqual(Task.EMPTY);
            expect(copy).toEqual(fields);
        });
    });

    describe(".with", () => {
        it("carries strong type-information from valid input", () => {
            const { dueDate } = Task.EMPTY.with("dueDate", DateTime.now());
            expectTypeOf(dueDate).toEqualTypeOf<DateTime<true>>();
        });

        it("carries strong type-information from invalid input", () => {
            const { scheduledDate } = Task.EMPTY.with("scheduledDate", DateTime.invalid("uh-oh"));
            expectTypeOf(scheduledDate).toEqualTypeOf<DateTime<false>>();
        });

        it("carries weak type-information from unknown input", () => {
            const { startDate } = Task.EMPTY.with("startDate", DateTime.fromISO("2024-10-26"));
            expectTypeOf(startDate).toEqualTypeOf<DateTime<boolean>>();
        });

        it("carries old type-information when chained", () => {
            const fromOneValidDate = Task.fromFields({ cancelledDate: DateTime.now() });
            const withTwoValidDates = fromOneValidDate.with("createdDate", DateTime.now());

            expectTypeOf(fromOneValidDate.cancelledDate).toEqualTypeOf<DateTime<true>>();
            expectTypeOf(fromOneValidDate.createdDate).toEqualTypeOf<DateTime<false>>();
            expectTypeOf(withTwoValidDates.cancelledDate).toEqualTypeOf<DateTime<true>>();
            expectTypeOf(withTwoValidDates.createdDate).toEqualTypeOf<DateTime<true>>();
        });
    });
});
