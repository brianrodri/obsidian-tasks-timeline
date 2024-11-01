import { Component, Keymap, MarkdownRenderer, UserEvent, View, Workspace } from "obsidian";
import { useEffect, useRef } from "preact/compat";

import { usePluginContext } from "@/context/plugin-context";

export interface MarkdownProps {
    md: string;
    sourcePath?: string;
}

export function Markdown({ md, sourcePath }: MarkdownProps) {
    const elRef = useRef<HTMLDivElement>(null);
    const { plugin, leaf } = usePluginContext();

    useEffect(() => {
        if (!sourcePath) return;
        const el = elRef.current;
        if (!el) return;

        const linkFixer = new LinkFixer(el, plugin.app.workspace, leaf.view, sourcePath);
        linkFixer.onload();

        const renderPromise = MarkdownRenderer.render(plugin.app, md, el, sourcePath, linkFixer);
        return () => renderPromise.finally(() => linkFixer.unload());
    }, [plugin, md, sourcePath, leaf.view]);

    return <span class="obsidian-markdown" ref={elRef} />;
}

class LinkFixer extends Component {
    private readonly listenedElements = new Set<Element>();
    private readonly observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const addedEl = node as Element;
                    if (addedEl.matches("a.internal-link")) {
                        this.addEventListener(addedEl);
                    } else {
                        addedEl.querySelectorAll("a.internal-link").forEach((el) => this.addEventListener(el));
                    }
                }
            });
        }
    });

    constructor(
        private readonly containerEl: HTMLElement,
        private readonly workspace: Workspace,
        private readonly hoverParent: View,
        private readonly sourcePath: string,
    ) {
        super();
    }

    override onload() {
        this.observer.observe(this.containerEl, { subtree: true, childList: true });
    }

    override onunload() {
        this.observer.disconnect();
    }

    private addEventListener(targetEl: Element) {
        if (this.listenedElements.has(targetEl)) return;
        this.listenedElements.add(targetEl);
        targetEl.addEventListener("click", (event) => {
            const href = targetEl.getAttr("href");
            if (href) this.workspace.openLinkText(href, this.sourcePath, Keymap.isModEvent(event as UserEvent));
        });
        targetEl.addEventListener("mouseover", (event) => {
            this.workspace.trigger("hover-link", {
                event,
                hoverParent: this.hoverParent,
                // @ts-expect-error this property exists on internal links
                linktext: targetEl.dataset.href,
                source: "preview",
                sourcePath: this.sourcePath,
                targetEl,
            });
        });
    }
}
