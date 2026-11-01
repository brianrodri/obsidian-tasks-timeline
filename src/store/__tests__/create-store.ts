import { describe, expect, it, vi } from "vitest";

import { Task, type TaskInput } from "@/data/task";

import { createStore } from "../create-store";

const TODAY = Temporal.PlainDate.from("2024-10-25");

/** Creates a task on its own line of a file, so it has an identity of its own. */
const onLine = (fileLine: number, input: TaskInput) =>
    Task.create({
        ...input,
        location: { filePath: "a.md", fileLine, fileStartByte: fileLine * 10, fileStopByte: fileLine * 10 + 9 },
    });

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
        const a = onLine(1, { description: "a", scheduledDate: first });
        const b = onLine(2, { description: "b", scheduledDate: second });
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

    it("keeps every section the same reference when a revision changes none of its tasks", () => {
        const fresh = () => [
            onLine(1, { description: "planned", scheduledDate: TODAY }),
            onLine(2, { description: "backlog", scheduledDate: TODAY.subtract({ days: 1 }) }),
            onLine(3, { description: "upcoming", scheduledDate: TODAY.add({ days: 1 }) }),
        ];
        const { store, getTasks } = createReadyStore(...fresh());
        const before = { planned: store.planned.value, backlog: store.backlog.value, upcoming: store.upcoming.value };

        getTasks.mockReturnValue(fresh());
        store.revision.value++;

        expect(store.planned.value).toBe(before.planned);
        expect(store.backlog.value).toBe(before.backlog);
        expect(store.upcoming.value).toBe(before.upcoming);
    });

    it("keeps an upcoming group the same reference when only another group changes", () => {
        const [first, second] = [TODAY.add({ days: 1 }), TODAY.add({ days: 2 })];
        const { store, getTasks } = createReadyStore(
            onLine(1, { description: "a", scheduledDate: first }),
            Task.create({ description: "b", scheduledDate: second }),
        );
        const [firstGroup, secondGroup] = store.upcoming.value;

        getTasks.mockReturnValue([
            onLine(1, { description: "a", scheduledDate: first }),
            onLine(2, { description: "b, edited", scheduledDate: second }),
        ]);
        store.revision.value++;

        const [nextFirstGroup, nextSecondGroup] = store.upcoming.value;
        expect(nextFirstGroup).toBe(firstGroup);
        expect(nextSecondGroup).not.toBe(secondGroup);
    });

    describe("interning", () => {
        const inFile = (fileLine: number, description: string, fileStartByte: number) =>
            Task.create({
                description,
                scheduledDate: TODAY,
                location: { filePath: "a.md", fileLine, fileStartByte, fileStopByte: fileStartByte + 10 },
            });

        it("keeps every unedited task the same instance across revisions", () => {
            const { store, getTasks } = createReadyStore(inFile(1, "a", 0), inFile(2, "b", 10), inFile(3, "c", 20));
            const [a, , c] = store.tasks.value;

            // A new revision re-reads every task as a new instance, as a cache miss would.
            getTasks.mockReturnValue([inFile(1, "a", 0), inFile(2, "edited", 10), inFile(3, "c", 20)]);
            store.revision.value++;

            const [nextA, nextB, nextC] = store.tasks.value;
            expect(nextA).toBe(a);
            expect(nextB?.description).toEqual("edited");
            expect(nextC).toBe(c);
        });

        it("keeps the identity of a task below an edited one in the same file", () => {
            const { store, getTasks } = createReadyStore(inFile(1, "a", 0), inFile(2, "b", 10));
            const [, below] = store.tasks.value;

            getTasks.mockReturnValue([inFile(1, "a, longer", 0), inFile(2, "b", 18)]);
            store.revision.value++;

            const [, nextBelow] = store.tasks.value;
            expect(nextBelow).not.toBe(below);
            expect(nextBelow?.identity).toEqual(below?.identity);
        });
    });
});
