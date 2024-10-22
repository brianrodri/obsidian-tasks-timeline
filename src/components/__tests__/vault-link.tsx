import { act, render } from "@testing-library/preact";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Obsidian } from "../../lib/obsidian/api";
import { MockPluginContext } from "../../utils/test-utils";
import { VaultLink } from "../vault-link";

vi.mock("../../lib/obsidian/api");
vi.mock("../../lib/obsidian-dataview/api");
vi.mock("../../lib/obsidian-tasks/api");

describe("VaultLink", () => {
    const href = "www.abc.com";
    const sourcePath = "path.md";

    const { wrapper, leaf, obsidian } = new MockPluginContext(vi.mocked(new Obsidian()));

    afterEach(vi.restoreAllMocks);

    it("opens link when clicked", async () => {
        const result = render(
            <VaultLink href={href} sourcePath={sourcePath}>
                abc
            </VaultLink>,
            { wrapper },
        );

        await act(() => userEvent.click(result.getByText("abc")));

        expect(obsidian.openVaultLink).toHaveBeenCalledWith(expect.anything(), "www.abc.com", "path.md");

        expect(result.unmount).not.toThrow();
    });

    it("opens hover when mouse over", async () => {
        const result = render(
            <VaultLink href={href} sourcePath={sourcePath}>
                abc
            </VaultLink>,
            { wrapper },
        );

        await act(() => userEvent.hover(result.getByText("abc")));

        expect(obsidian.openVaultHover).toHaveBeenCalledWith(expect.anything(), "www.abc.com", "path.md", leaf);

        expect(result.unmount).not.toThrow();
    });
});
