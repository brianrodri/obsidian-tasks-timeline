import type { Obsidian } from "@/lib/obsidian/adapters";
import type { Store } from "@/store/create-store.types";

/** Connects the store's sources to the outside world. Every listener is disposed when the plugin unloads. */
export function connectStore(store: Store, obsidian: Obsidian): void {
    const { plugin } = obsidian;

    plugin.registerEvent(
        plugin.app.metadataCache.on(
            // @ts-expect-error - obsidian doesn't define overloads for third-party events.
            "dataview:metadata-change",
            () => store.revision.value++,
        ),
    );
}
