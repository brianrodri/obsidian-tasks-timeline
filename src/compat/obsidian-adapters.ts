import type { Plugin } from "obsidian";
import { IconName, ItemView, WorkspaceLeaf } from "obsidian";
import { ComponentChild, ContainerNode, render } from "preact";

import { DEFAULT_SETTINGS, TasksTimelineSettings } from "../config/settings";

export class Obsidian {
    public constructor(public readonly plugin: Plugin) {}

    public async loadSettings(): Promise<TasksTimelineSettings> {
        const data = (await this.plugin.loadData()) ?? {};
        return { ...DEFAULT_SETTINGS, ...data };
    }

    public async saveSettings(settings: TasksTimelineSettings): Promise<void> {
        await this.plugin.saveData(settings);
    }
}

export class ObsidianView extends ItemView {
    private container: ContainerNode;

    public constructor(
        leaf: WorkspaceLeaf,
        private readonly viewType: string,
        private readonly displayText: string,
        private readonly iconName: IconName,
        private readonly component: ComponentChild,
    ) {
        super(leaf);
        this.container = this.containerEl.children[1];
    }

    public override getViewType(): string {
        return this.viewType;
    }

    public override getDisplayText(): string {
        return this.displayText;
    }

    public override getIcon(): IconName {
        return this.iconName;
    }

    protected override async onOpen(): Promise<void> {
        render(this.component, this.container);
    }

    protected override async onClose(): Promise<void> {
        render(null, this.container);
    }
}
