import { Signal, signal } from "@preact/signals";
import type { Plugin } from "obsidian";
import { getAPI, isPluginEnabled } from "obsidian-dataview";
import { DataviewApi } from "obsidian-dataview/lib/api/plugin-api";
import { STask } from "obsidian-dataview/lib/data-model/serialized/markdown";
export type { Link } from "obsidian-dataview/lib/data-model/value";

import { Task, TaskLocation, TaskStatus } from "@/data/task";
import { parseEmojiTaskFields } from "@/lib/obsidian-tasks/parse-task";

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
        const pages = [...this.dv.pages(pageQuery, originFile).array()];
        return pages.flatMap((page) => {
            const sTasks = page.file.tasks.array();
            return sTasks.map((sTask: STask) => {
                const status: TaskStatus =
                    sTask.completed ? "DONE"
                    : sTask.checked ? "DROPPED"
                    : "OPEN";
                const location: TaskLocation = {
                    filePath: sTask.path,
                    fileName: sTask.section.fileName(),
                    fileSection: sTask.section.subpath,
                    fileLine: sTask.line,
                    fileStartByte: sTask.position.start.offset,
                    fileStopByte: sTask.position.end.offset,
                    obsidianHref: sTask.section.obsidianLink(),
                };
                const tags: readonly string[] = sTask.tags;
                let parsedTask = parseEmojiTaskFields(sTask.text);
                const scheduledDate = parsedTask.scheduledDate.isValid ? parsedTask.scheduledDate : page.file.day;

                return Task.fromFields({ ...parsedTask, status, scheduledDate, tags, location });
            });
        });
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
