import { renderHook } from "@testing-library/preact";
import { DateTime } from "luxon";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DataviewMock, FileBuilder, mockDataArray, TaskBuilder } from "../compat/dataview-mocks";
import { Page, Task } from "../compat/dataview-types";
import { ObsidianMock } from "../compat/obsidian-mocks";
import { DEFAULT_SETTINGS } from "../config/settings";
import { useScheduledTasks } from "./use-scheduled-tasks";
import { TimelineContextProvider } from "./use-timeline-context";
import { PropsWithChildren } from "preact/compat";

const OBSIDIAN_MOCK = new ObsidianMock();
const DATAVIEW_MOCK = new DataviewMock();

vi.mock("../compat/obsidian-adapters", () => ({ Obsidian: vi.fn(() => OBSIDIAN_MOCK) }));
vi.mock("../compat/dataview-adapters", () => ({ Dataview: vi.fn(() => DATAVIEW_MOCK) }));

const JAN_1ST = DateTime.fromISO("2024-01-01") as DateTime<true>;
const JAN_2ND = DateTime.fromISO("2024-01-02") as DateTime<true>;
const JAN_3RD = DateTime.fromISO("2024-01-03") as DateTime<true>;

const mockPageWithTasks = (tasks: Task[] | undefined, fileBuilder = new FileBuilder()): Task[] => {
    const page: Page = { file: fileBuilder.with("tasks", tasks && mockDataArray(tasks)).build() };
    DATAVIEW_MOCK.getPage.mockImplementation(() => page);
    DATAVIEW_MOCK.getPages.mockImplementation(() => [page]);
    return tasks ?? [];
};

const renderScheduledTasks = () => {
    const wrapper = ({ children }: PropsWithChildren) => (
        <TimelineContextProvider obsidian={OBSIDIAN_MOCK.unsafeCast()} settings={DEFAULT_SETTINGS}>
            {children}
        </TimelineContextProvider>
    );
    const { unscheduled, useScheduledOn } = renderHook(useScheduledTasks, { wrapper }).result.current;
    const renderScheduledOn = (d: DateTime<true>) => renderHook(() => useScheduledOn(d), { wrapper }).result.current;
    return { unscheduled, renderScheduledOn } as const;
};

describe("useScheduledTasks", () => {
    afterEach(vi.restoreAllMocks);

    it("groups unscheduled tasks", () => {
        const tasks = mockPageWithTasks([new TaskBuilder().build()]);

        const { unscheduled } = renderScheduledTasks();

        expect(unscheduled).toEqual(tasks);
    });

    it("groups scheduled tasks with the same date", () => {
        const [open, done, cancelled] = mockPageWithTasks([
            new TaskBuilder().with("scheduled", JAN_2ND).withState("open").build(),
            new TaskBuilder().with("scheduled", JAN_2ND).withState("done").build(),
            new TaskBuilder().with("scheduled", JAN_2ND).withState("cancelled").build(),
        ]);

        const { unscheduled, renderScheduledOn } = renderScheduledTasks();

        expect(unscheduled).toEqual([]);
        expect(renderScheduledOn(JAN_1ST)).toEqual([]);
        expect(renderScheduledOn(JAN_2ND)).toEqual([open, done, cancelled]);
        expect(renderScheduledOn(JAN_3RD)).toEqual([open]);
    });

    it("splits tasks with different scheduled dates", () => {
        const [doneOn1st, doneOn2nd] = mockPageWithTasks([
            new TaskBuilder().with("scheduled", JAN_1ST).withState("done").build(),
            new TaskBuilder().with("scheduled", JAN_2ND).withState("done").build(),
        ]);

        const { unscheduled, renderScheduledOn } = renderScheduledTasks();

        expect(unscheduled).toEqual([]);
        expect(renderScheduledOn(JAN_1ST)).toEqual([doneOn1st]);
        expect(renderScheduledOn(JAN_2ND)).toEqual([doneOn2nd]);
        expect(renderScheduledOn(JAN_3RD)).toEqual([]);
    });

    it("forwards unchecked tasks with past scheduled dates", () => {
        const [doneOn1st, openOn1st, doneOn2nd, openOn2nd] = mockPageWithTasks([
            new TaskBuilder().with("scheduled", JAN_1ST).withState("done").build(),
            new TaskBuilder().with("scheduled", JAN_1ST).withState("open").build(),
            new TaskBuilder().with("scheduled", JAN_2ND).withState("done").build(),
            new TaskBuilder().with("scheduled", JAN_2ND).withState("open").build(),
        ]);

        const { unscheduled, renderScheduledOn } = renderScheduledTasks();

        expect(unscheduled).toEqual([]);
        expect(renderScheduledOn(JAN_1ST)).toEqual([doneOn1st, openOn1st]);
        expect(renderScheduledOn(JAN_2ND)).toEqual([doneOn2nd, openOn2nd, openOn1st]);
        expect(renderScheduledOn(JAN_3RD)).toEqual([openOn2nd, openOn1st]);
    });

    it("delays tasks if they start after their scheduled date", () => {
        const [startsOn1st, startsOn2nd, startsOn3rd] = mockPageWithTasks([
            new TaskBuilder().with("scheduled", JAN_2ND).with("start", JAN_1ST).build(),
            new TaskBuilder().with("scheduled", JAN_2ND).with("start", JAN_2ND).build(),
            new TaskBuilder().with("scheduled", JAN_2ND).with("start", JAN_3RD).build(),
        ]);

        const { unscheduled, renderScheduledOn } = renderScheduledTasks();

        expect(unscheduled).toEqual([]);
        expect(renderScheduledOn(JAN_1ST)).toEqual([]);
        expect(renderScheduledOn(JAN_2ND)).toEqual([startsOn1st, startsOn2nd]);
        expect(renderScheduledOn(JAN_3RD)).toEqual([startsOn3rd, startsOn1st, startsOn2nd]);
    });

    it("uses page date if tasks are otherwise unscheduled", () => {
        const [task] = mockPageWithTasks(
            [new TaskBuilder().with("scheduled", undefined).build()],
            new FileBuilder().with("day", JAN_2ND),
        );

        const { unscheduled, renderScheduledOn } = renderScheduledTasks();

        expect(unscheduled).toEqual([]);
        expect(renderScheduledOn(JAN_1ST)).toEqual([]);
        expect(renderScheduledOn(JAN_2ND)).toEqual([task]);
        expect(renderScheduledOn(JAN_3RD)).toEqual([task]);
    });

    it("skips pages with undefined tasks", () => {
        mockPageWithTasks(undefined);

        const { unscheduled, renderScheduledOn } = renderScheduledTasks();

        expect(unscheduled).toEqual([]);
        expect(renderScheduledOn(JAN_1ST)).toEqual([]);
        expect(renderScheduledOn(JAN_2ND)).toEqual([]);
        expect(renderScheduledOn(JAN_3RD)).toEqual([]);
    });
});
