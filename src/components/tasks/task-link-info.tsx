import { FileIcon } from "../../assets/icons";
import { Link } from "../../compat/dataview-types";
import { VaultLink } from "../vault-link";

export interface LinkInfoProps {
    link: Link;
}

export function LinkInfo({ link }: LinkInfoProps) {
    const header = link.subpath ? <span class="header">&nbsp;&gt;&nbsp;{link.subpath}</span> : undefined;

    return (
        <VaultLink className="file relative-link" href={link.obsidianLink()} sourcePath={link.path}>
            <div class="icon">{FileIcon}</div>
            <div class="label">
                {link.fileName()}
                {header}
            </div>
        </VaultLink>
    );
}
