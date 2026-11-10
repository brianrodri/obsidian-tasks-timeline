import type { HTMLAttributes } from "preact";
import type { PropsWithChildren } from "preact/compat";
import { useEventCallback } from "usehooks-ts";

import { useAppContext } from "@/context/app-context";

export interface VaultLinkProps extends HTMLAttributes<HTMLAnchorElement> {
    href?: string;
    sourcePath?: string;
}

/**
 * Renders a link to a note in the vault. Clicking opens the note, and hovering shows Obsidian's page preview.
 *
 * Does nothing when `href` or `sourcePath` is missing. Failures to open the note are logged.
 */
export function VaultLink({ href, sourcePath, children, ...rest }: PropsWithChildren<VaultLinkProps>) {
    const { leaf, obsidian } = useAppContext();

    const onClick = useEventCallback((event: Event) => {
        if (href && sourcePath) {
            obsidian.openVaultLink(event, href, sourcePath).catch((error: unknown) => {
                console.error(error);
            });
        }
    });

    const onMouseOver = useEventCallback((event: Event) => {
        if (href && sourcePath) {
            obsidian.openVaultHover(event, href, sourcePath, leaf);
        }
    });

    return (
        <a className="internal-link" {...rest} onClick={onClick} onMouseOver={onMouseOver}>
            {children}
        </a>
    );
}
