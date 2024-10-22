import { DateTime } from "luxon";

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
