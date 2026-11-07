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

    const tasks = computed(() => {
        // Dataview's index is not a signal, so subscribe to its revision to re-run the query when the index changes.
        noop(revision.value);
        if (status.value !== "ready") return [];
        return dataview.value?.getTasks(settings.value.pageQuery) ?? [];
    });
    const lookup = computed(() => new TaskLookup([...tasks.value]));
    const planned = computed(() => {
        const { getTasksHappeningOn, isTaskActionable } = lookup.value;
        return getTasksHappeningOn(today.value).filter(isTaskActionable);
    });
    const backlog = computed(() => {
        const { getTasksHappeningBefore, undatedTasks, isTaskActionable } = lookup.value;
        return [...getTasksHappeningBefore(today.value).toReversed(), ...undatedTasks].filter(isTaskActionable);
    });
    const upcoming = computed(() => {
        const { getTasksHappeningAfter, isTaskActionable } = lookup.value;
        return groupByDate(getTasksHappeningAfter(today.value).filter(isTaskActionable));
    });

    return { status, settings, revision, today, dataview, tasks, lookup, planned, backlog, upcoming };
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
