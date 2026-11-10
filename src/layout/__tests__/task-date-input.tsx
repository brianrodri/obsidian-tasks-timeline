import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/preact";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AppContext } from "@/context/app-context";
import type { AppContextValue } from "@/context/app-context.types";
import { Task } from "@/data/task";

import { TaskDateInput } from "../task-date-input";

describe("TaskDateInput", () => {
    afterEach(cleanup);

    it("writes the picked date and stays disabled while the write is pending", async () => {
        const task = Task.create({ dueDate: "2024-10-25" });
        const { promise, resolve } = Promise.withResolvers<undefined>();
        const setTaskDate = vi.fn(() => promise);
        render(
            <AppContext value={{ actions: { setTaskDate } } as unknown as AppContextValue}>
                <TaskDateInput field="dueDate" task={task} />
            </AppContext>,
        );
        const input = screen.getByLabelText<HTMLInputElement>("Set due date");
        expect(input.disabled).toBe(false);

        fireEvent.input(input, { target: { value: "2024-10-26" } });

        expect(setTaskDate).toHaveBeenCalledExactlyOnceWith(task, "dueDate", "2024-10-26");
        expect(input.disabled).toBe(true);

        await act(async () => {
            resolve(undefined);
            await promise;
        });

        expect(input.disabled).toBe(false);
    });

    it("reports a failed write to the user and restores the task's date", async () => {
        const error = new Error("boom");
        const setTaskDate = vi.fn(() => Promise.reject(error));
        const reportError = vi.fn();
        render(
            <AppContext value={{ actions: { setTaskDate }, obsidian: { reportError } } as unknown as AppContextValue}>
                <TaskDateInput field="dueDate" task={Task.create({ dueDate: "2024-10-25" })} />
            </AppContext>,
        );
        const input = screen.getByLabelText<HTMLInputElement>("Set due date");

        fireEvent.input(input, { target: { value: "2024-10-26" } });

        await waitFor(() => {
            expect(input.disabled).toBe(false);
        });
        expect(reportError).toHaveBeenCalledExactlyOnceWith("Failed to set the due date", error);
        expect(input.value).toBe("2024-10-25");
    });

    it("restores the latest rendered date when the task changed while a failed write was pending", async () => {
        const { promise, reject } = Promise.withResolvers<undefined>();
        const setTaskDate = vi.fn(() => promise);
        const reportError = vi.fn();
        const context = { actions: { setTaskDate }, obsidian: { reportError } } as unknown as AppContextValue;
        const { rerender } = render(
            <AppContext value={context}>
                <TaskDateInput field="dueDate" task={Task.create({ dueDate: "2024-10-25" })} />
            </AppContext>,
        );
        const input = screen.getByLabelText<HTMLInputElement>("Set due date");

        fireEvent.input(input, { target: { value: "2024-10-26" } });
        rerender(
            <AppContext value={context}>
                <TaskDateInput field="dueDate" task={Task.create({ dueDate: "2024-10-27" })} />
            </AppContext>,
        );
        await act(async () => {
            reject(new Error("boom"));
            await promise.catch(() => undefined);
        });

        expect(input.disabled).toBe(false);
        expect(input.value).toBe("2024-10-27");
    });
});
