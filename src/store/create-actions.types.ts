import type { PluginSettings } from "@/data/settings";

export interface Actions {
    /** Merges `part` into the settings and saves them. Rejects if the save fails. */
    updateSettings(part: Partial<PluginSettings>): Promise<void>;
}
