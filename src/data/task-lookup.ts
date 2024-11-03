import { memoize, partition, sortBy, sortedIndex, sortedLastIndex } from "lodash";
import { DateTime } from "luxon";

import { Task } from "./task";

export class TaskLookup {
    public readonly undated: readonly Task[];

    private readonly tasksByDateKey: ReadonlyMap<string, readonly Task[]>;
    private readonly openTaskIds: ReadonlySet<string>;

    public constructor(
        public readonly tasks: readonly Task[] = [],
        public readonly revision: number = 0,
    ) {
        const [scheduled, unscheduled] = partition(tasks, (task) => task.happensDate.isValid);

        this.undated = unscheduled;
        this.tasksByDateKey = Map.groupBy(
            sortBy(scheduled, (task) => task.happensDate),
            (task) => TaskLookup.getDateKey(task.happensDate),
        );
        this.openTaskIds = new Set(tasks.filter((task) => task.id && task.status === "OPEN").map((task) => task.id));

        this.isDependencyFree = memoize(this.isDependencyFree.bind(this));
        this.getHappeningBefore = memoize(this.getHappeningBefore.bind(this), TaskLookup.getDateKey);
        this.getHappeningOn = memoize(this.getHappeningOn.bind(this), TaskLookup.getDateKey);
        this.getHappeningAfter = memoize(this.getHappeningAfter.bind(this), TaskLookup.getDateKey);
    }

    public getHappeningOn(date: DateTime): ReadonlyArray<Task> {
        if (!date.isValid) {
            throw new Error(`${date.invalidReason}: ${date.invalidExplanation}`);
        }

        const start = date.startOf("day");
        const end = start.plus({ day: 1 });
        const numDatesBeforeStart = sortedIndex(this.tasksByDateKey.keys().toArray(), TaskLookup.getDateKey(start));
        const numDatesBeforeEnd = sortedIndex(this.tasksByDateKey.keys().toArray(), TaskLookup.getDateKey(end));

        return this.tasksByDateKey
            .values()
            .drop(numDatesBeforeStart)
            .take(numDatesBeforeEnd - numDatesBeforeStart)
            .flatMap((tasks) => tasks.values())
            .toArray();
    }

    public getHappeningBefore(date: DateTime<true>): ReadonlyArray<Task> {
        const numDatesBefore = sortedIndex(this.tasksByDateKey.keys().toArray(), TaskLookup.getDateKey(date));

        return this.tasksByDateKey
            .values()
            .take(numDatesBefore)
            .flatMap((tasks) => tasks.values())
            .toArray();
    }

    public getHappeningAfter(date: DateTime<true>): ReadonlyArray<Task> {
        const numDatesSameOrBefore = sortedLastIndex(this.tasksByDateKey.keys().toArray(), TaskLookup.getDateKey(date));

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
