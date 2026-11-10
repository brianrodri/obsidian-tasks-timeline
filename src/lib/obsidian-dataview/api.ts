import { isEqual } from "lodash";
import type { DataviewApi } from "obsidian-dataview";
import type { SMarkdownPage, STask } from "obsidian-dataview/lib/data-model/serialized/markdown";

import { Task, type TaskLocation, type TaskStatus } from "@/data/task";
import type { CachedTask, RawTaskInputs } from "@/lib/obsidian-dataview/api.types";
import { readEmojiTaskFields } from "@/lib/obsidian-tasks/parse-task-fields";
import { getPlugin, isPluginEnabled } from "@/lib/obsidian/adapters";
import type { App, Plugin } from "@/lib/obsidian/types";

export class Dataview {
    private readonly dv: DataviewApi;
    private cache: ReadonlyMap<string, CachedTask> = new Map();

    public constructor(plugin?: Plugin) {
        if (!plugin) throw new Error("plugin is required");
        const dv = getDataviewApi(plugin.app);
        if (!dv) throw new Error("obsidian-dataview must be installed and enabled");
        this.dv = dv;
    }

    /** IMPORTANT: Must be called within `onLayoutReady` callback, otherwise the plugin will freeze! */
    static async ensureDataviewReady(plugin: Plugin): Promise<Dataview> {
        return new Promise<Dataview>((resolve, reject) => {
            if (!isPluginEnabled(plugin.app, DATAVIEW_ID)) {
                reject(new Error("obsidian-dataview must be installed and enabled"));
            } else if (getDataviewApi(plugin.app)?.index.initialized) {
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

    /**
     * Returns the tasks on the pages matching `pageQuery`.
     *
     * A task whose inputs are unchanged since the previous call is returned as the same instance, without re-parsing.
     */
    public getTasks(pageQuery: string, originFile?: string): Task[] {
        // Dataview types `pages()` as generic records, but at runtime it yields serialized pages.
        const pages = this.dv.pages(pageQuery, originFile).array() as SMarkdownPage[];
        // Rebuilt on every call, so tasks that are no longer read are dropped.
        const nextCache = new Map<string, CachedTask>();

        const tasks = pages.flatMap((page) =>
            // Dataview types `file.tasks` as a plain array, but at runtime it is an iterable `DataArray` proxy.
            Array.from(page.file.tasks).map((sTask: STask) => {
                const inputs = this.readTaskInputs(page, sTask);
                // No two tasks in a file start at the same offset.
                const cacheKey = `${inputs.path}:${inputs.startOffset}`;
                const cached = this.cache.get(cacheKey);
                const task = cached && isEqual(cached.inputs, inputs) ? cached.task : this.buildTask(inputs);
                nextCache.set(cacheKey, { inputs, task });
                return task;
            }),
        );

        this.cache = nextCache;
        return tasks;
    }

    private readTaskInputs(page: SMarkdownPage, sTask: STask): RawTaskInputs {
        return {
            text: sTask.text,
            scheduled: this.toPlainDate(sTask.scheduled)?.toString(),
            fullyCompleted: sTask.fullyCompleted,
            checked: sTask.checked,
            tags: [...sTask.tags],
            path: sTask.path,
            fileName: sTask.section.fileName(),
            subpath: sTask.section.subpath,
            line: sTask.line,
            startOffset: sTask.position.start.offset,
            stopOffset: sTask.position.end.offset,
            obsidianHref: sTask.section.obsidianLink(),
            pageDay: this.toPlainDate(page.file.day)?.toString(),
        };
    }

    /** IMPORTANT: Must read nothing but `inputs`, or the cache in {@link getTasks} will serve stale tasks. */
    private buildTask(inputs: RawTaskInputs): Task {
        const emojiFields = readEmojiTaskFields(inputs.text);

        const scheduledDate =
            this.toPlainDate(inputs.scheduled) ??
            this.toPlainDate(emojiFields.scheduledDate) ??
            this.toPlainDate(inputs.pageDay);

        const status: TaskStatus =
            inputs.fullyCompleted ? "DONE"
            : inputs.checked ? "DROPPED"
            : "OPEN";

        const tags = new Set<string>(inputs.tags);

        const location: TaskLocation = {
            filePath: inputs.path,
            fileName: inputs.fileName,
            fileSection: inputs.subpath,
            fileLine: inputs.line,
            fileStartByte: inputs.startOffset,
            fileStopByte: inputs.stopOffset,
            obsidianHref: inputs.obsidianHref,
        };

        return Task.create({ ...emojiFields, status, scheduledDate, tags, location });
    }

    /**
     * Validates a raw date, returning `undefined` when it does not describe a real calendar date.
     *
     * Dataview hands out Luxon `DateTime`s; they are converted so the rest of the plugin only deals with Temporal.
     */
    private toPlainDate(value: unknown): Temporal.PlainDate | undefined {
        const date = this.dv.value.isDate(value) ? value.toISODate() : value;
        if (date === undefined || date === null) return undefined;
        try {
            return Temporal.PlainDate.from(date as Temporal.PlainDateLike, { overflow: "reject" });
        } catch {
            return undefined;
        }
    }
}

const DATAVIEW_ID = "dataview";

function getDataviewApi(app: App): DataviewApi | undefined {
    return getPlugin<{ api: DataviewApi }>(app, DATAVIEW_ID)?.api;
}
