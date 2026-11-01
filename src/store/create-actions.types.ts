import type { PluginSettings } from "@/data/settings";
import type { Task } from "@/data/task";

export interface Actions {
    /** Merges `part` into the settings and saves them. Rejects if the save fails. */
    updateSettings(part: Partial<PluginSettings>): Promise<void>;
    /** Toggles the task done through the Tasks plugin. Resolves once written; rejects if the write fails. */
    toggleTask(task: Task): Promise<void>;
}
