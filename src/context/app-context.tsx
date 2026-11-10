import { createContext, use } from "preact/compat";

import type { AppContextValue } from "@/context/app-context.types";

/** Provides the plugin's services to every view rendered inside it. */
export const AppContext = createContext<AppContextValue | null>(null);

/**
 * Returns the services of the nearest {@link AppContext}.
 *
 * Pre: called while rendering inside an {@link AppContext}. Throws otherwise.
 */
export function useAppContext(): AppContextValue {
    const value = use(AppContext);
    if (!value) {
        throw new Error("useAppContext must be used within an AppContext");
    }
    return value;
}
