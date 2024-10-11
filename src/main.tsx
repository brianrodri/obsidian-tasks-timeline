import { Plugin } from "obsidian";

import { DoneIcon } from "./assets/icons";
import { Obsidian, ObsidianView } from "./compat/obsidian-adapters";
import { DEFAULT_SETTINGS, TasksTimelineSettings } from "./config/settings";

const VIEW_TYPE = "obsidian-tasks-timeline" as const;
const VIEW_HEADER = "Tasks timeline" as const;
const VIEW_ICON = "list-todo" as const;

export default class TasksTimelinePlugin extends Plugin {
    private readonly obsidian = new Obsidian(this);
    private settings: Readonly<TasksTimelineSettings> = DEFAULT_SETTINGS;

    public override async onload(): Promise<void> {
        this.settings = await this.obsidian.loadSettings();
        this.registerView(VIEW_TYPE, (leaf) => new ObsidianView(leaf, VIEW_TYPE, VIEW_HEADER, VIEW_ICON, DoneIcon));
        this.app.workspace.onLayoutReady(() => this.setupView());
    }

    public override async onunload(): Promise<void> {
        this.teardownView();
        await this.obsidian.saveSettings(this.settings);
    }

    private async setupView() {
        const [existingView] = this.app.workspace.getLeavesOfType(VIEW_TYPE);
        if (!existingView) {
            this.app.workspace.detachLeavesOfType(VIEW_TYPE);
            const viewState = { type: VIEW_TYPE, active: true };
            await this.app.workspace.getRightLeaf(false)?.setViewState(viewState);
        }
    }

    private teardownView(): void {
        this.app.workspace.detachLeavesOfType(VIEW_TYPE);
    }
}
