import { STATS } from "../../game/stats";
import type { Ending, EndingRule, Endings } from "../../game/types";
import { DataError } from "./data-error";
import { expectArray, expectInteger, expectOneOf, expectRecord, expectText } from "./primitives";

const TESTS = ["below", "atMost", "atLeast"] as const;

function parseEnding(value: unknown, path: string): Ending {
  const fields = expectRecord(value, path);
  return {
    title: expectText(fields.title, `${path}.title`),
    text: expectText(fields.text, `${path}.text`),
  };
}

function parseRule(value: unknown, path: string): EndingRule {
  const when = expectRecord(expectRecord(value, path).when, `${path}.when`);
  const tests = TESTS.filter((test) => test in when);
  if (tests.length !== 1)
    throw new DataError(`${path}.when`, `use exactly one of ${TESTS.join(", ")}`);
  const [test] = tests;
  return {
    stat: expectOneOf(when.stat, STATS, `${path}.when.stat`),
    test,
    threshold: expectInteger(when[test], `${path}.when.${test}`),
    ...parseEnding(value, path),
  };
}

export function parseEndings(json: unknown): Endings {
  const file = "endings.json";
  const fields = expectRecord(json, file);
  return {
    rules: expectArray(fields.rules, `${file} › rules`).map((rule, i) =>
      parseRule(rule, `${file} › rules[${i}]`),
    ),
    fallback: parseEnding(fields.fallback, `${file} › fallback`),
  };
}
