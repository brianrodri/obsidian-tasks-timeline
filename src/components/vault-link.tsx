import { PropsWithChildren } from "preact/compat";
import { useCallback } from "preact/hooks";

import { useTimelineContext } from "../hooks/use-timeline-context";

export interface VaultLinkProps {
    href: string;
    sourcePath: string;
}

export function VaultLink({ href, sourcePath, children }: PropsWithChildren<VaultLinkProps>) {
    const { leaf, obsidian } = useTimelineContext();

    const onClick = useCallback(
        (event: Event) => obsidian.openVaultLink(event, href, sourcePath),
        [obsidian, href, sourcePath],
    );

    const onMouseOver = useCallback(
        (event: Event) => obsidian.openVaultHover(event, href, sourcePath, leaf),
        [obsidian, href, sourcePath, leaf],
    );

    return (
        <a class="internal-link" href={"#"} onClick={onClick} onMouseOver={onMouseOver}>
            {children}
        </a>
    );
}
