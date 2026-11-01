import { cleanup, fireEvent, render, screen } from "@testing-library/preact";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AppContext } from "@/context/app-context";
import type { AppContextValue } from "@/context/app-context.types";

import { VaultLink } from "../vault-link";

function renderLink(href?: string) {
    const obsidian = { openVaultLink: vi.fn(() => Promise.resolve()), openVaultHover: vi.fn() };
    const leaf = {};
    render(
        <AppContext value={{ obsidian, leaf } as unknown as AppContextValue}>
            <VaultLink href={href} sourcePath="notes/a.md">
                link
            </VaultLink>
        </AppContext>,
    );
    return { obsidian, leaf, link: screen.getByText("link") };
}

describe("VaultLink", () => {
    afterEach(() => {
        cleanup();
    });

    it("opens its target on click and previews it on hover", () => {
        const { obsidian, leaf, link } = renderLink("[[b]]");

        fireEvent.click(link);
        fireEvent.mouseOver(link);

        expect(obsidian.openVaultLink).toHaveBeenCalledWith(expect.any(Event), "[[b]]", "notes/a.md");
        expect(obsidian.openVaultHover).toHaveBeenCalledWith(expect.any(Event), "[[b]]", "notes/a.md", leaf);
    });

    it("does nothing without a target", () => {
        const { obsidian, link } = renderLink();

        fireEvent.click(link);
        fireEvent.mouseOver(link);

        expect(obsidian.openVaultLink).not.toHaveBeenCalled();
        expect(obsidian.openVaultHover).not.toHaveBeenCalled();
    });
});
