import type { ReadonlySignal, Signal } from "@preact/signals";

import type { PluginSettings } from "@/data/settings";
import type { Task } from "@/data/task";
import type { TaskLookup } from "@/data/task-lookup";

export type StoreStatus = "loading" | "ready" | "error";

/** The part of the Dataview adapter the store reads tasks from. */
export interface TaskSource {
    getTasks(pageQuery: string): readonly Task[];
}

export interface UpcomingGroup {
    date: Temporal.PlainDate;
    tasks: readonly Task[];
}

export interface Store {
    // Sources: only actions and effects write these.
    status: Signal<StoreStatus>;
    settings: Signal<PluginSettings>;
    revision: Signal<number>;
    today: Signal<Temporal.PlainDate>;
    dataview: Signal<TaskSource | undefined>;

    // Derived: lazy, cached, never written.
    tasks: ReadonlySignal<readonly Task[]>;
    lookup: ReadonlySignal<TaskLookup>;
    planned: ReadonlySignal<readonly Task[]>;
    backlog: ReadonlySignal<readonly Task[]>;
    upcoming: ReadonlySignal<readonly UpcomingGroup[]>;
}
