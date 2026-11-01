/** Validates raw date data, returning `undefined` when it does not describe a real calendar date. */
export function toPlainDate(value?: Temporal.PlainDateLike | null): Temporal.PlainDate | undefined {
    if (value === undefined || value === null) return undefined;
    try {
        return Temporal.PlainDate.from(value, { overflow: "reject" });
    } catch {
        return undefined;
    }
}
