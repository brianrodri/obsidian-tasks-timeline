import "core-js/features/iterator";
import "core-js/features/set";

import { signal } from "@preact/signals";
import { Plugin } from "obsidian";

import { PluginContextProvider } from "@/context/plugin-context";
import { DEFAULT_SETTINGS } from "@/data/settings";
import { TodayView } from "@/layout/today-view";
import { Dataview } from "@/lib/obsidian-dataview/api";
import { TasksApi } from "@/lib/obsidian-tasks/api";
import { Obsidian, ObsidianView, WorkspaceLeaf } from "@/lib/obsidian/api";

const VIEW_TYPE = "obsidian-tasks-timeline" as const;
const VIEW_HEADER = "Tasks timeline" as const;
const VIEW_ICON = "list-todo" as const;

export default class TasksTimelinePlugin extends Plugin {
    private settingsSignal = signal(DEFAULT_SETTINGS);
    private readonly obsidian = new Obsidian(this);
    private readonly dataviewSignal = signal<Dataview>();

    public override async onload(): Promise<void> {
        this.registerView(VIEW_TYPE, (leaf) => this.createView(leaf));
        this.addRibbonIcon(VIEW_ICON, `Open ${VIEW_HEADER.toLowerCase()}`, () => this.obsidian.revealView(VIEW_TYPE));

        this.app.workspace.onLayoutReady(async () => {
            try {
                this.settingsSignal.value = await this.obsidian.loadData(DEFAULT_SETTINGS);
                this.dataviewSignal.value = await Dataview.ensureDataviewReady(this);
                await this.obsidian.attachView(VIEW_TYPE);
            } catch (error: unknown) {
                console.error(`Failed to load ${VIEW_TYPE}: ${error}`);
            }
        });
    }

    public override async onunload(): Promise<void> {
        await this.obsidian.detachView(VIEW_TYPE);
    }

    private createView(leaf: WorkspaceLeaf): ObsidianView {
        const timelineView = (
            <PluginContextProvider
                plugin={this}
                leaf={leaf}
                settingsSignal={this.settingsSignal}
                setSettings={(part) => (this.settingsSignal.value = { ...this.settingsSignal.value, ...part })}
                obsidian={this.obsidian}
                dataviewSignal={this.dataviewSignal}
                tasksApi={new TasksApi(this)}
            >
                <TodayView />
            </PluginContextProvider>
        );
        return new ObsidianView(leaf, VIEW_TYPE, VIEW_HEADER, VIEW_ICON, timelineView);
    }
}
