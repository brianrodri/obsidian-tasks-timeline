import { Notice, Plugin, WorkspaceLeaf } from "obsidian";

import { DoneIcon } from "./assets/icons";
import { ensureDataviewReady } from "./compat/dataview-adapters";
import { NoticeMessage, ObsidianView } from "./compat/obsidian-adapters";

const VIEW_TYPE = "obsidian-tasks-timeline" as const;
const VIEW_HEADER = "Tasks timeline" as const;
const VIEW_ICON = "list-todo" as const;

export default class TasksTimelinePlugin extends Plugin {
    public override onload(): void {
        this.registerView(VIEW_TYPE, (leaf) => this.createView(leaf));
        this.addRibbonIcon(VIEW_ICON, `Open ${VIEW_HEADER.toLowerCase()}`, () => this.revealView());

        this.app.workspace.onLayoutReady(async () => {
            try {
                await ensureDataviewReady(this);
                await this.attachView();
            } catch (error: unknown) {
                new Notice(new NoticeMessage(`Failed to load ${VIEW_TYPE}`, `${error}`));
            }
        });
    }

    public override async onunload(): Promise<void> {
        await this.detachView();
    }

    private async revealView(): Promise<void> {
        const [leaf] = this.app.workspace.getLeavesOfType(VIEW_TYPE);
        if (leaf) {
            await this.app.workspace.revealLeaf(leaf);
        } else {
            await this.detachView();
            await this.app.workspace.getRightLeaf(false)?.setViewState({ type: VIEW_TYPE, active: true });
            this.app.workspace.rightSplit.expand();
        }
    }

    private async attachView(): Promise<void> {
        const [leaf] = this.app.workspace.getLeavesOfType(VIEW_TYPE);
        if (!leaf) {
            await this.detachView();
            await this.app.workspace.getRightLeaf(false)?.setViewState({ type: VIEW_TYPE });
        }
    }

    private async detachView(): Promise<void> {
        return this.app.workspace.detachLeavesOfType(VIEW_TYPE);
    }

    private createView(leaf: WorkspaceLeaf): ObsidianView {
        return new ObsidianView(leaf, VIEW_TYPE, VIEW_HEADER, VIEW_ICON, DoneIcon);
    }
}
