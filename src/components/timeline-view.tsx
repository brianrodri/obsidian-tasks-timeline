import { DateTime } from "luxon";

import { useScheduledTasks } from "../hooks/use-scheduled-tasks";

export function TimelineView() {
    const { unscheduled, getScheduledOn } = useScheduledTasks();
    const tasks = [...getScheduledOn(DateTime.now()), ...unscheduled].map(({ text }) => <li>{text}</li>);
    return <ul>{tasks}</ul>;
}
