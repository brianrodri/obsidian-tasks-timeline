import { describe, expect, it, vi } from "vitest";

import { Task } from "@/data/task";
import type { TasksApi } from "@/lib/obsidian-tasks/api";
import type { Obsidian } from "@/lib/obsidian/adapters";

import { createActions } from "../create-actions";
import { createStore } from "../create-store";

const TASK = Task.create({ location: { filePath: "notes/a.md", fileStartByte: 10, fileStopByte: 20 } });

function setup() {
    const store = createStore();
    const obsidian = {
        saveData: vi.fn<Obsidian["saveData"]>(() => Promise.resolve()),
        processFileRange: vi.fn<Obsidian["processFileRange"]>(() => Promise.resolve()),
    };
    const tasksApi = {
        executeToggleTaskDoneCommand: vi.fn<TasksApi["executeToggleTaskDoneCommand"]>((line) => `${line} toggled`),
    };
    const actions = createActions(store, obsidian as unknown as Obsidian, tasksApi as unknown as TasksApi);
    return { store, obsidian, tasksApi, actions };
}

describe("createActions", () => {
    it("merges a settings update into the store and saves it", async () => {
        const { store, obsidian, actions } = setup();
        const before = store.settings.value;

        await actions.updateSettings({ pageQuery: "#work" });

        expect(store.settings.value).toEqual({ ...before, pageQuery: "#work" });
        expect(obsidian.saveData).toHaveBeenCalledExactlyOnceWith(store.settings.value);
    });

    it("rejects when the settings fail to save", async () => {
        const { obsidian, actions } = setup();
        const error = new Error("boom");
        obsidian.saveData.mockRejectedValue(error);

        await expect(actions.updateSettings({ pageQuery: "#work" })).rejects.toBe(error);
    });

    it("toggles a task through the Tasks plugin, in place", async () => {
        const { obsidian, tasksApi, actions } = setup();

        await actions.toggleTask(TASK);

        expect(obsidian.processFileRange).toHaveBeenCalledWith("notes/a.md", 10, 20, expect.any(Function));
        const transform = obsidian.processFileRange.mock.calls[0]?.[3];
        expect(transform?.("- [ ] a")).toEqual("- [ ] a toggled");
        expect(tasksApi.executeToggleTaskDoneCommand).toHaveBeenCalledWith("- [ ] a", "notes/a.md");
    });

    it("rejects toggling a task without a file", async () => {
        const { obsidian, actions } = setup();

        await expect(actions.toggleTask(Task.create({}))).rejects.toThrow("has no file");

        expect(obsidian.processFileRange).not.toHaveBeenCalled();
    });

    it("rejects when the toggle fails to write", async () => {
        const { obsidian, actions } = setup();
        const error = new Error("boom");
        obsidian.processFileRange.mockRejectedValue(error);

        await expect(actions.toggleTask(TASK)).rejects.toBe(error);
    });

    it("writes a task date field in place", async () => {
        const { obsidian, actions } = setup();

        await actions.setTaskDate(TASK, "dueDate", "2024-10-26");

        expect(obsidian.processFileRange).toHaveBeenCalledWith("notes/a.md", 10, 20, expect.any(Function));
        const transform = obsidian.processFileRange.mock.calls[0]?.[3];
        expect(transform?.("- [ ] a")).toEqual("- [ ] a 📅 2024-10-26");
    });
});
