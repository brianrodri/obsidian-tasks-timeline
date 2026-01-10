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
} from "@/components/icons";
import { VaultLink } from "@/components/vault-link";
import { usePluginContext } from "@/context/plugin-context";
import { Task } from "@/data/task";

import { TaskCheckbox } from "@/layout/task-checkbox";
import { TaskDateInput } from "@/layout/task-date-input";
import { TaskInfoEntry } from "@/layout/task-info-entry";
import { ObsidianMarkdown } from "@/lib/obsidian/markdown";
import { NetworkIcon, SignatureIcon } from "lucide-preact";

export interface TaskEntryProps {
    task: Task;
}

export const TaskEntry = ({ task }: TaskEntryProps) => {
    const overdue = task.dueDate.isValid && task.dueDate.diffNow().as("days") < -1;
    const { filePath, fileName, fileSection, obsidianHref } = task.location;
    const { plugin } = usePluginContext();

    const rootElClass =
        task.status === "DONE" ? "task done"
        : task.status === "DROPPED" ? "task cancelled"
        : overdue ? "task overdue"
        : "task";

    const fileLabel =
        fileSection ?
            <>
                {fileName}
                {fileName !== fileSection ?
                    <span class="header">{` > ${fileSection}`}</span>
                :   null}
            </>
        :   fileName;

    return (
        <div class={rootElClass}>
            <div class="timeline">
                <TaskCheckbox status={task.status} location={task.location} />
            </div>
            <div class="lines">
                <span class="content">
                    <ObsidianMarkdown
                        app={plugin.app}
                        component={plugin}
                        markdown={task.description}
                        sourcePath={filePath}
                    />
                </span>
                <TaskInfoEntry symbol={<FileIcon />} className="file">
                    <VaultLink className="internal-link" href={obsidianHref} sourcePath={filePath}>
                        {fileLabel}
                    </VaultLink>
                </TaskInfoEntry>
                <TaskInfoEntry symbol={<SignatureIcon />} className="id">
                    {task.id}
                </TaskInfoEntry>
                <TaskInfoEntry symbol={<TagsIcon />} className="tag">
                    {task.tags.values().toArray().join(", ")}
                </TaskInfoEntry>
                <TaskInfoEntry symbol={<PriorityIcon />} className="priority">
                    {task.priority}
                </TaskInfoEntry>
                <TaskInfoEntry symbol={<RepeatIcon />} className="repeat">
                    {task.recurrenceRule}
                </TaskInfoEntry>
                <TaskInfoEntry symbol={<NetworkIcon />} className="depends-on">
                    {task.dependsOn.values().toArray().join(", ")}
                </TaskInfoEntry>
                <TaskDateInput field="dueDate" symbol={<DueIcon />} task={task} />
                <TaskDateInput field="doneDate" symbol={<CompletedIcon />} task={task} />
                <TaskDateInput field="cancelledDate" symbol={<CancelledIcon />} task={task} />
                <TaskDateInput field="scheduledDate" symbol={<ScheduledIcon />} task={task} />
                <TaskDateInput field="startDate" symbol={<StartedIcon />} task={task} />
                <TaskDateInput field="createdDate" symbol={<CreatedIcon />} task={task} />
            </div>
        </div>
    );
};
