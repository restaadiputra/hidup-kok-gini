import { BOUNDED_STATS } from "../../game/stats";
import { AUTOMATIC_STATUS_IDS } from "../../game/status-ids";
import type { StatusCatalog, StatusDef, StatusTrigger } from "../../game/types";
import { DataError } from "./data-error";
import { parseEffects } from "./parse-effects";
import { expectInteger, expectOneOf, expectRecord, expectText } from "./primitives";

function parseTrigger(value: unknown, path: string): StatusTrigger {
  const fields = expectRecord(value, path);
  if (fields.stat === "hutang") return { stat: "hutang", above: expectInteger(fields.above, `${path}.above`) };
  const stat = expectOneOf(fields.stat, BOUNDED_STATS, `${path}.stat`);
  const atMost = expectInteger(fields.atMost, `${path}.atMost`);
  const clearAbove = expectInteger(fields.clearAbove, `${path}.clearAbove`);
  if (clearAbove < atMost) throw new DataError(path, "clearAbove must be at least atMost");
  return { stat, atMost, clearAbove };
}

function parseStatus(id: string, value: unknown, path: string): StatusDef {
  const fields = expectRecord(value, path);
  const months = fields.months === undefined || fields.months === null ? null : expectInteger(fields.months, `${path}.months`);
  if (months !== null && months < 1) throw new DataError(`${path}.months`, "expected at least 1");
  const trigger = fields.trigger === undefined ? null : parseTrigger(fields.trigger, `${path}.trigger`);
  if (trigger && months !== null) throw new DataError(path, "an automatic status ends by its trigger, not by months");
  return {
    id,
    label: expectText(fields.label, `${path}.label`),
    icon: expectText(fields.icon, `${path}.icon`),
    months,
    payday: fields.payday === undefined ? {} : parseEffects(fields.payday, `${path}.payday`),
    trigger,
  };
}

export function parseStatuses(json: unknown): StatusCatalog {
  const file = "statuses.json";
  const catalog: StatusCatalog = {};
  for (const [id, value] of Object.entries(expectRecord(json, file))) catalog[id] = parseStatus(id, value, `${file} › ${id}`);
  for (const id of AUTOMATIC_STATUS_IDS)
    if (!catalog[id]?.trigger) throw new DataError(`${file} › ${id}`, "this automatic status must exist and have a trigger");
  return catalog;
}
