/** IMPORTANT: This mock will be used to replace the ENTIRE "obsidian" package across ALL tests; write with care! */
import { vi } from "vitest";

export type { IconName, PaneType, UserEvent, WorkspaceLeaf } from "obsidian";

export const App = vi.fn();
export const Component = vi.fn();
export const ItemView = vi.fn();
export const Keymap = { isModEvent: vi.fn() };
export const MarkdownRenderer = { render: vi.fn() };
export const Plugin = vi.fn();
