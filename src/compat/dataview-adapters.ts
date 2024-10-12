import type { EventRef, Plugin, TFile } from "obsidian";
import { getAPI, isPluginEnabled } from "obsidian-dataview";
import type { DataviewApi } from "obsidian-dataview/lib/api/plugin-api";
import type { PageMetadata } from "obsidian-dataview/lib/data-model/markdown";

export class Dataview {
    private readonly dv: DataviewApi;

    public constructor(public readonly plugin: Plugin) {
        this.dv = getAPI(this.plugin.app);
    }

    public getPages(source = ""): PageMetadata[] {
        return this.dv.pages(source).array() as PageMetadata[];
    }

    public onFileUpdate(callback: (file: TFile) => any): EventRef {
        return this.onFileChange("update", callback);
    }

    public onFileRename(callback: (file: TFile, oldPath: string) => any): EventRef {
        return this.onFileChange("rename", callback);
    }

    public onFileDelete(callback: (file: TFile) => any): EventRef {
        return this.onFileChange("delete", callback);
    }

    private onFileChange<F extends (...args: any[]) => any>(changeTypeTarget: string, callback: F): EventRef {
        const ref = this.plugin.app.metadataCache.on(
            // @ts-ignore
            "dataview:metadata-change",
            (changeType: string, ...rest: Parameters<F>) => {
                if (changeType === changeTypeTarget) {
                    callback(...rest);
                }
            },
        );
        this.plugin.registerEvent(ref);
        return ref;
    }
}

/** IMPORTANT: Must be called within `onLayoutReady` callback, otherwise the plugin will freeze! */
export async function ensureDataviewReady(plugin: Plugin): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        if (!isPluginEnabled(plugin.app)) {
            reject(new Error("obsidian-dataview must be installed and enabled"));
        } else if (getAPI(plugin.app)?.index.initialized) {
            resolve();
        } else {
            // @ts-ignore
            plugin.registerEvent(plugin.app.metadataCache.on("dataview:index-ready", resolve));
        }
    });
}
