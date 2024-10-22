import { signal, Signal } from "@preact/signals";
import type { Plugin } from "obsidian";
import { getAPI, isPluginEnabled } from "obsidian-dataview";

import { DataviewApi, Page, Task } from "./types";

export class Dataview {
    private readonly plugin: Plugin;
    private readonly dv: DataviewApi;
    public readonly revision: Signal<number>;

    public constructor(plugin?: Plugin) {
        if (!plugin) throw new Error("plugin is required");
        this.plugin = plugin;
        this.dv = getAPI(this.plugin.app) as DataviewApi;
        this.revision = signal(this.dv.index.revision);

        this.plugin.registerEvent(
            this.plugin.app.metadataCache.on(
                // @ts-expect-error - obsidian doesn't define overloads for third-party events.
                "dataview:metadata-change",
                () => (this.revision.value = this.dv.index.revision),
            ),
        );
    }

    public getPage(path: string): Page | undefined {
        return this.dv.page(path) as Page | undefined;
    }

    public getPages(query: string, originFile?: string): Page[] {
        return this.dv.pages(query, originFile).array() as Page[];
    }

    public getScheduledDate(task: Task): string {
        const scheduled = task.scheduled?.toISODate() ?? this.getPage(task.path)?.file.day?.toISODate() ?? null;
        const start = task.start?.toISODate() ?? null;
        return scheduled && start && scheduled < start ? start : (scheduled ?? "");
    }
}

/** IMPORTANT: Must be called within `onLayoutReady` callback, otherwise the plugin will freeze! */
export async function ensureDataviewReady(plugin: Plugin): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        if (!isPluginEnabled(plugin.app)) {
            reject(new Error("obsidian-dataview must be installed and enabled"));
        } else if (getAPI(plugin.app)?.index.initialized) {
            resolve();
        } else {
            // @ts-expect-error - obsidian doesn't define types for third-party events.
            plugin.registerEvent(plugin.app.metadataCache.on("dataview:index-ready", resolve));
        }
    });
}
