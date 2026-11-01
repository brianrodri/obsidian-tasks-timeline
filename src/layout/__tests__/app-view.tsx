import { act, cleanup, render, screen } from "@testing-library/preact";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AppContext } from "@/context/app-context";
import type { AppContextValue } from "@/context/app-context.types";
import { createStore } from "@/store/create-store";

import { AppView } from "../app-view";

function renderView() {
    const store = createStore();
    const { container } = render(
        <AppContext value={{ store } as AppContextValue}>
            <AppView />
        </AppContext>,
    );
    return { store, container };
}

describe("AppView", () => {
    afterEach(cleanup);

    it("shows the loading view until the store is ready", async () => {
        const { store, container } = renderView();
        expect(container.querySelector(".spinner")).not.toBeNull();

        await act(() => {
            store.dataview.value = { getTasks: () => [] };
            store.status.value = "ready";
        });

        expect(container.querySelector(".spinner")).toBeNull();
        expect(container.querySelector("#ott")).not.toBeNull();
    });

    it("shows the error view when the store fails to load", async () => {
        const { store, container } = renderView();

        await act(() => {
            store.status.value = "error";
        });

        expect(container.querySelector(".spinner")).toBeNull();
        expect(screen.getByText(/Failed to load the tasks timeline/)).toBeDefined();
    });

    it("shows the error view when the timeline throws while rendering", async () => {
        const consoleError = vi.spyOn(console, "error").mockImplementation(vi.fn());
        const { store } = renderView();

        await act(() => {
            store.dataview.value = {
                getTasks: () => {
                    throw new Error("boom");
                },
            };
            store.status.value = "ready";
        });

        expect(screen.getByText(/Failed to load the tasks timeline/)).toBeDefined();
        consoleError.mockRestore();
    });
});
