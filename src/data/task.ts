/* v8 ignore next 1 */
import { isArray, isNumber, isString } from "lodash";
import { DateTime } from "luxon";

export const TASK_STATUSES = ["OPEN", "DONE", "DROPPED", "CUSTOM"] as const;

export type TaskStatus = typeof TASK_STATUSES extends ReadonlyArray<infer T> ? T : never;

export class Task implements TaskFields {
    private constructor(
        public readonly status: TaskStatus,
        public readonly customStatus: TaskStatus extends "CUSTOM" ? string : undefined,
        public readonly description: string,
        public readonly priority: number,
        public readonly recurrenceRule: string,
        public readonly cancelledDate: DateTime,
        public readonly createdDate: DateTime,
        public readonly doneDate: DateTime,
        public readonly dueDate: DateTime,
        public readonly scheduledDate: DateTime,
        public readonly startDate: DateTime,
        public readonly tags: readonly string[],
        public readonly location: TaskLocation,
    ) {}

    public static create(part: Partial<TaskFields>): Task {
        const {
            fileStartByte = 0,
            fileStopByte = 0,
            fileLine = undefined,
            filePath = undefined,
            fileSection = undefined,
            fileName = undefined,
            obsidianHref = undefined,
        } = part.location ?? {};

        return new Task(
            part.status && TASK_STATUSES.includes(part.status) ? part.status : "OPEN",
            part.customStatus,
            isString(part.description) ? part.description : "",
            isNumber(part.priority) ? part.priority : 3,
            isString(part.recurrenceRule) ? part.recurrenceRule : "",
            DateTime.isDateTime(part.cancelledDate) ? part.cancelledDate : DateTime.invalid("unspecified"),
            DateTime.isDateTime(part.createdDate) ? part.createdDate : DateTime.invalid("unspecified"),
            DateTime.isDateTime(part.doneDate) ? part.doneDate : DateTime.invalid("unspecified"),
            DateTime.isDateTime(part.dueDate) ? part.dueDate : DateTime.invalid("unspecified"),
            DateTime.isDateTime(part.scheduledDate) ? part.scheduledDate : DateTime.invalid("unspecified"),
            DateTime.isDateTime(part.startDate) ? part.startDate : DateTime.invalid("unspecified"),
            isArray(part.tags) && part.tags.every(isString) ? part.tags : [],
            { fileStartByte, fileStopByte, fileLine, filePath, fileSection, fileName, obsidianHref },
        );
    }
}

export interface TaskFields {
    status: TaskStatus;
    customStatus: TaskStatus extends "CUSTOM" ? string : undefined;
    description: string;
    priority: number;
    recurrenceRule: string;
    cancelledDate: DateTime;
    createdDate: DateTime;
    doneDate: DateTime;
    dueDate: DateTime;
    scheduledDate: DateTime;
    startDate: DateTime;
    tags: readonly string[];
    location: TaskLocation;
}

export interface TaskLocation {
    filePath?: string;
    fileName?: string;
    fileSection?: string;
    fileLine?: number;
    fileStartByte: number;
    fileStopByte: number;
    obsidianHref?: string;
}
