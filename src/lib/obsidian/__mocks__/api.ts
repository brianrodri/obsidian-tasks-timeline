import { vi } from "vitest";

import { Obsidian as RealObsidian, WorkspaceLeaf as RealWorkspaceLeaf } from "../api";

const loadData = vi.fn();
const saveData = vi.fn();
const attachView = vi.fn();
const detachView = vi.fn();
const revealView = vi.fn();
const openVaultLink = vi.fn();
const openVaultHover = vi.fn();

export class Obsidian implements Partial<RealObsidian> {
    public loadData = loadData;
    public saveData = saveData;
    public attachView = attachView;
    public detachView = detachView;
    public revealView = revealView;
    public openVaultLink = openVaultLink;
    public openVaultHover = openVaultHover;
}

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class WorkspaceLeaf implements Partial<RealWorkspaceLeaf> {}
