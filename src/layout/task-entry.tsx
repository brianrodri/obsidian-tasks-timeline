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
    const { taskInfo, taskStatusIcon, className, onToggleTask } = useTaskEntry(task);
    return (
        <div class={className}>
            <div class="timeline">
                <div class="icon" onClick={onToggleTask}>
                    {taskStatusIcon}
                </div>
                <div class="stripe" />
            </div>
            <div class="lines">
                <div class="content">{task.description}</div>
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

function useTaskEntry(task: Task) {
    const { obsidian, tasksApi } = usePluginContext();

    const { filePath, fileStartByte, fileStopByte } = task.location;
    const joinedTags = [...task.tags].sort().join(", ");
    const overdue = task.dueDate.isValid && task.dueDate.diffNow("days").as("days") < 0;

    const [taskStatusIcon, className] =
        task.status === "DONE" ? [<CompletedIcon key="completed" />, "task done"]
        : task.status === "DROPPED" ? [<CancelledIcon key="cancelled" />, "task cancelled"]
        : overdue ? [<OverdueIcon key="overdue" />, "task overdue"]
        : [<TaskIcon key="open" />, "task"];

    const cancelled = task.cancelledDate.toRelativeCalendar();
    const created = task.createdDate.toRelativeCalendar();
    const done = task.doneDate.toRelativeCalendar();
    const due = task.dueDate.toRelativeCalendar();
    const scheduled = task.scheduledDate.toRelativeCalendar();
    const start = task.startDate.toRelativeCalendar();

    const onToggleTask = useCallback(() => {
        if (filePath) {
            obsidian.processFilePosition(filePath, fileStartByte, fileStopByte, (taskContent: string) =>
                tasksApi.executeToggleTaskDoneCommand(taskContent, filePath),
            );
        }
    }, [obsidian, filePath, fileStartByte, fileStopByte, tasksApi]);

    const taskInfo = useMemo(
        () => [
            <LocationInfo key="file" location={task.location} />,
            <SimpleInfo key="tags" text={joinedTags} icon={<TagsIcon />} className="tag" />,
            <SimpleInfo key="priority" text={`${task.priority}`} icon={<PriorityIcon />} className="priority" />,
            <SimpleInfo key="repeat" text={task.recurrenceRule} icon={<RepeatIcon />} className="repeat" />,
            <SimpleInfo key="created" text={created ?? undefined} icon={<CreatedIcon />} className="relative" />,
            <SimpleInfo key="due" text={due ?? undefined} icon={<DueIcon />} className="relative" />,
            <SimpleInfo key="scheduled" text={scheduled ?? undefined} icon={<ScheduledIcon />} className="relative" />,
            <SimpleInfo key="start" text={start ?? undefined} icon={<StartedIcon />} className="relative" />,
            <SimpleInfo key="done" text={done ?? undefined} icon={<CompletedIcon />} className="relative" />,
            <SimpleInfo key="cancelled" text={cancelled ?? undefined} icon={<CancelledIcon />} className="relative" />,
        ],
        [
            cancelled,
            created,
            done,
            due,
            joinedTags,
            scheduled,
            start,
            task.location,
            task.priority,
            task.recurrenceRule,
        ],
    );

    return { taskInfo, taskStatusIcon, className, onToggleTask };
}
