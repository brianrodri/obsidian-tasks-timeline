import { Task } from "../compat/dataview-types";
import { TaskCheckbox } from "./task-checkbox";
import { VaultLink } from "./vault-link";

export interface TaskEntryProps {
    task: Task;
}

export const TaskEntry = ({ task }: TaskEntryProps) => (
    <div class="task">
        <div class="timeline">
            <TaskCheckbox task={task} />
            <div class="stripe" />
        </div>
        <div class="lines">
            <VaultLink href={task.link.obsidianLink()} sourcePath={task.path}>
                {task.text}
            </VaultLink>
        </div>
    </div>
);
