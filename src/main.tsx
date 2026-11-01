import "../styles.css";
import "temporal-polyfill/global";

import { batch } from "@preact/signals";

import { AppContext } from "@/context/app-context";
import { DEFAULT_SETTINGS } from "@/data/settings";
import { AppView } from "@/layout/app-view";
import { Dataview } from "@/lib/obsidian-dataview/api";
import { TasksApi } from "@/lib/obsidian-tasks/api";
import { Obsidian, ObsidianView } from "@/lib/obsidian/adapters";
import { Plugin, type WorkspaceLeaf } from "@/lib/obsidian/types";
import { connectStore } from "@/store/connect-store";
import { createActions } from "@/store/create-actions";
import { createStore } from "@/store/create-store";

const VIEW_TYPE = "obsidian-tasks-timeline" as const;
const VIEW_HEADER = "Tasks timeline" as const;
const VIEW_ICON = "list-todo" as const;

export default class TasksTimelinePlugin extends Plugin {
    private readonly obsidian = new Obsidian(this);
    private readonly store = createStore();

    public override onload(): void {
        this.registerView(VIEW_TYPE, (leaf) => this.createView(leaf));
        this.addRibbonIcon(VIEW_ICON, `Open ${VIEW_HEADER.toLowerCase()}`, () => this.obsidian.revealView(VIEW_TYPE));

        this.app.workspace.onLayoutReady(async () => {
            try {
                this.store.settings.value = await this.obsidian.loadData(DEFAULT_SETTINGS);
                connectStore(this.store, this.obsidian);
                const dataview = await Dataview.ensureDataviewReady(this);
                batch(() => {
                    this.store.dataview.value = dataview;
                    this.store.status.value = "ready";
                });
            } catch (error: unknown) {
                this.store.status.value = "error";
                console.error(`Failed to load ${VIEW_TYPE}`, error);
                return;
            }
            // The store is ready even if this fails: views the workspace restored already read from it.
            await this.obsidian.attachView(VIEW_TYPE).catch((error: unknown) => {
                this.obsidian.reportError("Failed to open the tasks timeline", error);
            });
        });
    }

    private createView(leaf: WorkspaceLeaf): ObsidianView {
        const { store, obsidian } = this;
        const actions = createActions(store, obsidian, new TasksApi(this));
        const timelineView = (
            <AppContext value={{ store, actions, obsidian, plugin: this, leaf }}>
                <AppView />
            </AppContext>
        );
        return new ObsidianView(leaf, VIEW_TYPE, VIEW_HEADER, VIEW_ICON, timelineView);
    }
}
