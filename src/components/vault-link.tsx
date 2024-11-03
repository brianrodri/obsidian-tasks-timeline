import { HTMLAttributes, PropsWithChildren } from "preact/compat";
import { useEventCallback } from "usehooks-ts";

import { usePluginContext } from "@/context/plugin-context";

export interface VaultLinkProps extends HTMLAttributes<HTMLAnchorElement> {
    href?: string;
    sourcePath?: string;
}

export function VaultLink({ href, sourcePath, children, ...rest }: PropsWithChildren<VaultLinkProps>) {
    const { leaf, obsidian } = usePluginContext();

    const onClick = useEventCallback((event: Event) => {
        if (href && sourcePath) {
            obsidian.openVaultLink(event, href, sourcePath);
        }
    });

    const onMouseOver = useEventCallback((event: Event) => {
        if (href && sourcePath) {
            obsidian.openVaultHover(event, href, sourcePath, leaf);
        }
    });

    return (
        <a {...rest} onClick={onClick} onMouseOver={onMouseOver}>
            {children}
        </a>
    );
}
