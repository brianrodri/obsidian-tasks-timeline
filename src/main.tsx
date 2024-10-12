import { Notice, Plugin } from "obsidian";

import { DoneIcon } from "./assets/icons";
import { ensureDataviewReady } from "./compat/dataview-adapters";
import { NoticeMessage, ObsidianView } from "./compat/obsidian-adapters";

const VIEW_TYPE = "obsidian-tasks-timeline" as const;
const VIEW_HEADER = "Tasks timeline" as const;
const VIEW_ICON = "list-todo" as const;

export default class TasksTimelinePlugin extends Plugin {
    public override onload(): void {
        ensureDataviewReady(this).then(
            () => this.initialize(),
            (e) => new Notice(new NoticeMessage(`Failed to load ${VIEW_TYPE}`, e)),
        );
    }

    public override onunload(): void {
        this.app.workspace.detachLeavesOfType(VIEW_TYPE);
    }

    private initialize(): void {
        this.registerView(VIEW_TYPE, (leaf) => new ObsidianView(leaf, VIEW_TYPE, VIEW_HEADER, VIEW_ICON, DoneIcon));
        this.app.workspace.detachLeavesOfType(VIEW_TYPE);
        this.app.workspace.getRightLeaf(false)?.setViewState({ type: VIEW_TYPE, active: true });
    }
}
