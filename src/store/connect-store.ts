import type { Obsidian } from "@/lib/obsidian/adapters";
import { ROLLOVER_CHECK_INTERVAL } from "@/store/connect-store.consts";
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

    plugin.registerInterval(
        window.setInterval(() => {
            const now = Temporal.Now.plainDateISO();
            if (!now.equals(store.today.peek())) store.today.value = now;
        }, ROLLOVER_CHECK_INTERVAL.total("milliseconds")),
    );
}
