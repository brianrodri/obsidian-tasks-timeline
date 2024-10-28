import { VNode } from "preact";
import { HTMLAttributes, PropsWithChildren } from "preact/compat";

export interface TaskInfoEntryProps extends HTMLAttributes<HTMLDivElement> {
    infoIcon?: VNode;
}

export function TaskInfoEntry({ infoIcon, children, ...rest }: PropsWithChildren<TaskInfoEntryProps>) {
    if (!children) return <></>;
    return (
        <div {...rest}>
            <div class="icon">{infoIcon}</div>
            <div class="label">{children}</div>
        </div>
    );
}
