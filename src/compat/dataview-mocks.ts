import { signal } from "@preact/signals";
import { vi } from "vitest";

import { Builder } from "../utils/interface-builder";
import { Dataview } from "./dataview-adapters";
import { DataArray, DataviewApi, File, FullIndex, Page, Task } from "./dataview-types";

export class DataArrayMock<T> implements Partial<DataArray<T>> {
    public constructor(private readonly items: T[] = []) {}
    public array = vi.fn(() => [...this.items]);
}

export function mockDataArray<T>(items: T[] = []): DataArray<T> {
    return new DataArrayMock(items) as unknown as DataArray<T>;
}

export class FullIndexMock implements Partial<DataviewApi["index"]> {
    public constructor(public revision = 0) {}
}

export class DataviewApiMock implements Partial<DataviewApi> {
    public constructor(public index = new FullIndexMock() as FullIndex) {}
}

export class DataviewMock implements Partial<Dataview> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public getPage = vi.fn((_) => undefined as Page | undefined);
    public getPages = vi.fn(() => [] as Page[]);
    public revision = signal(0);
    public casted = () => this as unknown as Dataview;
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
