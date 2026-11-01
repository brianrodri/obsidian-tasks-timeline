import type { Task } from "@/data/task";
import type { TasksApi } from "@/lib/obsidian-tasks/api";
import type { Obsidian } from "@/lib/obsidian/adapters";
import type { Actions } from "@/store/create-actions.types";
import type { Store } from "@/store/create-store.types";

/** Creates the only functions that write user intent: to the store's sources, or to files in the vault. */
export function createActions(store: Store, obsidian: Obsidian, tasksApi: TasksApi): Actions {
    /** Rewrites the task's own text in its file. Files change only here, and Obsidian's events update the store. */
    async function processTask({ location }: Task, process: (text: string, filePath: string) => string) {
        const { filePath, fileStartByte, fileStopByte } = location;
        if (!filePath) throw new Error("Task has no file to write to");
        await obsidian.processFileRange(filePath, fileStartByte, fileStopByte, (text) => process(text, filePath));
    }

    return {
        async updateSettings(part) {
            store.settings.value = { ...store.settings.peek(), ...part };
            await obsidian.saveData(store.settings.peek());
        },
        toggleTask(task) {
            return processTask(task, (text, filePath) => tasksApi.executeToggleTaskDoneCommand(text, filePath));
        },
    };
}
