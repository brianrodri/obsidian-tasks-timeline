import { act, cleanup, fireEvent, render, screen } from "@testing-library/preact";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AppContext } from "@/context/app-context";
import type { AppContextValue } from "@/context/app-context.types";
import { Task } from "@/data/task";

import { TaskDateInput } from "../task-date-input";

describe("TaskDateInput", () => {
    afterEach(cleanup);

    it("reports a failed write to the user", async () => {
        const error = new Error("boom");
        const setTaskDate = vi.fn(() => Promise.reject(error));
        const reportError = vi.fn();
        render(
            <AppContext value={{ actions: { setTaskDate }, obsidian: { reportError } } as unknown as AppContextValue}>
                <TaskDateInput field="dueDate" task={Task.create({ dueDate: "2024-10-25" })} />
            </AppContext>,
        );

        await act(() => {
            fireEvent.input(screen.getByLabelText("Set due date"), { target: { value: "2024-10-26" } });
        });

        expect(reportError).toHaveBeenCalledExactlyOnceWith("Failed to set the due date", error);
    });
});
