import statusesJson from "./content/statuses.json";
import { parseStatuses } from "./parse/parse-statuses";

export const STATUSES = parseStatuses(statusesJson);
