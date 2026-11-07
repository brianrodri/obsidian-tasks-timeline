import { computed, signal } from "@preact/signals";
import { noop } from "lodash";

import { DEFAULT_SETTINGS, type PluginSettings } from "@/data/settings";
import type { Task } from "@/data/task";
import { TaskLookup } from "@/data/task-lookup";
import type { Store, StoreStatus, TaskSource, UpcomingGroup } from "@/store/create-store.types";

export function createStore(): Store {
    const status = signal<StoreStatus>("loading");
    const settings = signal<PluginSettings>(DEFAULT_SETTINGS);
    const revision = signal(0);
    const today = signal(Temporal.Now.plainDateISO());
    const dataview = signal<TaskSource>();

    const intern = createTaskInterner();
    const tasks = computed(() => {
        // Dataview's index is not a signal, so subscribe to its revision to re-run the query when the index changes.
        noop(revision.value);
        if (status.value !== "ready") return intern([]);
        return intern(dataview.value?.getTasks(settings.value.pageQuery) ?? []);
    });
    const lookup = computed(() => new TaskLookup([...tasks.value]));
    const stablePlanned = createArrayStabilizer<Task>();
    const planned = computed(() => {
        const { getTasksHappeningOn, isTaskActionable } = lookup.value;
        return stablePlanned(getTasksHappeningOn(today.value).filter(isTaskActionable));
    });
    const stableBacklog = createArrayStabilizer<Task>();
    const backlog = computed(() => {
        const { getTasksHappeningBefore, undatedTasks, isTaskActionable } = lookup.value;
        return stableBacklog(
            [...getTasksHappeningBefore(today.value).toReversed(), ...undatedTasks].filter(isTaskActionable),
        );
    });
    const stableUpcoming = createGroupsStabilizer();
    const upcoming = computed(() => {
        const { getTasksHappeningAfter, isTaskActionable } = lookup.value;
        return stableUpcoming(groupByDate(getTasksHappeningAfter(today.value).filter(isTaskActionable)));
    });

    return { status, settings, revision, today, dataview, tasks, lookup, planned, backlog, upcoming };
}

/**
 * Returns a function that swaps each task for the one it returned last time with the same identity, when the two are
 * {@link Task.equals | equal}, so unchanged tasks keep their instance and downstream equality checks stay cheap.
 */
function createTaskInterner(): (tasks: readonly Task[]) => readonly Task[] {
    let previousByIdentity = new Map<string, Task>();
    return (tasks) => {
        const interned = tasks.map((task) => {
            const previous = previousByIdentity.get(task.identity);
            return previous?.equals(task) ? previous : task;
        });
        previousByIdentity = new Map(interned.map((task) => [task.identity, task]));
        return interned;
    };
}

/** Returns a function that hands back its previous result for as long as the next one holds the same elements. */
function createArrayStabilizer<T>(): (next: readonly T[]) => readonly T[] {
    let previous: readonly T[] = [];
    return (next) => (haveSameElements(previous, next) ? previous : (previous = next));
}

/** Like {@link createArrayStabilizer}, but also keeps each group whose date and tasks are unchanged. */
function createGroupsStabilizer(): (next: readonly UpcomingGroup[]) => readonly UpcomingGroup[] {
    const stableGroups = createArrayStabilizer<UpcomingGroup>();
    let previousByDate = new Map<string, UpcomingGroup>();
    return (next) => {
        const groups = next.map((group) => {
            const previous = previousByDate.get(group.date.toString());
            return previous && haveSameElements(previous.tasks, group.tasks) ? previous : group;
        });
        previousByDate = new Map(groups.map((group) => [group.date.toString(), group]));
        return stableGroups(groups);
    };
}

function haveSameElements<T>(a: readonly T[], b: readonly T[]): boolean {
    return a.length === b.length && a.every((element, index) => element === b[index]);
}

/** Groups tasks that are already sorted by {@link Task.happensDate}, keeping their order. */
function groupByDate(tasks: readonly Task[]): UpcomingGroup[] {
    const groups: { date: Temporal.PlainDate; tasks: Task[] }[] = [];
    for (const task of tasks) {
        const date = task.happensDate;
        if (!date) continue;
        const last = groups.at(-1);
        if (last?.date.equals(date)) {
            last.tasks.push(task);
        } else {
            groups.push({ date, tasks: [task] });
        }
    }
    return groups;
}
