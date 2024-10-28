import { HTMLAttributes, PropsWithChildren } from "preact/compat";
import { useCallback } from "preact/hooks";

import { usePluginContext } from "@/context/plugin-context";

export interface VaultLinkProps extends HTMLAttributes<HTMLAnchorElement> {
    href?: string;
    sourcePath?: string;
}

export function VaultLink({ href, sourcePath, children, ...rest }: PropsWithChildren<VaultLinkProps>) {
    const { leaf, obsidian } = usePluginContext();

    const onClick = useCallback(
        (event: Event) => {
            if (href && sourcePath) {
                obsidian.openVaultLink(event, href, sourcePath);
            }
        },
        [href, obsidian, sourcePath],
    );

    const onMouseOver = useCallback(
        (event: Event) => {
            if (href && sourcePath) {
                obsidian.openVaultHover(event, href, sourcePath, leaf);
            }
        },
        [href, leaf, obsidian, sourcePath],
    );

    return href && sourcePath ?
            <a {...rest} href="#" onClick={onClick} onMouseOver={onMouseOver}>
                {children}
            </a>
        :   <>{children}</>;
}
