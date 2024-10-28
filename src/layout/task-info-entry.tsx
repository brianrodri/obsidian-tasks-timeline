import { VNode } from "preact";
import { HTMLAttributes, PropsWithChildren } from "preact/compat";

export interface TaskInfoEntryProps extends HTMLAttributes<HTMLDivElement> {
    symbol?: VNode;
}

export function TaskInfoEntry({ symbol, children, ...rest }: PropsWithChildren<TaskInfoEntryProps>) {
    if (!children) return null;
    return (
        <div {...rest}>
            <div class="icon">{symbol}</div>
            <div class="label">{children}</div>
        </div>
    );
}
