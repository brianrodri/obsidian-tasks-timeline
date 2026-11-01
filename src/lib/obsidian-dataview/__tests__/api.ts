import { describe, expect, it, vi } from "vitest";

import type { Plugin } from "@/lib/obsidian/types";

import { Dataview } from "../api";

/** Stands in for the Luxon `DateTime`s Dataview hands out. */
class FakeDateTime {
    private readonly iso: string;
    public constructor(iso: string) {
        this.iso = iso;
    }
    public toISODate() {
        return this.iso;
    }
}

interface FakeTaskInput {
    text: string;
    scheduled: FakeDateTime | undefined;
    fullyCompleted: boolean;
    checked: boolean;
    tags: string[];
    path: string;
    subpath: string | undefined;
    fileName: string;
    line: number;
    startOffset: number;
    stopOffset: number;
    obsidianLink: string;
    day: FakeDateTime | undefined;
}

const INPUT: FakeTaskInput = {
    text: "do it 📅 2024-10-30",
    scheduled: undefined,
    fullyCompleted: false,
    checked: false,
    tags: ["#a"],
    path: "notes/a.md",
    subpath: "Heading",
    fileName: "a",
    line: 3,
    startOffset: 10,
    stopOffset: 30,
    obsidianLink: "[[a#Heading]]",
    day: undefined,
};

function toPage(input: FakeTaskInput) {
    const sTask = {
        text: input.text,
        scheduled: input.scheduled,
        fullyCompleted: input.fullyCompleted,
        checked: input.checked,
        tags: input.tags,
        path: input.path,
        line: input.line,
        position: { start: { offset: input.startOffset }, end: { offset: input.stopOffset } },
        section: { subpath: input.subpath, fileName: () => input.fileName, obsidianLink: () => input.obsidianLink },
    };
    return { file: { tasks: [sTask], day: input.day } };
}

function setup() {
    let pages: ReturnType<typeof toPage>[] = [];
    const api = {
        index: { revision: 1, initialized: true },
        pages: vi.fn(() => ({ array: () => pages })),
        value: { isDate: (value: unknown) => value instanceof FakeDateTime },
    };
    const plugin = {
        app: { plugins: { plugins: { dataview: { api } } }, metadataCache: { on: vi.fn() } },
        registerEvent: vi.fn(),
    };
    const dataview = new Dataview(plugin as unknown as Plugin);
    return {
        read: (...inputs: FakeTaskInput[]) => {
            pages = inputs.map(toPage);
            return dataview.getTasks("");
        },
    };
}

describe("Dataview.getTasks", () => {
    it("returns the same task instance for unchanged input", () => {
        const { read } = setup();
        const [first] = read(INPUT);
        const [second] = read(INPUT);
        expect(second).toBe(first);
    });

    it.each<[keyof FakeTaskInput, FakeTaskInput[keyof FakeTaskInput]]>([
        ["text", "do that 📅 2024-10-30"],
        ["scheduled", new FakeDateTime("2024-10-26")],
        ["fullyCompleted", true],
        ["checked", true],
        ["tags", ["#a", "#b"]],
        ["path", "notes/b.md"],
        ["subpath", "Other"],
        ["fileName", "b"],
        ["line", 4],
        ["startOffset", 11],
        ["stopOffset", 31],
        ["obsidianLink", "[[a#Other]]"],
        ["day", new FakeDateTime("2024-10-27")],
    ])("builds a new task when only %s changes", (key, value) => {
        const { read } = setup();
        const [first] = read(INPUT);
        const [second] = read({ ...INPUT, [key]: value });
        expect(second).not.toBe(first);
        expect(first && second?.equals(first)).toBe(false);
    });

    it("forgets tasks that are no longer read", () => {
        const { read } = setup();
        const [first] = read(INPUT);
        read();
        const [second] = read(INPUT);
        expect(second).not.toBe(first);
    });
});
