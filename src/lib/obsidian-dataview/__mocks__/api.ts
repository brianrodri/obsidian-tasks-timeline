import { vi } from "vitest";

import type { Dataview as RealDataview } from "../api";

const getTasks = vi.fn();

export class Dataview implements Partial<RealDataview> {
    public getTasks = getTasks;
}

export const ensureDataviewReady = vi.fn();
