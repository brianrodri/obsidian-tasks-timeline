import { ItemView, Keymap, type IconName, type Plugin, type UserEvent, type WorkspaceLeaf } from "@/lib/obsidian/types";
import { ComponentChild, ContainerNode, render } from "preact";

export class Obsidian {
    public readonly plugin: Plugin;

    public constructor(plugin?: Plugin) {
        if (!plugin) throw new Error("plugin is required");
        this.plugin = plugin;
    }

    public async loadData<T>(defaults: T): Promise<T> {
        const data = (await this.plugin.loadData()) ?? {};
        return { ...defaults, ...data };
    }

    public async saveData<T>(settings: T): Promise<void> {
        await this.plugin.saveData(settings);
    }

    public async processFileRange(
        filePath: string,
        startByte: number,
        stopByte: number,
        process: (payload: string) => string,
    ): Promise<void> {
        const file = this.plugin.app.vault.getFileByPath(filePath);
        if (file) {
            await this.plugin.app.vault.process(file, (fileContent: string) => {
                const head = fileContent.slice(0, startByte);
                const processed = process(fileContent.slice(startByte, stopByte));
                const tail = fileContent.slice(stopByte);
                return `${head}${processed}${tail}`;
            });
        }
    }

    public async openVaultLink(event: Event, linktext: string, sourcePath: string) {
        event.preventDefault();
        await this.plugin.app.workspace.openLinkText(linktext, sourcePath, Keymap.isModEvent(event as UserEvent));
    }

    public openVaultHover(event: Event, linktext: string, sourcePath: string, leaf: WorkspaceLeaf) {
        event.preventDefault();
        this.plugin.app.workspace.trigger("hover-link", {
            source: "preview",
            hoverParent: leaf.view.containerEl,
            targetEl: event.target,
            event,
            linktext,
            sourcePath,
        });
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
