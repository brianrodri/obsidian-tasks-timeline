import { Signal } from "@preact/signals";
import { vi } from "vitest";

import { Dataview as RealDataview } from "../dataview-adapters";

const getPage = vi.fn();
const getPages = vi.fn();

export class Dataview implements Partial<RealDataview> {
    public revision = { value: 1 } as Signal<number>;
    public getPage = getPage;
    public getPages = getPages;
}

export const ensureDataviewReady = vi.fn();
