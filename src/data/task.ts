import { isNumber, isSet, isString } from "lodash";
import type { PickByValueExact } from "utility-types";

import { toPlainDate } from "@/lib/temporal/plain-date";

export const TASK_STATUSES = ["OPEN", "DONE", "DROPPED", "CUSTOM"] as const;

export type TaskStatus = typeof TASK_STATUSES extends readonly (infer T)[] ? T : never;

export class Task implements TaskFields {
    public readonly key: string;
    public readonly status: TaskStatus;
    public readonly customStatus: TaskStatus extends "CUSTOM" ? string : undefined;
    public readonly description: string;
    public readonly priority: number;
    public readonly recurrenceRule: string;
    public readonly cancelledDate: Temporal.PlainDate | undefined;
    public readonly createdDate: Temporal.PlainDate | undefined;
    public readonly doneDate: Temporal.PlainDate | undefined;
    public readonly dueDate: Temporal.PlainDate | undefined;
    public readonly scheduledDate: Temporal.PlainDate | undefined;
    public readonly startDate: Temporal.PlainDate | undefined;
    public readonly tags: ReadonlySet<string>;
    public readonly location: TaskLocation;
    public readonly id: string;
    public readonly dependsOn: ReadonlySet<string>;

    private constructor(fields: TaskFields) {
        this.status = fields.status;
        this.customStatus = fields.customStatus;
        this.description = fields.description;
        this.priority = fields.priority;
        this.recurrenceRule = fields.recurrenceRule;
        this.cancelledDate = fields.cancelledDate;
        this.createdDate = fields.createdDate;
        this.doneDate = fields.doneDate;
        this.dueDate = fields.dueDate;
        this.scheduledDate = fields.scheduledDate;
        this.startDate = fields.startDate;
        this.tags = fields.tags;
        this.location = fields.location;
        this.id = fields.id;
        this.dependsOn = fields.dependsOn;
        this.key = JSON.stringify(this);
    }

    public static create(part: TaskInput): Task {
        const {
            fileStartByte = 0,
            fileStopByte = 0,
            fileLine,
            filePath,
            fileSection,
            fileName,
            obsidianHref,
        } = part.location ?? {};

        return new Task({
            status: part.status && TASK_STATUSES.includes(part.status) ? part.status : "OPEN",
            customStatus: part.status === "CUSTOM" && isString(part.customStatus) ? part.customStatus : undefined,
            description: isString(part.description) ? part.description : "",
            priority: isNumber(part.priority) ? part.priority : 3,
            recurrenceRule: isString(part.recurrenceRule) ? part.recurrenceRule : "",
            cancelledDate: toPlainDate(part.cancelledDate),
            createdDate: toPlainDate(part.createdDate),
            doneDate: toPlainDate(part.doneDate),
            dueDate: toPlainDate(part.dueDate),
            scheduledDate: toPlainDate(part.scheduledDate),
            startDate: toPlainDate(part.startDate),
            tags: isSet(part.tags) && part.tags.values().every(isString) ? part.tags : new Set(),
            location: { fileStartByte, fileStopByte, fileLine, filePath, fileSection, fileName, obsidianHref },
            id: isString(part.id) ? part.id : "",
            dependsOn: isSet(part.dependsOn) && part.dependsOn.values().every(isString) ? part.dependsOn : new Set(),
        });
    }

    public get folder(): string | undefined {
        if (this.location.filePath) {
            const parts = this.location.filePath.split("/");
            return parts.length > 1 ? parts.at(-2) : undefined;
        }
        return undefined;
    }

    public get happensDate(): Temporal.PlainDate | undefined {
        const { doneDate, cancelledDate, startDate, scheduledDate, dueDate, createdDate } = this;

        if (doneDate) {
            return doneDate;
        }
        if (cancelledDate) {
            return cancelledDate;
        }
        if (scheduledDate && startDate && dueDate) {
            return minDate(maxDate(scheduledDate, startDate), dueDate);
        }
        if (scheduledDate && startDate) {
            return maxDate(scheduledDate, startDate);
        }
        if (scheduledDate && dueDate) {
            return minDate(scheduledDate, dueDate);
        }
        if (startDate && dueDate) {
            return minDate(startDate, dueDate);
        }
        if (scheduledDate) {
            return scheduledDate;
        }
        if (startDate) {
            return startDate;
        }
        if (dueDate) {
            return dueDate;
        }
        if (createdDate) {
            return createdDate;
        }

        return undefined;
    }
}

function minDate(a: Temporal.PlainDate, b: Temporal.PlainDate): Temporal.PlainDate {
    return Temporal.PlainDate.compare(a, b) <= 0 ? a : b;
}

function maxDate(a: Temporal.PlainDate, b: Temporal.PlainDate): Temporal.PlainDate {
    return Temporal.PlainDate.compare(a, b) >= 0 ? a : b;
}

export type TaskDateField = keyof PickByValueExact<TaskFields, Temporal.PlainDate | undefined>;

/** Raw fields accepted by {@link Task.create}, which validates them into {@link TaskFields}. */
export type TaskInput = Partial<
    Omit<TaskFields, TaskDateField> & Record<TaskDateField, Temporal.PlainDateLike | null | undefined>
>;

export interface TaskFields {
    status: TaskStatus;
    customStatus: TaskStatus extends "CUSTOM" ? string : undefined;
    description: string;
    priority: number;
    recurrenceRule: string;
    cancelledDate: Temporal.PlainDate | undefined;
    createdDate: Temporal.PlainDate | undefined;
    doneDate: Temporal.PlainDate | undefined;
    dueDate: Temporal.PlainDate | undefined;
    scheduledDate: Temporal.PlainDate | undefined;
    startDate: Temporal.PlainDate | undefined;
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
