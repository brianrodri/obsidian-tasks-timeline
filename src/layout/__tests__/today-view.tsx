import { act, cleanup, render, screen } from "@testing-library/preact";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AppContext } from "@/context/app-context";
import type { AppContextValue } from "@/context/app-context.types";
import { Task, type TaskInput } from "@/data/task";
import { ObsidianMarkdown } from "@/lib/obsidian/markdown";
import { createStore } from "@/store/create-store";

import { TodayView, toRelativeCalendar } from "../today-view";

vi.mock("@/lib/obsidian/markdown", () => ({
    ObsidianMarkdown: vi.fn(({ markdown }: { markdown: string }) => markdown),
}));

describe("TodayView", () => {
    afterEach(cleanup);

    const today = Temporal.PlainDate.from("2024-10-25");
    const onLine = (fileLine: number, input: TaskInput) =>
        Task.create({ ...input, location: { filePath: "a.md", fileLine, fileStartByte: fileLine, fileStopByte: 0 } });

    function renderView(...tasks: Task[]) {
        const getTasks = vi.fn(() => tasks);
        const store = createStore();
        store.today.value = today;
        store.dataview.value = { getTasks };
        store.status.value = "ready";
        const value = { store, plugin: { app: {} } } as unknown as AppContextValue;
        render(
            <AppContext value={value}>
                <TodayView />
            </AppContext>,
        );
        return { store, getTasks };
    }

    it("re-renders only the entry of the task that changed", async () => {
        const fresh = (edited: string) => [
            onLine(1, { description: "a", scheduledDate: today }),
            onLine(2, { description: edited, scheduledDate: today }),
            onLine(3, { description: "c", scheduledDate: today.subtract({ days: 1 }) }),
            onLine(4, { description: "d", scheduledDate: today.add({ days: 1 }) }),
        ];
        const { store, getTasks } = renderView(...fresh("b"));
        vi.mocked(ObsidianMarkdown).mockClear();

        getTasks.mockReturnValue(fresh("b, edited"));
        await act(() => {
            store.revision.value++;
        });

        const rendered = vi.mocked(ObsidianMarkdown).mock.calls.map(([props]) => props.markdown);
        expect(rendered).toEqual(["b, edited"]);
    });

    it("judges dates against the store's today, not the clock", () => {
        renderView(
            onLine(1, { description: "due tomorrow", scheduledDate: today, dueDate: today.add({ days: 1 }) }),
            onLine(2, { description: "due yesterday", scheduledDate: today, dueDate: today.subtract({ days: 1 }) }),
            onLine(3, { description: "upcoming", scheduledDate: today.add({ days: 1 }) }),
        );

        expect(screen.getByText("due tomorrow").closest(".task")?.classList.contains("overdue")).toBe(false);
        expect(screen.getByText("due yesterday").closest(".task")?.classList.contains("overdue")).toBe(true);
        expect(screen.getByText("tomorrow")).toBeDefined();
    });

    it("re-judges an unchanged backlog task as overdue when today advances", async () => {
        const { store } = renderView(
            onLine(1, { description: "due today", scheduledDate: today.subtract({ days: 2 }), dueDate: today }),
        );
        expect(screen.getByText("due today").closest(".task")?.classList.contains("overdue")).toBe(false);

        await act(() => {
            store.today.value = today.add({ days: 1 });
        });

        expect(screen.getByText("due today").closest(".task")?.classList.contains("overdue")).toBe(true);
    });
});

describe("toRelativeCalendar", () => {
    const base = Temporal.PlainDate.from("2024-10-25");

    it.each([
        ["2024-10-25", "today"],
        ["2024-10-26", "tomorrow"],
        ["2024-10-24", "yesterday"],
        ["2024-10-30", "in 5 days"],
        ["2024-10-01", "24 days ago"],
        ["2024-11-02", "next month"],
        ["2024-12-31", "in 2 months"],
        ["2024-09-30", "last month"],
        ["2025-01-02", "next year"],
        ["2022-03-01", "2 years ago"],
    ])("formats %s as %j", (iso, expected) => {
        expect(toRelativeCalendar(Temporal.PlainDate.from(iso), base, "en-US")).toEqual(expected);
    });
});
