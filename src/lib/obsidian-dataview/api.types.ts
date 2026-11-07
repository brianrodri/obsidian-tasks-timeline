import type { Task } from "@/data/task";

/**
 * Every value {@link Task} is built from, read off a Dataview task and its page as plain data.
 *
 * Tasks are built only from these, so two equal records always build equal tasks.
 */
export interface RawTaskInputs {
    text: string;
    scheduled: string | undefined;
    fullyCompleted: boolean;
    checked: boolean;
    tags: string[];
    path: string;
    fileName: string;
    subpath: string | undefined;
    line: number;
    startOffset: number;
    stopOffset: number;
    obsidianHref: string;
    pageDay: string | undefined;
}

export interface CachedTask {
    inputs: RawTaskInputs;
    task: Task;
}
