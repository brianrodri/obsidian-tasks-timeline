import { createContext, use } from "preact/compat";

import type { AppContextValue } from "@/context/app-context.types";

export const AppContext = createContext<AppContextValue | null>(null);

export function useAppContext(): AppContextValue {
    const value = use(AppContext);
    if (!value) {
        throw new Error("useAppContext must be used within an AppContext");
    }
    return value;
}
