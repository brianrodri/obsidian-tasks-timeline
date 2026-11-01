import type { Obsidian } from "@/lib/obsidian/adapters";
import type { Actions } from "@/store/create-actions.types";
import type { Store } from "@/store/create-store.types";

/** Creates the only functions that write user intent: to the store's sources, or to files in the vault. */
export function createActions(store: Store, obsidian: Obsidian): Actions {
    return {
        async updateSettings(part) {
            store.settings.value = { ...store.settings.peek(), ...part };
            await obsidian.saveData(store.settings.peek());
        },
    };
}
