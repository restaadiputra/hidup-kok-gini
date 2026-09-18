import endingsJson from "./content/endings.json";
import { parseEndings } from "./parse/parse-endings";

export const ENDINGS = parseEndings(endingsJson);
