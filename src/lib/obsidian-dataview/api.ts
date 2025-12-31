import { Signal, signal } from "@preact/signals";
import { DateTime } from "luxon";
import { DataviewApi, getAPI, isPluginEnabled } from "obsidian-dataview";
import { SMarkdownPage, STask } from "obsidian-dataview/lib/data-model/serialized/markdown";

import { Task, TaskLocation, TaskStatus } from "@/data/task";
import type { Plugin } from "@/lib/obsidian/types";
import { readEmojiTaskFields } from "@/lib/obsidian-tasks/parse-task-fields";

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
                    plugin.app.metadataCache.on("dataview:index-ready", () => resolve(new Dataview(plugin))),
                );
            }
        });
    }

    public getTasks(pageQuery: string, originFile?: string): Task[] {
        const pages = this.dv.pages(pageQuery, originFile).array();

        return pages.flatMap((page: SMarkdownPage) =>
            // @ts-expect-error DataviewApi is wrong about the type of file.tasks.
            page.file.tasks.array().map((sTask: STask) => {
                const emojiFields = readEmojiTaskFields(sTask.text);

                const scheduledDate: DateTime<boolean> =
                    sTask.scheduled?.isValid ? sTask.scheduled
                    : emojiFields.scheduledDate?.isValid ? emojiFields.scheduledDate
                    : page.file.day;

                const status: TaskStatus =
                    sTask.fullyCompleted ? "DONE"
                    : sTask.checked ? "DROPPED"
                    : "OPEN";

                const tags: Set<string> = new Set(sTask.tags);

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
