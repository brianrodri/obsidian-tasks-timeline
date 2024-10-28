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
import { Task } from "@/data/task";
import { TaskInfoEntry } from "@/layout/info-entry";

export interface TaskEntryValue {
    statusIcon: VNode;
    infoEntries: VNode;
    className: string;
    onToggleTask: () => void;
}

export function useTaskEntry(task: Task): TaskEntryValue {
    const { obsidian, tasksApi } = usePluginContext();
    const { filePath, fileStartByte, fileStopByte } = task.location;

    const onToggleTask = useCallback(() => {
        if (filePath) {
            obsidian.processFileRange(filePath, fileStartByte, fileStopByte, (data) =>
                tasksApi.executeToggleTaskDoneCommand(data, filePath),
            );
        }
    }, [obsidian, tasksApi, filePath, fileStartByte, fileStopByte]);

    const infoEntries = <InfoEntries {...task} />;

    const [statusIcon, className] =
        task.status === "DONE" ? [<CompletedIcon key="completed" />, "task done"]
        : task.status === "DROPPED" ? [<CancelledIcon key="cancelled" />, "task cancelled"]
        : task.dueDate.diffNow().as("days") < 0 ? [<OverdueIcon key="overdue" />, "task overdue"]
        : [<TaskIcon key="open" />, "task"];

    return { onToggleTask, infoEntries, statusIcon, className };
}

const InfoEntries = ({
    priority,
    recurrenceRule,
    cancelledDate,
    createdDate,
    doneDate,
    dueDate,
    scheduledDate,
    startDate,
    tags,
    location: { fileName, fileSection, obsidianHref, filePath },
}: Task) => (
    <>
        <TaskInfoEntry key="location" infoIcon={<FileIcon />} className="file">
            <VaultLink className="internal-link" href={obsidianHref} sourcePath={filePath}>
                {fileSection ? `${fileName} > ${fileSection}` : fileName}
            </VaultLink>
        </TaskInfoEntry>
        <TaskInfoEntry key="tags" infoIcon={<TagsIcon />} className="tag">
            {tags.join(", ")}
        </TaskInfoEntry>
        <TaskInfoEntry key="priority" infoIcon={<PriorityIcon />} className="priority">
            {priority}
        </TaskInfoEntry>
        <TaskInfoEntry key="repeat" infoIcon={<RepeatIcon />} className="repeat">
            {recurrenceRule}
        </TaskInfoEntry>
        <TaskInfoEntry key="created" infoIcon={<CreatedIcon />} className="relative">
            {createdDate.toRelativeCalendar()}
        </TaskInfoEntry>
        <TaskInfoEntry key="due" infoIcon={<DueIcon />} className="relative">
            {dueDate.toRelativeCalendar()}
        </TaskInfoEntry>
        <TaskInfoEntry key="scheduled" infoIcon={<ScheduledIcon />} className="relative">
            {scheduledDate.toRelativeCalendar()}
        </TaskInfoEntry>
        <TaskInfoEntry key="start" infoIcon={<StartedIcon />} className="relative">
            {startDate.toRelativeCalendar()}
        </TaskInfoEntry>
        <TaskInfoEntry key="done" infoIcon={<CompletedIcon />} className="relative">
            {doneDate.toRelativeCalendar()}
        </TaskInfoEntry>
        <TaskInfoEntry key="cancelled" infoIcon={<CancelledIcon />} className="relative">
            {cancelledDate.toRelativeCalendar()}
        </TaskInfoEntry>
    </>
);
