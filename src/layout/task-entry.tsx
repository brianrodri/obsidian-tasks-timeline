import {
    CancelledIcon,
    CompletedIcon,
    CreatedIcon,
    DueIcon,
    FileIcon,
    PriorityIcon,
    RepeatIcon,
    ScheduledIcon,
    StartedIcon,
    TagsIcon,
} from "@/assets/icons";
import { VaultLink } from "@/components/vault-link";
import { Task } from "@/data/task";

import { TaskCheckbox } from "./task-checkbox";
import { TaskInfoEntry } from "./task-info-entry";

export interface TaskEntryProps {
    task: Task;
}

export const TaskEntry = ({ task }: TaskEntryProps) => {
    const { filePath, fileName, fileSection, obsidianHref } = task.location;

    const rootElClass =
        task.status === "DONE" ? "task done"
        : task.status === "DROPPED" ? "task cancelled"
        : task.dueDate.diffNow().as("days") < 0 ? "task overdue"
        : "task";

    return (
        <div class={rootElClass}>
            <div class="timeline">
                <TaskCheckbox status={task.status} location={task.location} />
                <div class="stripe" />
            </div>
            <div class="lines">
                <div class="content">{task.description}</div>
                <div class="line info">
                    <TaskInfoEntry key="location" symbol={<FileIcon />} className="file">
                        <VaultLink className="internal-link" href={obsidianHref} sourcePath={filePath}>
                            {fileSection ?
                                <>
                                    {fileName}
                                    <span class="header">{` > ${fileSection}`}</span>
                                </>
                            :   fileName}
                        </VaultLink>
                    </TaskInfoEntry>
                    <TaskInfoEntry key="tags" symbol={<TagsIcon />} className="tag">
                        {task.tags.join(", ")}
                    </TaskInfoEntry>
                    <TaskInfoEntry key="priority" symbol={<PriorityIcon />} className="priority">
                        {task.priority}
                    </TaskInfoEntry>
                    <TaskInfoEntry key="repeat" symbol={<RepeatIcon />} className="repeat">
                        {task.recurrenceRule}
                    </TaskInfoEntry>
                    <TaskInfoEntry key="done" symbol={<CompletedIcon />} className="relative">
                        {task.doneDate.toRelativeCalendar()}
                    </TaskInfoEntry>
                    <TaskInfoEntry key="cancelled" symbol={<CancelledIcon />} className="relative">
                        {task.cancelledDate.toRelativeCalendar()}
                    </TaskInfoEntry>
                    <TaskInfoEntry key="scheduled" symbol={<ScheduledIcon />} className="relative">
                        {task.scheduledDate.toRelativeCalendar()}
                    </TaskInfoEntry>
                    <TaskInfoEntry key="due" symbol={<DueIcon />} className="relative">
                        {task.dueDate.toRelativeCalendar()}
                    </TaskInfoEntry>
                    <TaskInfoEntry key="start" symbol={<StartedIcon />} className="relative">
                        {task.startDate.toRelativeCalendar()}
                    </TaskInfoEntry>
                    <TaskInfoEntry key="created" symbol={<CreatedIcon />} className="relative">
                        {task.createdDate.toRelativeCalendar()}
                    </TaskInfoEntry>
                </div>
            </div>
        </div>
    );
};
