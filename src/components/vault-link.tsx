import { HTMLAttributes, PropsWithChildren } from "preact/compat";
import { useCallback } from "preact/hooks";

import { usePluginContext } from "../context/plugin-context";

export interface VaultLinkProps extends HTMLAttributes<HTMLAnchorElement> {
    href: string;
    sourcePath: string;
}

export function VaultLink({ href, sourcePath, children, ...rest }: PropsWithChildren<VaultLinkProps>) {
    const { leaf, obsidian } = usePluginContext();

    const onClick = useCallback(
        (event: Event) => obsidian.openVaultLink(event, href, sourcePath),
        [obsidian, href, sourcePath],
    );

    const onMouseOver = useCallback(
        (event: Event) => obsidian.openVaultHover(event, href, sourcePath, leaf),
        [obsidian, href, sourcePath, leaf],
    );

    return (
        <a {...rest} href="#" onClick={onClick} onMouseOver={onMouseOver}>
            {children}
        </a>
    );
}
