import { type Signal, signal } from "@preact/signals";
import { DateTime } from "luxon";
import { type DataviewApi, getAPI, isPluginEnabled } from "obsidian-dataview";
import type { SMarkdownPage, STask } from "obsidian-dataview/lib/data-model/serialized/markdown";

import { Task, type TaskLocation, type TaskStatus } from "@/data/task";
import { readEmojiTaskFields } from "@/lib/obsidian-tasks/parse-task-fields";
import type { Plugin } from "@/lib/obsidian/types";

export class Dataview {
    private readonly plugin: Plugin;
    private readonly dv: DataviewApi;

    public readonly revision: Signal<number>;

    public constructor(plugin?: Plugin) {
        if (!plugin) throw new Error("plugin is required");
        const dv = getAPI(plugin.app);
        if (!dv) throw new Error("obsidian-dataview must be installed and enabled");
        this.plugin = plugin;
        this.dv = dv;

        this.revision = signal(this.dv.index.revision);

        this.plugin.registerEvent(
            this.plugin.app.metadataCache.on(
                // @ts-expect-error - obsidian doesn't define overloads for third-party events.
                "dataview:metadata-change",
                () => (this.revision.value = this.dv.index.revision),
            ),
        );
    }

    /** IMPORTANT: Must be called within `onLayoutReady` callback, otherwise the plugin will freeze! */
    static async ensureDataviewReady(plugin: Plugin): Promise<Dataview> {
        return new Promise<Dataview>((resolve, reject) => {
            if (!isPluginEnabled(plugin.app)) {
                reject(new Error("obsidian-dataview must be installed and enabled"));
            } else if (getAPI(plugin.app)?.index.initialized) {
                resolve(new Dataview(plugin));
            } else {
                plugin.registerEvent(
                    // @ts-expect-error - obsidian doesn't define types for third-party events.
                    plugin.app.metadataCache.on("dataview:index-ready", () => {
                        resolve(new Dataview(plugin));
                    }),
                );
            }
        });
    }

    public getTasks(pageQuery: string, originFile?: string): Task[] {
        // Dataview types `pages()` as generic records, but at runtime it yields serialized pages.
        const pages = this.dv.pages(pageQuery, originFile).array() as SMarkdownPage[];

        return pages.flatMap((page) =>
            // Dataview types `file.tasks` as a plain array, but at runtime it is an iterable `DataArray` proxy.
            Array.from(page.file.tasks).map((sTask: STask) => {
                const emojiFields = readEmojiTaskFields(sTask.text);

                const scheduledDate =
                    DateTime.isDateTime(sTask.scheduled) && sTask.scheduled.isValid ? sTask.scheduled
                    : emojiFields.scheduledDate?.isValid ? emojiFields.scheduledDate
                    : page.file.day;

                const status: TaskStatus =
                    sTask.fullyCompleted ? "DONE"
                    : sTask.checked ? "DROPPED"
                    : "OPEN";

                const tags = new Set<string>(sTask.tags);

                const location: TaskLocation = {
                    filePath: sTask.path,
                    fileName: sTask.section.fileName(),
                    fileSection: sTask.section.subpath,
                    fileLine: sTask.line,
                    fileStartByte: sTask.position.start.offset,
                    fileStopByte: sTask.position.end.offset,
                    obsidianHref: sTask.section.obsidianLink(),
                };

                return Task.create({ ...emojiFields, status, scheduledDate, tags, location });
            }),
        );
    }
}
