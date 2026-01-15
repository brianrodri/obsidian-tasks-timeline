import { ChevronRight, FileTextIcon, FolderOpenIcon, HashIcon } from "lucide-preact";
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
    const { name, folder } = parseFilePath(path ?? "");
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

function parseFilePath(filePath: string) {
    const lastSlash = filePath.lastIndexOf("/");
    const fileName = lastSlash >= 0 ? filePath.slice(lastSlash + 1) : filePath;
    const name = fileName.replace(/\.[^.]*$/, "");
    const dir = lastSlash >= 0 ? filePath.slice(0, lastSlash) : "";
    const dirLastSlash = dir.lastIndexOf("/");
    const folder = dirLastSlash >= 0 ? dir.slice(dirLastSlash + 1) : dir;
    return { name, folder };
}
