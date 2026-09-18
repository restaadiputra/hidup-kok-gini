import { expectRecord, expectTextList } from "./primitives";

const MONTHS_IN_YEAR = 12;

export function parseCalendar(json: unknown): { months: string[]; monthlyNotes: string[] } {
  const file = "calendar.json";
  const fields = expectRecord(json, file);
  return {
    months: expectTextList(fields.months, `${file} › months`, MONTHS_IN_YEAR),
    monthlyNotes: expectTextList(fields.monthlyNotes, `${file} › monthlyNotes`, MONTHS_IN_YEAR),
  };
}
