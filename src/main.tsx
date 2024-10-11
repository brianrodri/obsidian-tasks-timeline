import { DEFAULT_SETTINGS, TasksTimelineSettings } from "config/settings";
import { Plugin } from "obsidian";

export default class TasksTimelinePlugin extends Plugin {
    private settings: Readonly<TasksTimelineSettings> = DEFAULT_SETTINGS;

    public override async onload(): Promise<void> {
        await this.loadSettings();
    }

    public override async onunload(): Promise<void> {
        await this.saveSettings();
    }

    public getSettings(): TasksTimelineSettings {
        return this.settings;
    }

    public overwriteSettings(changes: Partial<TasksTimelineSettings>): void {
        this.settings = { ...this.settings, ...changes };
    }

    public async loadSettings(): Promise<void> {
        const data = await this.loadData();
        this.settings = { ...DEFAULT_SETTINGS, ...data };
    }

    public async saveSettings(): Promise<void> {
        await this.saveData(this.settings);
    }
}
