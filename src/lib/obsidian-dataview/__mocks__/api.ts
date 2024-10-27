import { Signal } from "@preact/signals";
import { vi } from "vitest";

import { Dataview as RealDataview } from "../api";

const getTasks = vi.fn();

export class Dataview implements Partial<RealDataview> {
    public revision = { value: 1 } as Signal<number>;
    public getTasks = getTasks;
}

export const ensureDataviewReady = vi.fn();
