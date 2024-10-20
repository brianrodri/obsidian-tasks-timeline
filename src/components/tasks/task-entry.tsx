import { memoize } from "lodash";
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
            <div class="content">{removePatterns(task.text)}</div>
            <div class="line info">
                <LinkInfo link={task.section} />
                <TagsInfo tags={task.tags} />
                <DateInfo start={task.start} due={task.due} completion={task.completion} scheduled={task.scheduled} />
            </div>
        </div>
    </div>
);

const removePatterns = memoize((inputText: string) =>
    [
        TASK_RECURRENCE_EMOJI_PATTERN,
        TASK_DATE_EMOJI_PATTERN,
        TASK_PRIORITY_EMOJI_PATTERN,
        DATAVIEW_FULL_PROPERTY_PATTERN,
        DATAVIEW_SHORT_PROPERTY_PATTERN,
    ].reduce((text: string, pattern: RegExp) => text.replace(pattern, ""), inputText),
);

const TASK_RECURRENCE_EMOJI_PATTERN = /🔁\s+([A-Za-z0-9\s,]+)/g;
const TASK_PRIORITY_EMOJI_PATTERN = /(⏬|🔽|🔼|⏫|🔺)/g;
const TASK_DATE_EMOJI_PATTERN = /(➕|⏳|🛫|📅|✅|❌) \d{4}-\d{2}-\d{2}/g;
const DATAVIEW_FULL_PROPERTY_PATTERN = /\(\s*(.*?)\s*::\s*(.*?)\)/g;
const DATAVIEW_SHORT_PROPERTY_PATTERN = /\[\s*(.*?)\s*::\s*(.*?)\]/g;
