import { Notice, Plugin, WorkspaceLeaf } from "obsidian";

import { DoneIcon } from "./assets/icons";
import { ensureDataviewReady } from "./compat/dataview-adapters";
import { NoticeMessage, Obsidian, ObsidianView } from "./compat/obsidian-adapters";
import { DEFAULT_SETTINGS } from "./config/settings";
import { TasksTimelineContextProvider } from "./hooks/use-tasks-timeline-context";

const VIEW_TYPE = "obsidian-tasks-timeline" as const;
const VIEW_HEADER = "Tasks timeline" as const;
const VIEW_ICON = "list-todo" as const;

export default class TasksTimelinePlugin extends Plugin {
    private settings = DEFAULT_SETTINGS;
    private readonly obsidian = new Obsidian(this);

    public override async onload(): Promise<void> {
        this.settings = await this.obsidian.loadData(DEFAULT_SETTINGS);
        this.registerView(VIEW_TYPE, (leaf) => this.createView(leaf));
        this.addRibbonIcon(VIEW_ICON, `Open ${VIEW_HEADER.toLowerCase()}`, () => this.obsidian.revealView(VIEW_TYPE));

        this.app.workspace.onLayoutReady(async () => {
            try {
                await ensureDataviewReady(this);
                await this.obsidian.attachView(VIEW_TYPE);
            } catch (error: unknown) {
                new Notice(new NoticeMessage(`Failed to load ${VIEW_TYPE}`, `${error}`));
            }
        });
    }

    public override async onunload(): Promise<void> {
        await this.obsidian.detachView(VIEW_TYPE);
    }

    private createView(leaf: WorkspaceLeaf): ObsidianView {
        const timeline = (
            <TasksTimelineContextProvider settings={this.settings} obsidian={this.obsidian}>
                {DoneIcon}
            </TasksTimelineContextProvider>
        );
        return new ObsidianView(leaf, VIEW_TYPE, VIEW_HEADER, VIEW_ICON, timeline);
    }
}
