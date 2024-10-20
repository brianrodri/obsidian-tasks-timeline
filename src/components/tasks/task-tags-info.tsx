import { TagIcon } from "../../assets/icons";

export interface TagsInfoProps {
    tags?: string[];
}

export function TagsInfo({ tags }: TagsInfoProps) {
    const tagsInfo = tags?.map((tag) => (
        <a class="tag" aria-label={tag}>
            <div class="icon">{TagIcon}</div>
            <div class="label">{tag.slice(1)}</div>
        </a>
    ));

    return <>{tagsInfo}</>;
}
