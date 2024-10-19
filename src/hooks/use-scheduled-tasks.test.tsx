import { renderHook } from "@testing-library/preact";
import { DateTime } from "luxon";
import { PropsWithChildren } from "preact/compat";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Dataview } from "../compat/dataview-adapters";
import { FileBuilder, mockDataArray, Page, Task, TaskBuilder } from "../compat/dataview-types";
import { Obsidian, WorkspaceLeaf } from "../compat/obsidian-adapters";
import { DEFAULT_SETTINGS } from "../config/settings";
import { useScheduledTasks } from "./use-scheduled-tasks";
import { TimelineContextProvider } from "./use-timeline-context";

const JAN_1ST = DateTime.fromISO("2024-01-01") as DateTime<true>;
const JAN_2ND = DateTime.fromISO("2024-01-02") as DateTime<true>;
const JAN_3RD = DateTime.fromISO("2024-01-03") as DateTime<true>;

vi.mock("../compat/dataview-adapters");
vi.mock("../compat/obsidian-adapters");

describe("useScheduledTasks", () => {
    const obsidian = vi.mocked(new Obsidian(), true);
    const dataview = vi.mocked(new Dataview(), true);
    const leaf = vi.mocked(new WorkspaceLeaf(), true);

    const wrapper = ({ children }: PropsWithChildren) => (
        <TimelineContextProvider obsidian={obsidian} dataview={dataview} settings={DEFAULT_SETTINGS} leaf={leaf}>
            {children}
        </TimelineContextProvider>
    );

    const mockPageWithTasks = (tasks: Task[] | undefined, fileBuilder = new FileBuilder()): Task[] => {
        const page: Page = { file: fileBuilder.with("tasks", tasks ? mockDataArray(tasks) : tasks).build() };
        dataview.getPage.mockReturnValue(page);
        dataview.getPages.mockReturnValue([page]);
        return tasks ?? [];
    };

    afterEach(vi.restoreAllMocks);

    it("works with empty vaults", () => {
        dataview.getPage.mockReturnValue(undefined);
        dataview.getPages.mockReturnValue([]);

        const { unscheduled, getScheduledOn } = renderHook(useScheduledTasks, { wrapper }).result.current;

        expect(unscheduled).toEqual([]);
        expect(getScheduledOn(JAN_1ST)).toEqual([]);
        expect(getScheduledOn(JAN_2ND)).toEqual([]);
        expect(getScheduledOn(JAN_3RD)).toEqual([]);
    });

    it("groups unscheduled tasks", () => {
        const tasks = mockPageWithTasks([new TaskBuilder().build()]);

        const { unscheduled, getScheduledOn } = renderHook(useScheduledTasks, { wrapper }).result.current;

        expect(unscheduled).toEqual(tasks);
        expect(getScheduledOn(JAN_1ST)).toEqual([]);
        expect(getScheduledOn(JAN_2ND)).toEqual([]);
        expect(getScheduledOn(JAN_3RD)).toEqual([]);
    });

    it("groups scheduled tasks with the same date", () => {
        const [open, done, cancelled] = mockPageWithTasks([
            new TaskBuilder({ scheduled: JAN_2ND }).withState("open").build(),
            new TaskBuilder({ scheduled: JAN_2ND }).withState("done").build(),
            new TaskBuilder({ scheduled: JAN_2ND }).withState("cancelled").build(),
        ]);

        const { unscheduled, getScheduledOn } = renderHook(useScheduledTasks, { wrapper }).result.current;

        expect(unscheduled).toEqual([]);
        expect(getScheduledOn(JAN_1ST)).toEqual([]);
        expect(getScheduledOn(JAN_2ND)).toEqual([open, done, cancelled]);
        expect(getScheduledOn(JAN_3RD)).toEqual([open]);
    });

    it("splits tasks with different scheduled dates", () => {
        const [done1st, done2nd] = mockPageWithTasks([
            new TaskBuilder({ scheduled: JAN_1ST }).withState("done").build(),
            new TaskBuilder({ scheduled: JAN_2ND }).withState("done").build(),
        ]);

        const { unscheduled, getScheduledOn } = renderHook(useScheduledTasks, { wrapper }).result.current;

        expect(unscheduled).toEqual([]);
        expect(getScheduledOn(JAN_1ST)).toEqual([done1st]);
        expect(getScheduledOn(JAN_2ND)).toEqual([done2nd]);
        expect(getScheduledOn(JAN_3RD)).toEqual([]);
    });

    it("forwards unchecked tasks with past scheduled dates", () => {
        const [open1st, done1st, open2nd, done2nd] = mockPageWithTasks([
            new TaskBuilder({ scheduled: JAN_1ST }).withState("open").build(),
            new TaskBuilder({ scheduled: JAN_1ST }).withState("done").build(),
            new TaskBuilder({ scheduled: JAN_2ND }).withState("open").build(),
            new TaskBuilder({ scheduled: JAN_2ND }).withState("done").build(),
        ]);

        const { unscheduled, getScheduledOn } = renderHook(useScheduledTasks, { wrapper }).result.current;

        expect(unscheduled).toEqual([]);
        expect(getScheduledOn(JAN_1ST)).toEqual([open1st, done1st]);
        expect(getScheduledOn(JAN_2ND)).toEqual([open2nd, done2nd, open1st]);
        expect(getScheduledOn(JAN_3RD)).toEqual([open2nd, open1st]);
    });

    it("delays tasks if they start after their scheduled date", () => {
        const [starts1st, starts2nd, starts3rd] = mockPageWithTasks([
            new TaskBuilder({ scheduled: JAN_2ND, start: JAN_1ST }).build(),
            new TaskBuilder({ scheduled: JAN_2ND, start: JAN_2ND }).build(),
            new TaskBuilder({ scheduled: JAN_2ND, start: JAN_3RD }).build(),
        ]);

        const { unscheduled, getScheduledOn } = renderHook(useScheduledTasks, { wrapper }).result.current;

        expect(unscheduled).toEqual([]);
        expect(getScheduledOn(JAN_1ST)).toEqual([]);
        expect(getScheduledOn(JAN_2ND)).toEqual([starts1st, starts2nd]);
        expect(getScheduledOn(JAN_3RD)).toEqual([starts3rd, starts1st, starts2nd]);
    });

    it("uses page date if tasks are otherwise unscheduled", () => {
        const [task] = mockPageWithTasks([new TaskBuilder().build()], new FileBuilder({ day: JAN_2ND }));

        const { unscheduled, getScheduledOn } = renderHook(useScheduledTasks, { wrapper }).result.current;

        expect(unscheduled).toEqual([]);
        expect(getScheduledOn(JAN_1ST)).toEqual([]);
        expect(getScheduledOn(JAN_2ND)).toEqual([task]);
        expect(getScheduledOn(JAN_3RD)).toEqual([task]);
    });

    it("skips pages with undefined tasks", () => {
        mockPageWithTasks(undefined);

        const { unscheduled, getScheduledOn } = renderHook(useScheduledTasks, { wrapper }).result.current;

        expect(unscheduled).toEqual([]);
        expect(getScheduledOn(JAN_1ST)).toEqual([]);
        expect(getScheduledOn(JAN_2ND)).toEqual([]);
        expect(getScheduledOn(JAN_3RD)).toEqual([]);
    });
});
