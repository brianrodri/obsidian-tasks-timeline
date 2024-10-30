import { createContext } from "preact";
import { PropsWithChildren } from "preact/compat";
import { useContext, useMemo } from "preact/hooks";

import { usePluginContext } from "@/context/plugin-context";
import { VaultTaskState } from "@/data/vault-task-state";

const context = createContext(new VaultTaskState());

export function useVaultTaskState(): VaultTaskState {
    return useContext(context);
}

export function VaultTaskStateProvider({ children }: PropsWithChildren) {
    const { dataview, settings } = usePluginContext();
    const revision = dataview.revision.value;
    const pageQuery = settings.pageQuery;

    const state = useMemo(
        () => new VaultTaskState(dataview.getTasks(pageQuery), revision),
        [dataview, pageQuery, revision],
    );

    return <context.Provider value={state}>{children}</context.Provider>;
}
