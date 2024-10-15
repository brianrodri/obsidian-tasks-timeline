import { vi } from "vitest";
import { Obsidian } from "./obsidian-adapters";

export class ObsidianMock implements Partial<Obsidian> {
    public constructor(private data = {}) {}

    public loadData = vi.fn(async (defaults) => ({ ...defaults, ...this.data }));
    public saveData = vi.fn(async (data) => (this.data = data));
    public attachView = vi.fn();
    public detachView = vi.fn();
    public revealView = vi.fn();

    public unsafeCast = () => this as unknown as Obsidian;
}
