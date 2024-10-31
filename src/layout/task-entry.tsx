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
import { TaskDateInput } from "./task-date-input";
import { TaskInfoEntry } from "./task-info-entry";

export interface TaskEntryProps {
    task: Task;
}

export const TaskEntry = ({ task }: TaskEntryProps) => {
    const { filePath, fileName, fileSection, obsidianHref } = task.location;

    const rootElClass =
        task.status === "DONE" ? "task done"
        : task.status === "DROPPED" ? "task cancelled"
        : task.dueDate.isValid && task.dueDate.diffNow().as("days") < -1 ? "task overdue"
        : "task";

    const fileLabel =
        fileSection ?
            <>
                {fileName}
                <span class="header">{` > ${fileSection}`}</span>
            </>
        :   fileName;

    return (
        <div class={rootElClass}>
            <div class="timeline">
                <TaskCheckbox status={task.status} location={task.location} />
                <div class="stripe" />
            </div>
            <div class="lines">
                <div class="content">{task.description}</div>
                <div class="line info">
                    <TaskInfoEntry symbol={<FileIcon />} className="file">
                        <VaultLink className="internal-link" href={obsidianHref} sourcePath={filePath}>
                            {fileLabel}
                        </VaultLink>
                    </TaskInfoEntry>
                    <TaskInfoEntry symbol={<TagsIcon />} className="tag">
                        {task.tags.join(", ")}
                    </TaskInfoEntry>
                    <TaskInfoEntry symbol={<PriorityIcon />} className="priority">
                        {task.priority}
                    </TaskInfoEntry>
                    <TaskInfoEntry symbol={<RepeatIcon />} className="repeat">
                        {task.recurrenceRule}
                    </TaskInfoEntry>
                    <TaskDateInput field="dueDate" symbol={<DueIcon />} task={task} />
                    <TaskDateInput field="doneDate" symbol={<CompletedIcon />} task={task} />
                    <TaskDateInput field="cancelledDate" symbol={<CancelledIcon />} task={task} />
                    <TaskDateInput field="scheduledDate" symbol={<ScheduledIcon />} task={task} />
                    <TaskDateInput field="startDate" symbol={<StartedIcon />} task={task} />
                    <TaskDateInput field="createdDate" symbol={<CreatedIcon />} task={task} />
                </div>
            </div>
        </div>
    );
};
