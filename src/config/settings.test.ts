import { describe, expectTypeOf, it } from "vitest";

import { DEFAULT_SETTINGS, TasksTimelineSettings } from "./settings";

describe("TasksTimelineSettings", () => {
    it("has correct types", () => {
        expectTypeOf(DEFAULT_SETTINGS).toEqualTypeOf<Readonly<TasksTimelineSettings>>();
    });
});
