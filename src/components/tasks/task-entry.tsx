import { Task } from "../../compat/dataview-types";
import { TaskCheckbox } from "./task-checkbox";
import { DateInfo } from "./task-date-info";
import { LinkInfo } from "./task-link-info";
import { TagsInfo } from "./task-tags-info";

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
            <div class="content">{task.text}</div>
            <div class="line info">
                <LinkInfo link={task.section} />
                <TagsInfo tags={task.tags} />
                <DateInfo start={task.start} due={task.due} completion={task.completion} scheduled={task.scheduled} />
            </div>
        </div>
    </div>
);
