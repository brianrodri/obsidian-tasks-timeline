import { vi } from "vitest";

import { Obsidian as RealObsidian } from "../obsidian-adapters";

const loadData = vi.fn();
const saveData = vi.fn();
const attachView = vi.fn();
const detachView = vi.fn();
const revealView = vi.fn();

export class Obsidian implements Partial<RealObsidian> {
    public loadData = loadData;
    public saveData = saveData;
    public attachView = attachView;
    public detachView = detachView;
    public revealView = revealView;
}
