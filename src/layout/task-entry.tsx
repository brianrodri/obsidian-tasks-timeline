import { Task } from "@/data/task";
import { useTaskEntry } from "@/hooks/use-task-entry";

export interface TaskEntryProps {
    task: Task;
}

export const TaskEntry = ({ task }: TaskEntryProps) => {
    const { infoEntries, statusIcon, className, onToggleTask } = useTaskEntry(task);

    return (
        <div class={className}>
            <div class="timeline">
                <div class="icon" onClick={onToggleTask}>
                    {statusIcon}
                </div>
                <div class="stripe" />
            </div>
            <div class="lines">
                <div class="content">{task.description}</div>
                <div class="line info">{infoEntries}</div>
            </div>
        </div>
    );
};
