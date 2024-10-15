import { renderHook } from "@testing-library/preact";
import { DateTime } from "luxon";
import { PropsWithChildren } from "preact/compat";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DataviewMock, FileBuilder, mockDataArray, TaskBuilder } from "../compat/dataview-mocks";
import { Page } from "../compat/dataview-types";
import { ObsidianMock } from "../compat/obsidian-mocks";
import { DEFAULT_SETTINGS } from "../config/settings";
import { useScheduledTasks } from "./use-scheduled-tasks";
import { TimelineContextProvider } from "./use-timeline-context";

const OBSIDIAN_MOCK = new ObsidianMock();
const DATAVIEW_MOCK = new DataviewMock();

vi.mock("../compat/obsidian-adapters", () => ({ Obsidian: vi.fn(() => OBSIDIAN_MOCK) }));
vi.mock("../compat/dataview-adapters", () => ({ Dataview: vi.fn(() => DATAVIEW_MOCK) }));

describe("useScheduledTasks", () => {
    const scheduledOn = (scheduled: DateTime<true> | undefined) => new TaskBuilder({ scheduled });
    const JAN_1ST = DateTime.fromISO("2024-01-01") as DateTime<true>;
    const JAN_2ND = DateTime.fromISO("2024-01-02") as DateTime<true>;
    const JAN_3RD = DateTime.fromISO("2024-01-03") as DateTime<true>;

    const wrapper = ({ children }: PropsWithChildren) => (
        <TimelineContextProvider obsidian={OBSIDIAN_MOCK.unsafeCast()} settings={DEFAULT_SETTINGS}>
            {children}
        </TimelineContextProvider>
    );

    const mockPages = (...pages: (Page | undefined)[]) => {
        DATAVIEW_MOCK.getPage.mockImplementation((path: string) => pages.find((page) => page?.file.path === path));
        DATAVIEW_MOCK.getPages.mockReturnValue(pages.filter((page) => page !== undefined));
    };

    afterEach(vi.restoreAllMocks);

    it("groups unscheduled tasks", () => {
        const tasks = [new TaskBuilder().build()];
        mockPages({ file: new FileBuilder({ tasks: mockDataArray(tasks) }).build() });

        const { result } = renderHook(useScheduledTasks, { wrapper });

        expect(result.current.unscheduledTasks).toEqual(tasks);
        expect(result.current.tasksByScheduledDate).toEqual({});
    });

    it("groups scheduled tasks with the same date", () => {
        const tasks = [
            scheduledOn(JAN_2ND).withState("open").build(),
            scheduledOn(JAN_2ND).withState("done").build(),
            scheduledOn(JAN_2ND).withState("cancelled").build(),
        ];
        mockPages({ file: new FileBuilder({ tasks: mockDataArray(tasks) }).build() });

        const { result } = renderHook(useScheduledTasks, { wrapper });

        expect(result.current.unscheduledTasks).toEqual([]);
        expect(result.current.tasksByScheduledDate).toEqual({ [JAN_2ND.toISODate()]: tasks });
    });

    it("splits tasks with different scheduled dates", () => {
        const [doneOn1st, doneOn2nd] = [
            scheduledOn(JAN_1ST).withState("done").build(),
            scheduledOn(JAN_2ND).withState("done").build(),
        ];
        mockPages({ file: new FileBuilder({ tasks: mockDataArray([doneOn2nd, doneOn1st]) }).build() });

        const { result } = renderHook(useScheduledTasks, { wrapper });

        expect(result.current.unscheduledTasks).toEqual([]);
        expect(result.current.tasksByScheduledDate).toEqual({
            [JAN_2ND.toISODate()]: [doneOn2nd],
            [JAN_1ST.toISODate()]: [doneOn1st],
        });
    });

    it("forwards unchecked tasks with past scheduled dates", () => {
        const [doneOn1st, openOn1st, doneOn2nd, openOn2nd] = [
            scheduledOn(JAN_1ST).withState("done").build(),
            scheduledOn(JAN_1ST).withState("open").build(),
            scheduledOn(JAN_2ND).withState("open").build(),
            scheduledOn(JAN_2ND).withState("done").build(),
        ];
        mockPages({
            file: new FileBuilder({ tasks: mockDataArray([doneOn1st, openOn1st, doneOn2nd, openOn2nd]) }).build(),
        });

        const { result } = renderHook(useScheduledTasks, { wrapper });

        expect(result.current.unscheduledTasks).toEqual([]);
        expect(result.current.tasksByScheduledDate).toEqual({
            [JAN_2ND.toISODate()]: [doneOn2nd, openOn2nd, openOn1st],
            [JAN_1ST.toISODate()]: [doneOn1st, openOn1st],
        });
    });

    it("delays tasks if they start after their scheduled date", () => {
        const [startsOn1st, startsOn2nd, startsOn3rd] = [
            scheduledOn(JAN_2ND).with("start", JAN_1ST).build(),
            scheduledOn(JAN_2ND).with("start", JAN_2ND).build(),
            scheduledOn(JAN_2ND).with("start", JAN_3RD).build(),
        ];
        mockPages({
            file: new FileBuilder({ tasks: mockDataArray([startsOn1st, startsOn2nd, startsOn3rd]) }).build(),
        });

        const { result } = renderHook(useScheduledTasks, { wrapper });

        expect(result.current.unscheduledTasks).toEqual([]);
        expect(result.current.tasksByScheduledDate).toEqual({
            [JAN_3RD.toISODate()]: [startsOn3rd, startsOn1st, startsOn2nd],
            [JAN_2ND.toISODate()]: [startsOn1st, startsOn2nd],
        });
    });

    it("skips non-applicable pages", () => {
        mockPages(undefined, { file: new FileBuilder({ tasks: undefined }).build() });

        const { result } = renderHook(useScheduledTasks, { wrapper });

        expect(result.current.unscheduledTasks).toEqual([]);
        expect(result.current.tasksByScheduledDate).toEqual({});
    });

    it("uses page date if tasks are otherwise unscheduled", () => {
        const tasks = [scheduledOn(undefined).build()];
        mockPages({ file: new FileBuilder({ day: JAN_2ND, tasks: mockDataArray(tasks) }).build() });

        const { result } = renderHook(useScheduledTasks, { wrapper });

        expect(result.current.unscheduledTasks).toEqual([]);
        expect(result.current.tasksByScheduledDate).toEqual({ [JAN_2ND.toISODate()]: tasks });
    });
});
