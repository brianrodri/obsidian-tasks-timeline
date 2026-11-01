import { act, cleanup, fireEvent, render, screen } from "@testing-library/preact";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AppContext } from "@/context/app-context";
import type { AppContextValue } from "@/context/app-context.types";
import { Task } from "@/data/task";

import { TaskCheckbox } from "../task-checkbox";

describe("TaskCheckbox", () => {
    afterEach(cleanup);

    it("reports a failed toggle to the user", async () => {
        const error = new Error("boom");
        const toggleTask = vi.fn(() => Promise.reject(error));
        const reportError = vi.fn();
        render(
            <AppContext value={{ actions: { toggleTask }, obsidian: { reportError } } as unknown as AppContextValue}>
                <TaskCheckbox task={Task.create({})} />
            </AppContext>,
        );

        await act(() => {
            fireEvent.click(screen.getByRole("checkbox"));
        });

        expect(reportError).toHaveBeenCalledExactlyOnceWith("Failed to toggle the task", error);
    });
});
