import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/preact";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AppContext } from "@/context/app-context";
import type { AppContextValue } from "@/context/app-context.types";
import { Task } from "@/data/task";

import { TaskCheckbox } from "../task-checkbox";

describe("TaskCheckbox", () => {
    afterEach(cleanup);

    it("toggles its task and stays disabled while the toggle is pending", async () => {
        const task = Task.create({});
        const { promise, resolve } = Promise.withResolvers<undefined>();
        const toggleTask = vi.fn(() => promise);
        render(
            <AppContext value={{ actions: { toggleTask } } as unknown as AppContextValue}>
                <TaskCheckbox task={task} />
            </AppContext>,
        );
        const checkbox = screen.getByRole("checkbox");
        expect(checkbox).toHaveProperty("disabled", false);

        fireEvent.click(checkbox);
        fireEvent.click(checkbox);

        expect(toggleTask).toHaveBeenCalledExactlyOnceWith(task);
        expect(checkbox).toHaveProperty("disabled", true);

        await act(async () => {
            resolve(undefined);
            await promise;
        });

        expect(checkbox).toHaveProperty("disabled", false);
    });

    it("reports a failed toggle to the user and re-enables itself", async () => {
        const error = new Error("boom");
        const toggleTask = vi.fn(() => Promise.reject(error));
        const reportError = vi.fn();
        render(
            <AppContext value={{ actions: { toggleTask }, obsidian: { reportError } } as unknown as AppContextValue}>
                <TaskCheckbox task={Task.create({})} />
            </AppContext>,
        );
        const checkbox = screen.getByRole("checkbox");

        fireEvent.click(checkbox);

        await waitFor(() => {
            expect(checkbox).toHaveProperty("disabled", false);
        });
        expect(reportError).toHaveBeenCalledExactlyOnceWith("Failed to toggle the task", error);
    });
});
