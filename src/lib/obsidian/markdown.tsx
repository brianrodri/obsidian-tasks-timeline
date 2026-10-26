import { Duration, type DurationLike } from "luxon";
import { type FunctionalComponent, type JSX, createElement } from "preact";
import { useEffect, useRef } from "preact/hooks";
import { useDebounceCallback } from "usehooks-ts";

import { type App, type Component, MarkdownRenderer } from "@/lib/obsidian/types";

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
    const elRef = useRef<HTMLElement | null>(null);
    const delayMs = Duration.fromDurationLike(delay).toMillis();
    const renderObsidianMarkdown = useDebounceCallback(renderMarkdown, delayMs);

    useEffect(() => {
        const el = elRef.current;
        if (el && markdown && sourcePath) {
            const runAsync = async () => renderObsidianMarkdown(app, markdown, el, sourcePath, component);
            runAsync().catch((error: unknown) => {
                console.error(error);
            });
        } else {
            el?.replaceChildren();
        }
        return () => {
            renderObsidianMarkdown.cancel();
        };
    }, [renderObsidianMarkdown, app, markdown, sourcePath, component]);

    // eslint-disable-next-line react-hooks/refs -- the ref object is handed to the element, not read during render.
    return createElement(tagName, { ref: elRef });
};

/** Wraps the static method so it can be passed around without binding concerns. */
const renderMarkdown = (...args: Parameters<typeof MarkdownRenderer.render>) => MarkdownRenderer.render(...args);

/** Configures how Obsidian (the app) will render its markdown. */
export interface ObsidianMarkdownProps {
    /** A reference to the Obsidian app object. */
    app: App;
    /** A parent component to manage the lifecycle of the rendered child components. */
    component: Component;
    /** The Markdown source code. */
    markdown?: string;
    /** The normalized path of this Markdown file, used to resolve relative internal links. */
    sourcePath?: string;
    /** The tag used to contain the rendered Markdown source code. */
    tagName?: keyof JSX.IntrinsicElements;
    /** Custom debounce time for renders. */
    delay?: DurationLike;
}
