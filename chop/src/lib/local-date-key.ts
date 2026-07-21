import { format } from "date-fns";

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Create a calendar-day key in the viewer's local time zone. */
export function getLocalDateKey(value: string): string {
  if (DATE_ONLY_PATTERN.test(value)) return value;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  return format(date, "yyyy-MM-dd");
}
