import "core-js/features/iterator";

import { Notice, Plugin } from "obsidian";

import { PluginContextProvider } from "@/context/plugin-context";
import { TasksStateProvider } from "@/context/tasks-state";
import { DEFAULT_SETTINGS } from "@/data/settings";
import { Dataview, ensureDataviewReady } from "@/lib/obsidian-dataview/api";
import { TasksApi } from "@/lib/obsidian-tasks/api";
import { NoticeMessage, Obsidian, ObsidianView, WorkspaceLeaf } from "@/lib/obsidian/api";
import { TodayView } from "./layout/today-view";
import { signal } from "@preact/signals";

const VIEW_TYPE = "obsidian-tasks-timeline" as const;
const VIEW_HEADER = "Tasks timeline" as const;
const VIEW_ICON = "list-todo" as const;

export default class TasksTimelinePlugin extends Plugin {
    private settings = signal(DEFAULT_SETTINGS);
    private readonly obsidian = new Obsidian(this);

    public override async onload(): Promise<void> {
        this.settings.value = await this.obsidian.loadData(DEFAULT_SETTINGS);
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
        const timelineView = (
            <PluginContextProvider
                leaf={leaf}
                settings={this.settings}
                obsidian={this.obsidian}
                dataview={new Dataview(this)}
                tasksApi={new TasksApi(this)}
            >
                <TasksStateProvider>
                    <TodayView />
                </TasksStateProvider>
            </PluginContextProvider>
        );
        return new ObsidianView(leaf, VIEW_TYPE, VIEW_HEADER, VIEW_ICON, timelineView);
    }
}
