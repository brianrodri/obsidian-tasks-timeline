import type { Obsidian } from "@/lib/obsidian/adapters";
import type { Plugin, WorkspaceLeaf } from "@/lib/obsidian/types";
import type { Actions } from "@/store/create-actions.types";
import type { Store } from "@/store/create-store.types";

/** Built once per view. Holds signals and services, never signal values, so it never changes after creation. */
export interface AppContextValue {
    store: Store;
    actions: Actions;
    obsidian: Obsidian;
    plugin: Plugin;
    leaf: WorkspaceLeaf;
}
