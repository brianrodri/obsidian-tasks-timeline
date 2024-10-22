import type { DateTime } from "luxon";
import type { DataArray } from "obsidian-dataview/lib/api/data-array";
import type { DataviewApi as RealDataviewApi } from "obsidian-dataview/lib/api/plugin-api";
import type { FullIndex } from "obsidian-dataview/lib/data-index/index";
import type { SMarkdownPage, STask } from "obsidian-dataview/lib/data-model/serialized/markdown";

export type { DataArray } from "obsidian-dataview/lib/api/data-array";
export type { FullIndex } from "obsidian-dataview/lib/data-index/index";
export type { Link } from "obsidian-dataview/lib/data-model/value";

import { Builder } from "../utils/builder";

export interface DataviewApi extends RealDataviewApi {
    index: FullIndex;
}

export interface Page extends Omit<SMarkdownPage, "file"> {
    file: File;
}

export interface File extends Omit<SMarkdownPage["file"], "tasks" | "ctime" | "cday" | "mtime" | "mday"> {
    tasks?: DataArray<Task>;
    ctime?: DateTime<true>;
    cday?: DateTime<true>;
    mtime?: DateTime<true>;
    mday?: DateTime<true>;
}

export interface Task extends STask {
    start?: DateTime<true>;
    created?: DateTime<true>;
    due?: DateTime<true>;
    completion?: DateTime<true>;
    scheduled?: DateTime<true>;
}

export class TaskBuilder extends Builder<Task> {
    public withState(state: "open" | "done" | "cancelled") {
        switch (state) {
            case "open":
                return this.with("symbol", " ").with("checked", false).with("completed", false);
            case "done":
                return this.with("symbol", "x").with("checked", true).with("completed", true);
            case "cancelled":
                return this.with("symbol", "-").with("checked", true).with("completed", false);
        }
    }

    public override build() {
        return super.build({
            task: true,
            status: "",
            checked: false,
            completed: false,
            fullyCompleted: false,
            symbol: "",
            link: undefined,
            section: undefined,
            path: "",
            line: 0,
            lineCount: 0,
            position: { start: { line: 0, col: 0, offset: 0 }, end: { line: 0, col: 0, offset: 0 } },
            list: 0,
            children: [],
            outlinks: [],
            text: "",
            tags: [],
            subtasks: [],
            real: false,
            header: undefined,
        });
    }
}

export class FileBuilder extends Builder<File> {
    public override build() {
        return super.build({
            path: "",
            folder: "",
            name: "",
            link: undefined,
            outlinks: [],
            inlinks: [],
            etags: [],
            tags: [],
            aliases: [],
            lists: [],
            size: 0,
            ext: "",
            starred: false,
        });
    }
}

export function mockDataArray<T>(items: T[] = []): DataArray<T> {
    return { array: () => items } as unknown as DataArray<T>;
}
