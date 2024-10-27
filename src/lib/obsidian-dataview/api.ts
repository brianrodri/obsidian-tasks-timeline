import { Signal, signal } from "@preact/signals";
import type { Plugin } from "obsidian";
import { getAPI, isPluginEnabled } from "obsidian-dataview";
import { DataviewApi } from "obsidian-dataview/lib/api/plugin-api";
import { STask } from "obsidian-dataview/lib/data-model/serialized/markdown";
export type { Link } from "obsidian-dataview/lib/data-model/value";

import { Task } from "@/data/task";

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

    public getTasks(pageQuery: string, originFile?: string): Task[] {
        return this.dv
            .pages(pageQuery, originFile)
            .flatMap(
                (page) =>
                    page.file.tasks.array().map((sTask: STask) =>
                        Task.fromFields({
                            status:
                                sTask.completed ? "DONE"
                                : sTask.checked ? "DROPPED"
                                : "OPEN",
                            description: sTask.text,
                            createdDate: sTask.created,
                            doneDate: sTask.completion,
                            dueDate: sTask.due,
                            scheduledDate: sTask.scheduled,
                            startDate: sTask.start,
                        }),
                    ) as Task[],
            )
            .array();
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
