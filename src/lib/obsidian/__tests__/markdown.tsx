import { render } from "@testing-library/preact";
import { OmitByValue } from "utility-types";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { App, Component, MarkdownRenderer } from "@/lib/obsidian/types";

import { ObsidianMarkdown, ObsidianMarkdownProps } from "../markdown";

vi.mock("@/lib/obsidian/types");
afterEach(() => vi.restoreAllMocks());

describe("ObsidianMarkdown", () => {
    const requiredProps: OmitByValue<ObsidianMarkdownProps, undefined> = {
        app: new App(),
        component: new Component(),
        sourcePath: "/vault/diary.md",
        markdown: "Foo",
    };

    beforeAll(() => vi.useFakeTimers());
    afterAll(() => vi.useRealTimers());

    it("should render eventually", async () => {
        render(<ObsidianMarkdown {...requiredProps} />);
        expect(MarkdownRenderer.render).not.toHaveBeenCalled();
        await vi.runAllTimersAsync();
        expect(MarkdownRenderer.render).toHaveBeenCalledTimes(1);
    });

    it("should rerender when 'props.markdown' stops changing for a while", async () => {
        const { rerender } = render(<ObsidianMarkdown {...requiredProps} markdown="Foo" />);
        rerender(<ObsidianMarkdown {...requiredProps} markdown="Banana" />);
        await vi.advanceTimersByTimeAsync(300);
        rerender(<ObsidianMarkdown {...requiredProps} markdown="Banana" />);
        await vi.advanceTimersByTimeAsync(300);

        expect(MarkdownRenderer.render).toHaveBeenCalledTimes(2);
        expect(MarkdownRenderer.render).toHaveBeenCalledWith(
            requiredProps.app,
            "Foo",
            expect.any(HTMLSpanElement),
            requiredProps.sourcePath,
            requiredProps.component,
        );
        expect(MarkdownRenderer.render).toHaveBeenCalledWith(
            requiredProps.app,
            "Banana",
            expect.any(HTMLSpanElement),
            requiredProps.sourcePath,
            requiredProps.component,
        );
    });

    it("should not rerender when 'props.markdown' keeps changing", async () => {
        const { rerender } = render(<ObsidianMarkdown {...requiredProps} markdown="Foo" />);
        await vi.runAllTimersAsync();
        rerender(<ObsidianMarkdown {...requiredProps} markdown="Bar" />);
        await vi.advanceTimersByTimeAsync(100);
        rerender(<ObsidianMarkdown {...requiredProps} markdown="Baz" />);
        await vi.advanceTimersByTimeAsync(100);

        expect(MarkdownRenderer.render).toHaveBeenCalledTimes(3);
        expect(MarkdownRenderer.render).toHaveBeenCalledWith(
            requiredProps.app,
            "Foo",
            expect.any(HTMLSpanElement),
            requiredProps.sourcePath,
            requiredProps.component,
        );
        expect(MarkdownRenderer.render).not.toHaveBeenCalledWith(
            requiredProps.app,
            "Bar",
            expect.any(HTMLSpanElement),
            requiredProps.sourcePath,
            requiredProps.component,
        );
        expect(MarkdownRenderer.render).not.toHaveBeenCalledWith(
            requiredProps.app,
            "Baz",
            expect.any(HTMLSpanElement),
            requiredProps.sourcePath,
            requiredProps.component,
        );
    });
});
