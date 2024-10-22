import { Plugin } from "obsidian";

/**
 * Tasks API v1 interface
 */
interface TasksApiV1 {
    /**
     * Opens the Tasks UI and returns the Markdown string for the task entered.
     *
     * @returns {Promise<string>} A promise that contains the Markdown string for the task entered or
     * an empty string, if data entry was cancelled.
     */
    createTaskLineModal(): Promise<string>;

    /**
     * Executes the 'Tasks: Toggle task done' command on the supplied line string
     *
     * @param line The markdown string of the task line being toggled
     * @param path The path to the file containing line
     * @returns The updated line string, which will contain two lines
     *          if a recurring task was completed.
     */
    executeToggleTaskDoneCommand(line: string, path: string): string;
}

export class TasksApi implements TasksApiV1 {
    private readonly apiV1: TasksApiV1;

    public constructor(plugin?: Plugin) {
        // @ts-expect-error - official guidance for accessing the plugin, see:
        // https://publish.obsidian.md/tasks/Advanced/Tasks+Api
        const apiV1 = plugin?.app?.plugins?.plugins?.["obsidian-tasks-plugin"].apiV1 as TasksApiV1;
        if (!apiV1) {
            throw new Error("obsidian-tasks-plugin must be installed");
        }
        this.apiV1 = apiV1;
    }

    public async createTaskLineModal(): Promise<string> {
        return this.apiV1.createTaskLineModal();
    }

    public executeToggleTaskDoneCommand(line: string, path: string): string {
        return this.apiV1.executeToggleTaskDoneCommand(line, path);
    }
}
