import { memoize, partition, sortBy, sortedIndex, sortedLastIndex } from "lodash";
import { DateTime } from "luxon";

import { Task } from "./task";

export class TasksState {
    public readonly undated: readonly Task[];

    private readonly tasksByDateKey: ReadonlyMap<string, readonly Task[]>;
    private readonly sortedDateKeys: readonly string[];
    private readonly openTaskIds: ReadonlySet<string>;

    public constructor(
        public readonly tasks: readonly Task[] = [],
        public readonly revision: number = 0,
    ) {
        const [scheduled, unscheduled] = partition(tasks, (task) => task.happensDate.isValid);

        this.undated = unscheduled;
        this.tasksByDateKey = Map.groupBy(
            sortBy(scheduled, (task) => task.happensDate),
            (task) => TasksState.getDateKey(task.happensDate),
        );
        this.sortedDateKeys = [...this.tasksByDateKey.keys()];
        this.openTaskIds = new Set(tasks.filter((task) => task.id && task.status === "OPEN").map((task) => task.id));

        this.isDependencyFree = memoize(this.isDependencyFree.bind(this));
        this.getHappeningBefore = memoize(this.getHappeningBefore.bind(this), TasksState.getDateKey);
        this.getHappeningOn = memoize(this.getHappeningOn.bind(this), TasksState.getDateKey);
        this.getHappeningAfter = memoize(this.getHappeningAfter.bind(this), TasksState.getDateKey);
    }

    public getHappeningOn(date: DateTime): ReadonlyArray<Task> {
        if (!date.isValid) {
            throw new Error(`${date.invalidReason}: ${date.invalidExplanation}`);
        }

        const start = date.startOf("day");
        const end = start.plus({ day: 1 });
        const numDatesBeforeStart = sortedIndex(this.sortedDateKeys, TasksState.getDateKey(start));
        const numDatesBeforeEnd = sortedIndex(this.sortedDateKeys, TasksState.getDateKey(end));

        return this.tasksByDateKey
            .values()
            .drop(numDatesBeforeStart)
            .take(numDatesBeforeEnd - numDatesBeforeStart)
            .flatMap((tasks) => tasks.values())
            .toArray();
    }

    public getHappeningBefore(date: DateTime<true>): ReadonlyArray<Task> {
        const numDatesBefore = sortedIndex(this.sortedDateKeys, TasksState.getDateKey(date));

        return this.tasksByDateKey
            .values()
            .take(numDatesBefore)
            .flatMap((tasks) => tasks.values())
            .toArray();
    }

    public getHappeningAfter(date: DateTime<true>): ReadonlyArray<Task> {
        const numDatesSameOrBefore = sortedLastIndex(this.sortedDateKeys, TasksState.getDateKey(date));

        return this.tasksByDateKey
            .values()
            .drop(numDatesSameOrBefore)
            .flatMap((tasks) => tasks.values())
            .toArray();
    }

    public isDependencyFree(task: Task): boolean {
        return this.openTaskIds.isDisjointFrom(task.dependsOn);
    }

    public static getDateKey(date: DateTime<true>): string {
        return date.toISODate();
    }
}
