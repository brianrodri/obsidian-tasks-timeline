import { DateTime } from "luxon";
import { VNode } from "preact";
import { useCallback, useMemo } from "preact/hooks";

import {
    CancelledIcon,
    CompletedIcon,
    CreatedIcon,
    DueIcon,
    FileIcon,
    OverdueIcon,
    PriorityIcon,
    RepeatIcon,
    ScheduledIcon,
    StartedIcon,
    TagsIcon,
    TaskIcon,
} from "../assets/icons";
import { Link, Task } from "../lib/dataview-types";
import { VaultLink } from "./vault-link";
import { extractTaskMetadata } from "../features/tasks/parse-task";
import { usePluginContext } from "../context/plugin-context";

export interface TaskEntryProps {
    task: Task;
}

export const TaskEntry = ({ task: { checked, completed, path, position, section, text, tags } }: TaskEntryProps) => {
    const {
        description,
        overdue,
        priority,
        rrule,
        cancelledDate,
        createdDate,
        doneDate,
        dueDate,
        scheduledDate,
        startDate,
    } = useMemo(() => extractTaskMetadata(text, tags), [text, tags]);

    const { obsidian, tasksApi } = usePluginContext();

    const onToggleTask = useCallback(() => {
        obsidian.processFilePosition(path, position, (taskContent: string) =>
            tasksApi.executeToggleTaskDoneCommand(taskContent, path),
        );
    }, [obsidian, path, position, tasksApi]);

    const [statusIcon, className] =
        completed ? [<CompletedIcon key="completed" />, "task done"]
        : checked ? [<CancelledIcon key="cancelled" />, "task cancelled"]
        : overdue ? [<OverdueIcon key="overdue" />, "task overdue"]
        : [<TaskIcon key="open" />, "task"];

    const infoElements = [
        <LinkInfo key="file" link={section} />,
        <StringInfo key="priority" text={priority} icon={<PriorityIcon />} className="priority" />,
        <StringInfo key="repeat" text={rrule} icon={<RepeatIcon />} className="repeat" />,
        <StringInfo key="tags" text={tags.join(", ") || undefined} icon={<TagsIcon />} className="tag" />,
        <DateTimeInfo key="created" date={createdDate} icon={<CreatedIcon />} />,
        <DateTimeInfo key="start" date={startDate} icon={<StartedIcon />} />,
        <DateTimeInfo key="due" date={dueDate} icon={<DueIcon />} />,
        <DateTimeInfo key="scheduled" date={scheduledDate} icon={<ScheduledIcon />} />,
        <DateTimeInfo key="done" date={doneDate} icon={<CompletedIcon />} />,
        <DateTimeInfo key="cancelled" date={cancelledDate} icon={<CancelledIcon />} />,
    ];

    return (
        <div class={className}>
            <div class="timeline">
                <div class="icon" onClick={onToggleTask}>
                    {statusIcon}
                </div>
                <div class="stripe" />
            </div>
            <div class="lines">
                <div class="content">{description}</div>
                <div class="line info">{infoElements}</div>
            </div>
        </div>
    );
};

const LinkInfo = (props: { link?: Link }) =>
    props.link !== undefined ?
        <div class="file">
            <div class="icon">
                <FileIcon />
            </div>
            <div class="label">
                <VaultLink className="internal-link" href={props.link.obsidianLink()} sourcePath={props.link.path}>
                    {props.link.fileName()}
                    {props.link.subpath ?
                        <span class="header">&nbsp;&gt;&nbsp;{props.link.subpath}</span>
                    :   null}
                </VaultLink>
            </div>
        </div>
    :   <></>;

const StringInfo = (props: { text?: string; icon: VNode; className: string }) =>
    props.text ?
        <div class={props.className}>
            <div class="icon">{props.icon}</div>
            <div class="label">&nbsp;{props.text}</div>
        </div>
    :   <></>;

const DateTimeInfo = ({ date, icon }: { date?: DateTime<true>; icon: VNode }) =>
    date?.isValid ?
        <div class="relative">
            <div class="icon">{icon}</div>
            <div class="label">&nbsp;{date.toRelativeCalendar()}</div>
        </div>
    :   <></>;
