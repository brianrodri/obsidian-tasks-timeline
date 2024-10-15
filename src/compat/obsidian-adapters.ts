import type { Plugin } from "obsidian";
import { IconName, ItemView, WorkspaceLeaf } from "obsidian";
import { ComponentChild, ContainerNode, render } from "preact";

export class Obsidian {
    public constructor(public readonly plugin: Plugin) {}

    public async loadData<T>(defaults: T): Promise<T> {
        const data = (await this.plugin.loadData()) ?? {};
        return { ...defaults, ...data };
    }

    public async saveData<T>(settings: T): Promise<void> {
        await this.plugin.saveData(settings);
    }

    public async attachView(type: string): Promise<void> {
        const [leaf] = this.plugin.app.workspace.getLeavesOfType(type);
        if (!leaf) {
            await this.detachView(type);
            await this.plugin.app.workspace.getRightLeaf(false)?.setViewState({ type });
        }
    }

    public async detachView(type: string): Promise<void> {
        return this.plugin.app.workspace.detachLeavesOfType(type);
    }

    public async revealView(type: string): Promise<void> {
        const [leaf] = this.plugin.app.workspace.getLeavesOfType(type);
        if (leaf) {
            await this.plugin.app.workspace.revealLeaf(leaf);
        } else {
            await this.detachView(type);
            await this.plugin.app.workspace.getRightLeaf(false)?.setViewState({ type, active: true });
            this.plugin.app.workspace.rightSplit.expand();
        }
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

export class NoticeMessage extends DocumentFragment {
    public constructor(header: string, content: string) {
        super();
        this.createEl("h4", { text: header });
        this.createEl("p", { text: content });
    }
}
