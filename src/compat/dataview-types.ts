import type { DateTime } from "luxon";
import type { DataArray } from "obsidian-dataview/lib/api/data-array";
import type { DataviewApi as RealDataviewApi } from "obsidian-dataview/lib/api/plugin-api";
import type { FullIndex } from "obsidian-dataview/lib/data-index/index";
import type { SMarkdownPage, STask } from "obsidian-dataview/lib/data-model/serialized/markdown";

export type { DataArray } from "obsidian-dataview/lib/api/data-array";

export type { FullIndex } from "obsidian-dataview/lib/data-index/index";

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
