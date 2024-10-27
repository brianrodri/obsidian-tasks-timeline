/**
 * @fileoverview Defines the plugin-wide schema for "obsidian tasks". User-facing code must read from valid instances.
 *
 * This plugin is currently designed for Dataview and Obsidian Tasks, but it'd be great to switch to Datacore in the
 * future if there are real performance boosts to be found.
 *
 * NOTE: I hate how bloated this class is from the type stuff, but it's very nice being able to guarantee you have a
 * {@link DateTime<true>} from the IDE.
 *
 * TODO: Try to generalize this logic in type-utils so that this file shrinks by ~45%.
 */

/* v8 ignore next 1 */
import { isNumber, isString } from "lodash";
import { DateTime } from "luxon";

export class Task<
    CancelledDateIsValid extends boolean = boolean,
    CreatedDateIsValid extends boolean = boolean,
    DoneDateIsValid extends boolean = boolean,
    DueDateIsValid extends boolean = boolean,
    ScheduledDateIsValid extends boolean = boolean,
    StartDateIsValid extends boolean = boolean,
> implements
        TaskFields<
            CancelledDateIsValid,
            CreatedDateIsValid,
            DoneDateIsValid,
            DueDateIsValid,
            ScheduledDateIsValid,
            StartDateIsValid
        >
{
    private constructor(
        public readonly description: string,
        public readonly priority: number,
        public readonly recurrenceRule: string,
        public readonly cancelledDate: DateTime<CancelledDateIsValid>,
        public readonly createdDate: DateTime<CreatedDateIsValid>,
        public readonly doneDate: DateTime<DoneDateIsValid>,
        public readonly dueDate: DateTime<DueDateIsValid>,
        public readonly scheduledDate: DateTime<ScheduledDateIsValid>,
        public readonly startDate: DateTime<StartDateIsValid>,
    ) {}

    public static readonly EMPTY = Task.fromFields({});

    public static fromFields<T extends Partial<TaskFields>>(
        part = {} as T,
    ): Task<
        T extends { cancelledDate: DateTime<infer IsValid> } ? IsValid : false,
        T extends { createdDate: DateTime<infer IsValid> } ? IsValid : false,
        T extends { doneDate: DateTime<infer IsValid> } ? IsValid : false,
        T extends { dueDate: DateTime<infer IsValid> } ? IsValid : false,
        T extends { scheduledDate: DateTime<infer IsValid> } ? IsValid : false,
        T extends { startDate: DateTime<infer IsValid> } ? IsValid : false
    > {
        return new Task(
            isString(part.description) ? part.description : "",
            isNumber(part.priority) ? part.priority : 3,
            isString(part.recurrenceRule) ? part.recurrenceRule : "",
            DateTime.isDateTime(part.cancelledDate) ? part.cancelledDate : DateTime.invalid("unspecified"),
            DateTime.isDateTime(part.createdDate) ? part.createdDate : DateTime.invalid("unspecified"),
            DateTime.isDateTime(part.doneDate) ? part.doneDate : DateTime.invalid("unspecified"),
            DateTime.isDateTime(part.dueDate) ? part.dueDate : DateTime.invalid("unspecified"),
            DateTime.isDateTime(part.scheduledDate) ? part.scheduledDate : DateTime.invalid("unspecified"),
            DateTime.isDateTime(part.startDate) ? part.startDate : DateTime.invalid("unspecified"),
        );
    }

    public with<K extends keyof TaskFields, V extends TaskFields[K]>(
        key: K,
        value: V,
    ): Task<
        [K, V] extends ["cancelledDate", DateTime<infer WithIsValid>] ? WithIsValid : CancelledDateIsValid,
        [K, V] extends ["createdDate", DateTime<infer WithIsValid>] ? WithIsValid : CreatedDateIsValid,
        [K, V] extends ["doneDate", DateTime<infer WithIsValid>] ? WithIsValid : DoneDateIsValid,
        [K, V] extends ["dueDate", DateTime<infer WithIsValid>] ? WithIsValid : DueDateIsValid,
        [K, V] extends ["scheduledDate", DateTime<infer WithIsValid>] ? WithIsValid : ScheduledDateIsValid,
        [K, V] extends ["startDate", DateTime<infer WithIsValid>] ? WithIsValid : StartDateIsValid
    > {
        const {
            description,
            priority,
            recurrenceRule,
            cancelledDate,
            createdDate,
            doneDate,
            dueDate,
            scheduledDate,
            startDate,
        } = { ...this.toFields(), [key]: value } as TaskFields;
        return new Task(
            description,
            priority,
            recurrenceRule,
            cancelledDate,
            createdDate,
            doneDate,
            dueDate,
            scheduledDate,
            startDate,
        );
    }

    public toFields(): TaskFields<
        CancelledDateIsValid,
        CreatedDateIsValid,
        DoneDateIsValid,
        DueDateIsValid,
        ScheduledDateIsValid,
        StartDateIsValid
    > {
        return {
            description: this.description,
            priority: this.priority,
            recurrenceRule: this.recurrenceRule,
            cancelledDate: this.cancelledDate,
            createdDate: this.createdDate,
            doneDate: this.doneDate,
            dueDate: this.dueDate,
            scheduledDate: this.scheduledDate,
            startDate: this.startDate,
        };
    }
}

export interface TaskFields<
    CancelledDateIsValid extends boolean = boolean,
    CreatedDateIsValid extends boolean = boolean,
    DoneDateIsValid extends boolean = boolean,
    DueDateIsValid extends boolean = boolean,
    ScheduledDateIsValid extends boolean = boolean,
    StartDateIsValid extends boolean = boolean,
> {
    description: string;
    priority: number;
    recurrenceRule: string;
    cancelledDate: DateTime<CancelledDateIsValid>;
    createdDate: DateTime<CreatedDateIsValid>;
    doneDate: DateTime<DoneDateIsValid>;
    dueDate: DateTime<DueDateIsValid>;
    scheduledDate: DateTime<ScheduledDateIsValid>;
    startDate: DateTime<StartDateIsValid>;
}
