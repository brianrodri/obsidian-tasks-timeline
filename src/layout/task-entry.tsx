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
import { useAppContext } from "@/context/app-context";
import type { Task } from "@/data/task";
import { TaskCheckbox } from "@/layout/task-checkbox";
import { TaskDateInput } from "@/layout/task-date-input";
import { TaskInfoEntry } from "@/layout/task-info-entry";
import { TaskLocation } from "@/layout/task-location";
import { ObsidianMarkdown } from "@/lib/obsidian/markdown";

export interface TaskEntryProps {
    task: Task;
}

/**
 * Renders one task: its checkbox, description, file location, and fields. Marks the task as done, cancelled, or
 * overdue, where overdue means it is due before today.
 */
export const TaskEntry = ({ task }: TaskEntryProps) => {
    const { plugin, store } = useAppContext();
    const overdue = !!task.dueDate && Temporal.PlainDate.compare(task.dueDate, store.today.value) < 0;
    const { filePath, fileSection, obsidianHref } = task.location;

    const rootElClass =
        task.status === "DONE" ? "task done"
        : task.status === "DROPPED" ? "task cancelled"
        : overdue ? "task overdue"
        : "task";

    return (
        <div class={rootElClass}>
            <div class="timeline">
                <TaskCheckbox task={task} />
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
