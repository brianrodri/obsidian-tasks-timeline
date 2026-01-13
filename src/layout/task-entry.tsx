import { trimStart } from "lodash";

import {
    CancelledIcon,
    CompletedIcon,
    CreatedIcon,
    DependsOnIcon,
    DueIcon,
    IdIcon,
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
import { TaskLocation } from "@/layout/task-location";
import { ObsidianMarkdown } from "@/lib/obsidian/markdown";

export interface TaskEntryProps {
    task: Task;
}

export const TaskEntry = ({ task }: TaskEntryProps) => {
    const overdue = task.dueDate.isValid && task.dueDate.diffNow().as("days") < -1;
    const { filePath, fileSection, obsidianHref } = task.location;
    const { plugin } = usePluginContext();

    const rootElClass =
        task.status === "DONE" ? "task done"
        : task.status === "DROPPED" ? "task cancelled"
        : overdue ? "task overdue"
        : "task";

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
                <VaultLink href={obsidianHref} sourcePath={filePath} className="file">
                    <TaskLocation path={filePath} section={fileSection} />
                </VaultLink>
                <TaskInfoEntry symbol={<IdIcon />} className="id">
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
                <TaskInfoEntry symbol={<DependsOnIcon />} className="depends-on">
                    {task.dependsOn
                        .values()
                        .map((id) => trimStart(id, "#"))
                        .toArray()
                        .join(", ")}
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
