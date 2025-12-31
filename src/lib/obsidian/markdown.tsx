import { createElement, FunctionalComponent, JSX } from "preact";
import { useEffect, useRef } from "preact/hooks";
import { useDebounceCallback } from "usehooks-ts";

import { MarkdownRenderer, App, Component } from "@/lib/obsidian/api";

/**
 * @param props - props for the component.
 * @returns component that asynchronously renders the given markdown source code just as Obsidian (the app) would.
 */
export const ObsidianMarkdown: FunctionalComponent<ObsidianMarkdownProps> = ({
    app,
    component,
    markdown,
    sourcePath,
    delay = 500,
    tagName = "span",
}) => {
    const elRef = useRef<HTMLElement>();
    const renderObsidianMarkdown = useDebounceCallback(MarkdownRenderer["render"], delay);

    useEffect(() => {
        const el = elRef.current;
        if (el) {
            //renderObsidianMarkdown.flush();
            const runAsync = async () => await renderObsidianMarkdown(app, markdown, el, sourcePath, component);
            runAsync().catch(console.error);
            return () => renderObsidianMarkdown.cancel();
        }
    }, [renderObsidianMarkdown, app, markdown, sourcePath, component]);

    return createElement(tagName, { ref: elRef });
};

/** Configures how Obsidian (the app) will render its markdown. */
export interface ObsidianMarkdownProps {
    /** A reference to the Obsidian app object. */
    app: App;
    /** A parent component to manage the lifecycle of the rendered child components. */
    component: Component;
    /** The Markdown source code. */
    markdown: string;
    /** The normalized path of this Markdown file, used to resolve relative internal links. */
    sourcePath: string;
    /** The tag used to contain the rendered Markdown source code. */
    tagName?: keyof JSX.IntrinsicElements;
    /** Custom debounce time for renders. */
    delay?: number;
}
