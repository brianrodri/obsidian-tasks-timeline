/**
 * Describes `date` relative to `base` in the coarsest calendar unit that differs, like "tomorrow" or "next month".
 *
 * Matches the output of Luxon's `DateTime#toRelativeCalendar`.
 */
export function toRelativeCalendar(
    date: Temporal.PlainDate,
    base: Temporal.PlainDate = Temporal.Now.plainDateISO(),
    locales?: Intl.LocalesArgument,
): string {
    const formatter = new Intl.RelativeTimeFormat(locales, { numeric: "auto" });

    const years = date.year - base.year;
    if (years !== 0) {
        return formatter.format(years, "years");
    }

    const months = date.month - base.month;
    if (months !== 0) {
        return formatter.format(months, "months");
    }

    return formatter.format(base.until(date).days, "days");
}
