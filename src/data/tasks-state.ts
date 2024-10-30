import { memoize, partition, sortBy, sortedIndex, sortedLastIndex } from "lodash";
import { DateTime, Interval } from "luxon";

import { Task } from "./task";

export class TasksState {
    public readonly undated: readonly Task[];

    private readonly tasksByDateKey: ReadonlyMap<string, readonly Task[]>;
    private readonly sortedDateKeys: readonly string[];

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

        this.getDatesAfter = memoize(this.getDatesAfter.bind(this), TasksState.getDateKey);
        this.getHappeningBefore = memoize(this.getHappeningBefore.bind(this), TasksState.getDateKey);
        this.getHappeningOn = memoize(this.getHappeningOn.bind(this), TasksState.getIntervalKey);
    }

    public getDatesAfter(date: DateTime<true>) {
        const numDatesSameOrBefore = sortedLastIndex(this.sortedDateKeys, TasksState.getDateKey(date));

        return this.sortedDateKeys.slice(numDatesSameOrBefore);
    }

    public getHappeningBefore(date: DateTime<true>): ReadonlyArray<Task> {
        const numDatesBefore = sortedIndex(this.sortedDateKeys, TasksState.getDateKey(date));

        return this.tasksByDateKey
            .values()
            .take(numDatesBefore)
            .flatMap((tasks) => tasks.values())
            .toArray();
    }

    public getHappeningOn(interval: Interval<true>): ReadonlyArray<Task> {
        const numDatesBeforeStart = sortedIndex(this.sortedDateKeys, TasksState.getDateKey(interval.start));
        const numDatesBeforeEnd = sortedIndex(this.sortedDateKeys, TasksState.getDateKey(interval.end));

        return this.tasksByDateKey
            .values()
            .drop(numDatesBeforeStart)
            .take(numDatesBeforeEnd - numDatesBeforeStart)
            .flatMap((tasks) => tasks.values())
            .toArray();
    }

    private static getDateKey(date: DateTime<true>): string {
        return date.toISODate();
    }

    private static getIntervalKey({ start, end }: Interval<true>): string {
        return `${TasksState.getDateKey(start)}/${TasksState.getDateKey(end)}`;
    }
}
