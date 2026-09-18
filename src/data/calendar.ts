import calendarJson from "./content/calendar.json";
import { parseCalendar } from "./parse/parse-calendar";

const calendar = parseCalendar(calendarJson);

export const MONTHS = calendar.months;
export const MONTHLY_NOTES = calendar.monthlyNotes;
export const TOTAL_MONTHS = MONTHS.length;
