import { act, render } from "@testing-library/preact";
import { describe, expect, it, vi } from "vitest";

import type { AppContextValue } from "@/context/app-context.types";
import { createStore } from "@/store/create-store";

import { AppContext, useAppContext } from "../app-context";

function createValue(): AppContextValue {
    return { store: createStore() } as AppContextValue;
}

describe("AppContext", () => {
    it("does not re-render a consumer that reads no signals when settings change", async () => {
        const value = createValue();
        const onRender = vi.fn();
        function Consumer() {
            useAppContext();
            onRender();
            return null;
        }
        render(
            <AppContext value={value}>
                <Consumer />
            </AppContext>,
        );

        await act(() => {
            value.store.settings.value = { ...value.store.settings.value, pageQuery: "#work" };
        });

        expect(onRender).toHaveBeenCalledOnce();
    });

    it("throws when used outside of a provider", () => {
        function Consumer() {
            useAppContext();
            return null;
        }
        const consoleError = vi.spyOn(console, "error").mockImplementation(vi.fn());
        expect(() => render(<Consumer />)).toThrow("useAppContext must be used within an AppContext");
        consoleError.mockRestore();
    });
});
