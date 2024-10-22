import { renderHook } from "@testing-library/preact";
import { describe, expect, it, vi } from "vitest";

import { usePluginContext } from "../../context/plugin-context";
import { MockPluginContext } from "../../utils/test-utils";

vi.mock("../../lib/obsidian-dataview/api");
vi.mock("../../lib/obsidian/api");
vi.mock("../../lib/obsidian-tasks/api");

describe("useTimelineContext", () => {
    it("throws when used outside of context", () => {
        expect(() => renderHook(usePluginContext)).toThrowError("context must be used from within a provider");
    });

    const { wrapper, obsidian, dataview, tasksApi, leaf, settings } = new MockPluginContext();

    it("returns provided values", () => {
        const { result } = renderHook(usePluginContext, { wrapper });

        expect(result.current).toEqual({ settings, obsidian, dataview, tasksApi, leaf });
    });
});
