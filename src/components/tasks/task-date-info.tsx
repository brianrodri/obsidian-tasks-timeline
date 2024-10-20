import { map, upperFirst } from "lodash";
import { DateTime } from "luxon";
import { VNode } from "preact";

import { DoneIcon, DueIcon, ScheduledIcon, StartIcon } from "../../assets/icons";

export interface DateInfoProps {
    start?: DateTime<true>;
    due?: DateTime<true>;
    completion?: DateTime<true>;
    scheduled?: DateTime<true>;
}

export function DateInfo(props: DateInfoProps) {
    const dateInfoList = map(props, (date, dateKey) =>
        date?.isValid ?
            <div class="relative">
                <div class="icon">{DATE_ICON_MAP[dateKey]}</div>
                <div class="label">{upperFirst(date.toRelativeCalendar())}</div>
            </div>
        :   undefined,
    );

    return <>{dateInfoList}</>;
}

const DATE_ICON_MAP: Record<string, VNode> = {
    start: StartIcon,
    due: DueIcon,
    completion: DoneIcon,
    scheduled: ScheduledIcon,
} satisfies { [K in keyof DateInfoProps]-?: VNode };
