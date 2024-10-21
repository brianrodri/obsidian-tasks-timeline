import { Signal } from "@preact/signals";
import { vi } from "vitest";

import { Dataview as RealDataview } from "../dataview-adapters";
import { Task } from "compat/dataview-types";

const getPage = vi.fn();
const getPages = vi.fn();
const getScheduledDate = vi.fn(({ scheduled, start }: Task) =>
    start && scheduled && start > scheduled ? start.toISODate() : (scheduled?.toISODate() ?? ""),
);

export class Dataview implements Partial<RealDataview> {
    public revision = { value: 1 } as Signal<number>;
    public getPage = getPage;
    public getPages = getPages;
    public getScheduledDate = getScheduledDate;
}

export const ensureDataviewReady = vi.fn();
