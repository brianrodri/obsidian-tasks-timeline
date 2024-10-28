import { DateTime } from "luxon";
import { VNode } from "preact";
import { useCallback } from "preact/hooks";

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
} from "@/assets/icons";
import { VaultLink } from "@/components/vault-link";
import { usePluginContext } from "@/context/plugin-context";
import { Task, TaskLocation } from "@/data/task";

export interface TaskEntryProps {
    task: Task;
}

function useTaskEntry({
    status,
    description,
    priority,
    recurrenceRule,
    cancelledDate,
    createdDate,
    doneDate,
    dueDate,
    scheduledDate,
    startDate,
    location,
    tags,
}: Task) {
    const { obsidian, tasksApi } = usePluginContext();

    const overdue = dueDate.isValid && dueDate.diffNow("days").as("days") < 0;
    const { filePath, fileStartByte, fileStopByte } = location;

    const onToggleTask = useCallback(() => {
        if (filePath) {
            obsidian.processFilePosition(filePath, fileStartByte, fileStopByte, (taskContent: string) =>
                tasksApi.executeToggleTaskDoneCommand(taskContent, filePath),
            );
        }
    }, [obsidian, filePath, fileStartByte, fileStopByte, tasksApi]);

    const [statusIcon, className] =
        status === "DONE" ? [<CompletedIcon key="completed" />, "task done"]
        : status === "DROPPED" ? [<CancelledIcon key="cancelled" />, "task cancelled"]
        : overdue ? [<OverdueIcon key="overdue" />, "task overdue"]
        : [<TaskIcon key="open" />, "task"];

    const infoElements = [
        <LocationInfo key="file" location={location} />,
        <StringInfo key="tags" text={tags.join(", ") || undefined} icon={<TagsIcon />} className="tag" />,
        <StringInfo key="priority" text={`${priority}`} icon={<PriorityIcon />} className="priority" />,
        <StringInfo key="repeat" text={recurrenceRule} icon={<RepeatIcon />} className="repeat" />,
        <DateTimeInfo key="created" date={createdDate} icon={<CreatedIcon />} />,
        <DateTimeInfo key="due" date={dueDate} icon={<DueIcon />} />,
        <DateTimeInfo key="scheduled" date={scheduledDate} icon={<ScheduledIcon />} />,
        <DateTimeInfo key="start" date={startDate} icon={<StartedIcon />} />,
        <DateTimeInfo key="done" date={doneDate} icon={<CompletedIcon />} />,
        <DateTimeInfo key="cancelled" date={cancelledDate} icon={<CancelledIcon />} />,
    ];

    return { description, infoElements, statusIcon, className, onToggleTask };
}

export const TaskEntry = ({ task }: TaskEntryProps) => {
    const { description, infoElements, onToggleTask, statusIcon, className } = useTaskEntry(task);

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

const LocationInfo = (props: { location?: Partial<TaskLocation> }) =>
    props.location ?
        <div class="file">
            <div class="icon">
                <FileIcon />
            </div>
            <div class="label">
                <VaultLink
                    className="internal-link"
                    href={props.location.obsidianHref}
                    sourcePath={props.location.filePath}
                >
                    {props.location.fileName}
                    {props.location.fileSection ?
                        <span class="header">&nbsp;&gt;&nbsp;{props.location.fileSection}</span>
                    :   undefined}
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
