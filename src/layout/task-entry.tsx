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
} from "@/assets/icons";
import { VaultLink } from "@/components/vault-link";
import { usePluginContext } from "@/context/plugin-context";
import { Task, TaskLocation } from "@/data/task";

export interface TaskEntryProps {
    task: Task;
}

export const TaskEntry = ({ task }: TaskEntryProps) => {
    const { description, taskInfo, taskStatusIcon, className, onToggleTask } = useTaskEntry(task);
    return (
        <div class={className}>
            <div class="timeline">
                <div class="icon" onClick={onToggleTask}>
                    {taskStatusIcon}
                </div>
                <div class="stripe" />
            </div>
            <div class="lines">
                <div class="content">{description}</div>
                <div class="line info">{taskInfo}</div>
            </div>
        </div>
    );
};

function LocationInfo(props: { location?: Partial<TaskLocation> }) {
    if (!props.location) return <></>;
    return (
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
    );
}

function SimpleInfo(props: { text?: string; icon: VNode; className: string }) {
    if (!props.text) return <></>;
    return (
        <div class={props.className}>
            <div class="icon">{props.icon}</div>
            <div class="label">&nbsp;{props.text}</div>
        </div>
    );
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

    const { filePath, fileStartByte, fileStopByte } = location;
    const joinedTags = [...tags].sort().join(", ");
    const overdue = dueDate.isValid && dueDate.diffNow("days").as("days") < 0;

    const [taskStatusIcon, className] =
        status === "DONE" ? [<CompletedIcon key="completed" />, "task done"]
        : status === "DROPPED" ? [<CancelledIcon key="cancelled" />, "task cancelled"]
        : overdue ? [<OverdueIcon key="overdue" />, "task overdue"]
        : [<TaskIcon key="open" />, "task"];

    const cancelled = cancelledDate.toRelativeCalendar();
    const created = createdDate.toRelativeCalendar();
    const done = doneDate.toRelativeCalendar();
    const due = dueDate.toRelativeCalendar();
    const scheduled = scheduledDate.toRelativeCalendar();
    const start = startDate.toRelativeCalendar();

    const onToggleTask = useCallback(() => {
        if (filePath) {
            obsidian.processFilePosition(filePath, fileStartByte, fileStopByte, (taskContent: string) =>
                tasksApi.executeToggleTaskDoneCommand(taskContent, filePath),
            );
        }
    }, [obsidian, filePath, fileStartByte, fileStopByte, tasksApi]);

    const taskInfo = useMemo(
        () => [
            <LocationInfo key="file" location={location} />,
            <SimpleInfo key="tags" text={joinedTags} icon={<TagsIcon />} className="tag" />,
            <SimpleInfo key="priority" text={`${priority}`} icon={<PriorityIcon />} className="priority" />,
            <SimpleInfo key="repeat" text={recurrenceRule} icon={<RepeatIcon />} className="repeat" />,
            <SimpleInfo key="created" text={created ?? undefined} icon={<CreatedIcon />} className="relative" />,
            <SimpleInfo key="due" text={due ?? undefined} icon={<DueIcon />} className="relative" />,
            <SimpleInfo key="scheduled" text={scheduled ?? undefined} icon={<ScheduledIcon />} className="relative" />,
            <SimpleInfo key="start" text={start ?? undefined} icon={<StartedIcon />} className="relative" />,
            <SimpleInfo key="done" text={done ?? undefined} icon={<CompletedIcon />} className="relative" />,
            <SimpleInfo key="cancelled" text={cancelled ?? undefined} icon={<CancelledIcon />} className="relative" />,
        ],
        [cancelled, created, done, due, joinedTags, location, priority, recurrenceRule, scheduled, start],
    );

    return { description, taskInfo, taskStatusIcon, className, onToggleTask };
}
