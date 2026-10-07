/**
 * Laravel serializes `date` casts as ISO 8601 (e.g. "2026-11-01T00:00:00.000000Z").
 * This parses the date-only portion into a LOCAL Date so formatting never
 * depends on the client timezone (avoids UTC offsets shifting the displayed day).
 */
export function parseDateOnly(value: string | Date): Date {
    if (value instanceof Date) {
        return value;
    }
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(
        typeof value === "string" ? value.slice(0, 10) : "",
    );
    if (!match) {
        throw new RangeError(`Invalid date value: ${value}`);
    }
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}