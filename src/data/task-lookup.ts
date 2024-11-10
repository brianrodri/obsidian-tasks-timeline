import { memoize, partition, sortBy, sortedIndex, sortedLastIndex } from "lodash";
import { DateTime, Interval } from "luxon";

import { Task } from "@/data/task";

export class TaskLookup {
    public readonly revision: number;
    public readonly undatedTasks: readonly Task[];
    private readonly tasksBySortedDateKey: ReadonlyMap<string, readonly Task[]>;
    private readonly sortedDateKeys: readonly string[];
    private readonly openTaskIds: ReadonlySet<string>;

    public constructor(tasks: Task[] = [], revision: number = 0) {
        this.revision = revision;

        this.openTaskIds = new Set(tasks.filter((task) => task.id && task.status === "OPEN").map((task) => task.id));

        const [withKeys, withoutKeys] = partition(tasks, TaskLookup.getTaskDateKey);
        this.tasksBySortedDateKey = Map.groupBy(sortBy(withKeys, TaskLookup.getTaskDateKey), TaskLookup.getTaskDateKey);
        this.sortedDateKeys = this.tasksBySortedDateKey.keys().toArray();
        this.undatedTasks = withoutKeys;

        this.isTaskActionable = memoize(this.isTaskActionable.bind(this));
        this.getTasksHappeningBefore = memoize(this.getTasksHappeningBefore.bind(this), TaskLookup.getDateKey);
        this.getTasksHappeningOn = memoize(this.getTasksHappeningOn.bind(this), TaskLookup.getDateKey);
        this.getTasksHappeningAfter = memoize(this.getTasksHappeningAfter.bind(this), TaskLookup.getDateKey);
    }

    public getTasksHappeningOn(date: DateTime): readonly Task[] {
        if (!date.isValid) return [];

        const interval = Interval.after(date.startOf("day"), { days: 1 });
        const start = sortedIndex(this.sortedDateKeys, TaskLookup.getDateKey(interval.start));
        const end = sortedIndex(this.sortedDateKeys, TaskLookup.getDateKey(interval.end));

        return this.tasksBySortedDateKey
            .values()
            .drop(start)
            .take(end - start)
            .flatMap((tasks) => tasks.values())
            .toArray();
    }

    public getTasksHappeningBefore(date: DateTime): readonly Task[] {
        if (!date.isValid) return [];

        const end = sortedIndex(this.sortedDateKeys, TaskLookup.getDateKey(date));

        return this.tasksBySortedDateKey
            .values()
            .take(end)
            .flatMap((tasks) => tasks.values())
            .toArray();
    }

    public getTasksHappeningAfter(date: DateTime): readonly Task[] {
        if (!date.isValid) return [];

        const start = sortedLastIndex(this.sortedDateKeys, TaskLookup.getDateKey(date));

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
    public isTaskActionable(task: Task): boolean {
        return task.status === "OPEN" && task.dependsOn.isDisjointFrom(this.openTaskIds);
    }

    static getTaskDateKey(task?: Task | null): string {
        return task ? TaskLookup.getDateKey(task.happensDate) : "";
    }

    public static getDateKey(date?: DateTime | null): string {
        return date?.toISODate() ?? "";
    }
}
