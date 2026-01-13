import { ChevronRight, FileTextIcon, FolderOpenIcon, HashIcon } from "lucide-preact";
import { basename, parse } from "path";
import { memo } from "preact/compat";

const PART_SEPARATOR_ICON = <ChevronRight />;
const HEADING_ICON = <HashIcon />;
const FILE_ICON = <FileTextIcon />;
const FOLDER_ICON = <FolderOpenIcon />;

export interface TaskLocationProps {
    path?: string;
    section?: string;
}

export const TaskLocation = memo(({ path, section }: TaskLocationProps) => {
    const { name, dir } = parse(path ?? "");
    const folder = basename(dir);
    const parts = [];
    if (folder) {
        parts.push(<span class="icon">{FOLDER_ICON}</span>, <span class="label">{` ${folder}`}</span>);
    }
    if (name) {
        if (parts.length > 0) parts.push(PART_SEPARATOR_ICON);
        parts.push(<span class="icon">{FILE_ICON}</span>, <span class="label">{` ${name}`}</span>);
    }
    if (section && section !== name) {
        if (parts.length > 0) parts.push(PART_SEPARATOR_ICON);
        parts.push(<span class="icon">{HEADING_ICON}</span>, <span class="label">{` ${section}`}</span>);
    }
    return parts.slice(-5);
});
