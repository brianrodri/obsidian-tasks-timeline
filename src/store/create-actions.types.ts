import type { PluginSettings } from "@/data/settings";
import type { Task, TaskDateField } from "@/data/task";

export interface Actions {
    /**
     * Merges `part` into the settings and saves them after any earlier save settles. Rejects if the save fails; the
     * store keeps the merged settings as the user's latest intent, and the next save writes them.
     */
    updateSettings(part: Partial<PluginSettings>): Promise<void>;
    /** Toggles the task done through the Tasks plugin. Resolves once written; rejects if the write fails. */
    toggleTask(task: Task): Promise<void>;
    /** Writes `isoDate` into the task's emoji date field. Resolves once written; rejects if the write fails. */
    setTaskDate(task: Task, field: TaskDateField, isoDate: string): Promise<void>;
}
