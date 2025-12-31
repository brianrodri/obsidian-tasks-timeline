import { render } from "@testing-library/preact";
import { DurationLike } from "luxon";
import { OmitByValue } from "utility-types";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { App, Component, MarkdownRenderer } from "@/lib/obsidian/types";
import { ObsidianMarkdown, ObsidianMarkdownProps } from "../markdown";

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
        const props = { ...requiredProps };
        const { container } = render(<ObsidianMarkdown {...requiredProps} />);
        await vi.runAllTimersAsync();
        expect(MarkdownRenderer.render).toHaveBeenCalledExactlyOnceWith(
            props.app,
            props.markdown,
            container.firstChild,
            props.sourcePath,
            props.component,
        );
    });

    it("should throw an error when 'props.delay' is invalid", () => {
        const props = { ...requiredProps, delay: "one hour" as DurationLike };
        expect(() => render(<ObsidianMarkdown {...props} />)).toThrowErrorMatchingSnapshot();
    });

    it("should rerender when 'props.markdown' stops changing for a while", async () => {
        let props = { ...requiredProps, delay: 500 };

        props = { ...props, markdown: "Apple" };
        const { container, rerender } = render(<ObsidianMarkdown {...props} />);
        await vi.runAllTimersAsync();

        props = { ...props, markdown: "Banana" };
        rerender(<ObsidianMarkdown {...props} />);
        await vi.advanceTimersByTimeAsync(300);

        props = { ...props, markdown: "Banana" };
        rerender(<ObsidianMarkdown {...props} />);
        await vi.advanceTimersByTimeAsync(300);

        expect(MarkdownRenderer.render).toHaveBeenCalledTimes(2);
        expect(MarkdownRenderer.render).toHaveBeenNthCalledWith(
            1,
            props.app,
            "Apple",
            container.firstChild,
            props.sourcePath,
            props.component,
        );
        expect(MarkdownRenderer.render).toHaveBeenNthCalledWith(
            2,
            props.app,
            "Banana",
            container.firstChild,
            props.sourcePath,
            props.component,
        );
    });

    it("should not rerender when 'props.markdown' keeps changing", async () => {
        let props = { ...requiredProps, delay: 500 };

        props = { ...props, markdown: "Apple" };
        const { container, rerender } = render(<ObsidianMarkdown {...props} />);
        await vi.runAllTimersAsync();

        props = { ...props, markdown: "Banana" };
        rerender(<ObsidianMarkdown {...props} />);
        await vi.advanceTimersByTimeAsync(300);

        props = { ...props, markdown: "Cherry" };
        rerender(<ObsidianMarkdown {...props} />);
        await vi.advanceTimersByTimeAsync(300);

        expect(MarkdownRenderer.render).toHaveBeenCalledExactlyOnceWith(
            props.app,
            "Apple",
            container.firstChild,
            props.sourcePath,
            props.component,
        );
    });
});
