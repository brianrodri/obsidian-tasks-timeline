import { FileIcon, PriorityIcon, RepeatIcon, TagsIcon } from "@/assets/icons";
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
        : task.dueDate.diffNow().as("days") < 0 ? "task overdue"
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
                    <TaskInfoEntry key="location" symbol={<FileIcon />} className="file">
                        <VaultLink className="internal-link" href={obsidianHref} sourcePath={filePath}>
                            {fileLabel}
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
                    <TaskDateInput field="doneDate" task={task} />
                    <TaskDateInput field="cancelledDate" task={task} />
                    <TaskDateInput field="scheduledDate" task={task} />
                    <TaskDateInput field="dueDate" task={task} />
                    <TaskDateInput field="startDate" task={task} />
                    <TaskDateInput field="createdDate" task={task} />
                </div>
            </div>
        </div>
    );
};
