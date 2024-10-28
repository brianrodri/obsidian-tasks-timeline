import { renderHook } from "@testing-library/preact";
import { DateTime } from "luxon";
import { PropsWithChildren } from "preact/compat";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PluginContextProvider } from "@/context/plugin-context";
import { DEFAULT_SETTINGS } from "@/data/settings";
import { Task } from "@/data/task";
import { Dataview } from "@/lib/obsidian-dataview/api";
import { TasksApi } from "@/lib/obsidian-tasks/api";
import { Obsidian, WorkspaceLeaf } from "@/lib/obsidian/api";
import { useScheduledTasks } from "../use-scheduled-tasks";

const JAN_1ST = DateTime.fromISO("2024-01-01") as DateTime<true>;
const JAN_2ND = DateTime.fromISO("2024-01-02") as DateTime<true>;
const JAN_3RD = DateTime.fromISO("2024-01-03") as DateTime<true>;

vi.mock("@/lib/obsidian/api");
vi.mock("@/lib/obsidian-dataview/api");
vi.mock("@/lib/obsidian-tasks/api");

describe("useScheduledTasks", () => {
    const obsidian = vi.mocked(new Obsidian(), true);
    const dataview = vi.mocked(new Dataview(), true);
    const tasksApi = vi.mocked(new TasksApi(), true);
    const leaf = vi.mocked(new WorkspaceLeaf(), true);

    const wrapper = ({ children }: PropsWithChildren) => (
        <PluginContextProvider
            obsidian={obsidian}
            dataview={dataview}
            settings={DEFAULT_SETTINGS}
            leaf={leaf}
            tasksApi={tasksApi}
        >
            {children}
        </PluginContextProvider>
    );

    const mockPageWithTasks = (tasks: Task[]) => {
        dataview.getTasks.mockReturnValue(tasks);
        return tasks ?? [];
    };

    afterEach(vi.restoreAllMocks);

    it("works with empty vaults", () => {
        dataview.getTasks.mockReturnValue([]);

        const { unscheduled, getScheduledOn } = renderHook(useScheduledTasks, { wrapper }).result.current;

        expect(unscheduled).toEqual([]);
        expect(getScheduledOn(JAN_1ST)).toEqual([]);
        expect(getScheduledOn(JAN_2ND)).toEqual([]);
        expect(getScheduledOn(JAN_3RD)).toEqual([]);
    });

    it("groups scheduled tasks with the same date", () => {
        const [open, done, cancelled] = mockPageWithTasks([
            Task.create({ scheduledDate: JAN_2ND, status: "OPEN" }),
            Task.create({ scheduledDate: JAN_2ND, status: "DONE" }),
            Task.create({ scheduledDate: JAN_2ND, status: "DROPPED" }),
        ]);

        const { unscheduled, getScheduledOn } = renderHook(useScheduledTasks, { wrapper }).result.current;

        expect(unscheduled).toEqual([]);
        expect(getScheduledOn(JAN_1ST)).toEqual([]);
        expect(getScheduledOn(JAN_2ND)).toEqual([open, done, cancelled]);
        expect(getScheduledOn(JAN_3RD)).toEqual([open]);
    });

    it("splits tasks with different scheduled dates", () => {
        const [done1st, done2nd] = mockPageWithTasks([
            Task.create({ scheduledDate: JAN_1ST, status: "DONE" }),
            Task.create({ scheduledDate: JAN_2ND, status: "DONE" }),
        ]);

        const { unscheduled, getScheduledOn } = renderHook(useScheduledTasks, { wrapper }).result.current;

        expect(unscheduled).toEqual([]);
        expect(getScheduledOn(JAN_1ST)).toEqual([done1st]);
        expect(getScheduledOn(JAN_2ND)).toEqual([done2nd]);
        expect(getScheduledOn(JAN_3RD)).toEqual([]);
    });

    it("forwards unchecked tasks with past scheduled dates", () => {
        const [open1st, done1st, open2nd, done2nd] = mockPageWithTasks([
            Task.create({ scheduledDate: JAN_1ST, status: "OPEN" }),
            Task.create({ scheduledDate: JAN_1ST, status: "DONE" }),
            Task.create({ scheduledDate: JAN_2ND, status: "OPEN" }),
            Task.create({ scheduledDate: JAN_2ND, status: "DONE" }),
        ]);

        const { unscheduled, getScheduledOn } = renderHook(useScheduledTasks, { wrapper }).result.current;

        expect(unscheduled).toEqual([]);
        expect(getScheduledOn(JAN_1ST)).toEqual([open1st, done1st]);
        expect(getScheduledOn(JAN_2ND)).toEqual([open2nd, done2nd, open1st]);
        expect(getScheduledOn(JAN_3RD)).toEqual([open2nd, open1st]);
    });
});
