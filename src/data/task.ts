/* v8 ignore next 1 */
import { isNumber, isSet, isString } from "lodash";
import { DateTime } from "luxon";

export const TASK_STATUSES = ["OPEN", "DONE", "DROPPED", "CUSTOM"] as const;

export type TaskStatus = typeof TASK_STATUSES extends ReadonlyArray<infer T> ? T : never;

export class Task implements TaskFields {
    public readonly key: string;

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
        public readonly tags: ReadonlySet<string>,
        public readonly location: TaskLocation,
        public readonly id: string,
        public readonly dependsOn: ReadonlySet<string>,
    ) {
        this.key = JSON.stringify(this);
    }

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
            part.status === "CUSTOM" && isString(part.customStatus) ? part.customStatus : undefined,
            isString(part.description) ? part.description : "",
            isNumber(part.priority) ? part.priority : 3,
            isString(part.recurrenceRule) ? part.recurrenceRule : "",
            DateTime.isDateTime(part.cancelledDate) ? part.cancelledDate : DateTime.invalid("unspecified"),
            DateTime.isDateTime(part.createdDate) ? part.createdDate : DateTime.invalid("unspecified"),
            DateTime.isDateTime(part.doneDate) ? part.doneDate : DateTime.invalid("unspecified"),
            DateTime.isDateTime(part.dueDate) ? part.dueDate : DateTime.invalid("unspecified"),
            DateTime.isDateTime(part.scheduledDate) ? part.scheduledDate : DateTime.invalid("unspecified"),
            DateTime.isDateTime(part.startDate) ? part.startDate : DateTime.invalid("unspecified"),
            isSet(part.tags) && part.tags.values().every(isString) ? part.tags : new Set(),
            { fileStartByte, fileStopByte, fileLine, filePath, fileSection, fileName, obsidianHref },
            isString(part.id) ? part.id : "",
            isSet(part.dependsOn) && part.dependsOn.values().every(isString) ? part.dependsOn : new Set(),
        );
    }

    public get happensDate(): DateTime {
        const { doneDate, cancelledDate, startDate, scheduledDate, dueDate, createdDate } = this;

        if (doneDate.isValid) {
            return doneDate;
        }
        if (cancelledDate.isValid) {
            return cancelledDate;
        }
        if (scheduledDate.isValid && startDate.isValid && dueDate.isValid) {
            return DateTime.min(DateTime.max(scheduledDate, startDate), dueDate);
        }
        if (scheduledDate.isValid && startDate.isValid) {
            return DateTime.max(scheduledDate, startDate);
        }
        if (scheduledDate.isValid && dueDate.isValid) {
            return DateTime.min(scheduledDate, dueDate);
        }
        if (startDate.isValid && dueDate.isValid) {
            return DateTime.min(startDate, dueDate);
        }
        if (scheduledDate.isValid) {
            return scheduledDate;
        }
        if (startDate.isValid) {
            return startDate;
        }
        if (dueDate.isValid) {
            return dueDate;
        }
        if (createdDate.isValid) {
            return createdDate;
        }

        return DateTime.invalid("task has no valid dates");
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
    tags: ReadonlySet<string>;
    location: TaskLocation;
    id: string;
    dependsOn: ReadonlySet<string>;
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
