import { memoize, partition, sortBy, sortedIndex, sortedLastIndex } from "lodash";

import type { Task } from "@/data/task";

export class TaskLookup {
    public readonly revision: number;
    public readonly undatedTasks: readonly Task[];
    public readonly isTaskActionable: (task: Task) => boolean;
    public readonly getTasksHappeningOn: (date: Temporal.PlainDate) => readonly Task[];
    public readonly getTasksHappeningBefore: (date: Temporal.PlainDate) => readonly Task[];
    public readonly getTasksHappeningAfter: (date: Temporal.PlainDate) => readonly Task[];
    private readonly tasksBySortedDateKey: ReadonlyMap<string, readonly Task[]>;
    private readonly sortedDateKeys: readonly string[];
    private readonly openTaskIds: ReadonlySet<string>;

    public constructor(tasks: Task[] = [], revision = 0) {
        this.revision = revision;

        this.openTaskIds = new Set(tasks.filter((task) => task.id && task.status === "OPEN").map((task) => task.id));

        const [withKeys, withoutKeys] = partition(tasks, getTaskDateKey);
        this.tasksBySortedDateKey = Map.groupBy(sortBy(withKeys, getTaskDateKey), getTaskDateKey);
        this.sortedDateKeys = this.tasksBySortedDateKey.keys().toArray();
        this.undatedTasks = withoutKeys;

        this.isTaskActionable = memoize((task: Task) => this.computeIsTaskActionable(task));
        this.getTasksHappeningOn = memoize(
            (date: Temporal.PlainDate) => this.computeTasksHappeningOn(date),
            getDateKey,
        );
        this.getTasksHappeningBefore = memoize(
            (date: Temporal.PlainDate) => this.computeTasksHappeningBefore(date),
            getDateKey,
        );
        this.getTasksHappeningAfter = memoize(
            (date: Temporal.PlainDate) => this.computeTasksHappeningAfter(date),
            getDateKey,
        );
    }

    private computeTasksHappeningOn(date: Temporal.PlainDate): readonly Task[] {
        const start = sortedIndex(this.sortedDateKeys, getDateKey(date));
        const end = sortedIndex(this.sortedDateKeys, getDateKey(date.add({ days: 1 })));

        return this.tasksBySortedDateKey
            .values()
            .drop(start)
            .take(end - start)
            .flatMap((tasks) => tasks.values())
            .toArray();
    }

    private computeTasksHappeningBefore(date: Temporal.PlainDate): readonly Task[] {
        const end = sortedIndex(this.sortedDateKeys, getDateKey(date));

        return this.tasksBySortedDateKey
            .values()
            .take(end)
            .flatMap((tasks) => tasks.values())
            .toArray();
    }

    private computeTasksHappeningAfter(date: Temporal.PlainDate): readonly Task[] {
        const start = sortedLastIndex(this.sortedDateKeys, getDateKey(date));

        return this.tasksBySortedDateKey
            .values()
            .drop(start)
            .flatMap((tasks) => tasks.values())
            .toArray();
    }

    /**
     * Returns whether the given {@link Task} is "actionable".
     *
     * A task is actionable if all its dependencies are resolved.
     *
     * @see {@link https://publish.obsidian.md/tasks/Getting+Started/Task+Dependencies}
     */
    private computeIsTaskActionable(task: Task): boolean {
        return task.status === "OPEN" && task.dependsOn.isDisjointFrom(this.openTaskIds);
    }
}

function getTaskDateKey(task?: Task | null): string {
    return task ? getDateKey(task.happensDate) : "";
}

function getDateKey(date?: Temporal.PlainDate | null): string {
    return date?.toString() ?? "";
}
