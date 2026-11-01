import { useErrorBoundary } from "preact/hooks";

import { useAppContext } from "@/context/app-context";
import { ErrorView } from "@/layout/error-view";
import { LoadingView } from "@/layout/loading-view";
import { TodayView } from "@/layout/today-view";

export function AppView() {
    const { store } = useAppContext();
    const renderError: unknown = useErrorBoundary((error: unknown) => {
        console.error("Failed to render the tasks timeline", error);
    })[0];

    if (renderError || store.status.value === "error") return <ErrorView />;
    if (store.status.value === "loading") return <LoadingView />;
    return <TodayView />;
}
