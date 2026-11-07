import { describe, expect, it, vi } from "vitest";

import { Task } from "@/data/task";

import { createStore } from "../create-store";

const TODAY = Temporal.PlainDate.from("2024-10-25");

function createReadyStore(...tasks: Task[]) {
    const getTasks = vi.fn(() => tasks);
    const store = createStore();
    store.today.value = TODAY;
    store.dataview.value = { getTasks };
    store.status.value = "ready";
    return { store, getTasks };
}

describe("createStore", () => {
    it("has no tasks before dataview is ready", () => {
        const store = createStore();
        expect(store.status.value).toEqual("loading");
        expect(store.planned.value).toEqual([]);
        expect(store.backlog.value).toEqual([]);
        expect(store.upcoming.value).toEqual([]);
    });

    it("queries dataview with the page query from settings", () => {
        const { store, getTasks } = createReadyStore();
        store.settings.value = { ...store.settings.value, pageQuery: "#work" };
        expect(store.tasks.value).toEqual([]);
        expect(getTasks).toHaveBeenLastCalledWith("#work");
    });

    it("re-reads tasks when the revision changes", () => {
        const { store, getTasks } = createReadyStore();
        expect(store.planned.value).toEqual([]);

        const task = Task.create({ scheduledDate: TODAY });
        getTasks.mockReturnValue([task]);
        store.revision.value++;

        expect(store.planned.value).toEqual([task]);
    });

    it("moves a task from upcoming to planned when today changes", () => {
        const tomorrow = TODAY.add({ days: 1 });
        const task = Task.create({ scheduledDate: tomorrow });
        const { store } = createReadyStore(task);
        expect(store.upcoming.value).toEqual([{ date: tomorrow, tasks: [task] }]);
        expect(store.planned.value).toEqual([]);

        store.today.value = tomorrow;

        expect(store.upcoming.value).toEqual([]);
        expect(store.planned.value).toEqual([task]);
    });

    it("puts past tasks (latest first) and undated tasks in the backlog", () => {
        const older = Task.create({ scheduledDate: TODAY.subtract({ days: 2 }) });
        const newer = Task.create({ scheduledDate: TODAY.subtract({ days: 1 }) });
        const undated = Task.create({ description: "undated" });
        const { store } = createReadyStore(older, undated, newer);
        expect(store.backlog.value).toEqual([newer, older, undated]);
    });

    it("groups upcoming tasks by date", () => {
        const [first, second] = [TODAY.add({ days: 1 }), TODAY.add({ days: 3 })];
        const a = Task.create({ description: "a", scheduledDate: first });
        const b = Task.create({ description: "b", scheduledDate: second });
        const c = Task.create({ description: "c", scheduledDate: first });
        const { store } = createReadyStore(a, b, c);
        expect(store.upcoming.value).toEqual([
            { date: first, tasks: [a, c] },
            { date: second, tasks: [b] },
        ]);
    });

    it("leaves out tasks that are not actionable", () => {
        const done = Task.create({ status: "DONE", scheduledDate: TODAY });
        const blocked = Task.create({ scheduledDate: TODAY, dependsOn: new Set(["x"]) });
        const blocker = Task.create({ id: "x" });
        const { store } = createReadyStore(done, blocked, blocker);
        expect(store.planned.value).toEqual([]);
        expect(store.backlog.value).toEqual([blocker]);
    });

    it("returns the same reference when read twice without changes", () => {
        const { store } = createReadyStore(Task.create({ scheduledDate: TODAY }));
        expect(store.planned.value).toBe(store.planned.value);
        expect(store.backlog.value).toBe(store.backlog.value);
        expect(store.upcoming.value).toBe(store.upcoming.value);
    });
});
