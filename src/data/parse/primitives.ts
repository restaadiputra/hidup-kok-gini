import { DataError } from "./data-error";

export type Fields = Record<string, unknown>;

export function expectRecord(value: unknown, path: string): Fields {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    throw new DataError(path, "expected an object");
  return value as Fields;
}

export function expectArray(value: unknown, path: string): unknown[] {
  if (!Array.isArray(value)) throw new DataError(path, "expected a list");
  return value;
}

export function expectText(value: unknown, path: string): string {
  if (typeof value !== "string" || !value.trim())
    throw new DataError(path, "expected non-empty text");
  return value;
}

export function expectInteger(value: unknown, path: string): number {
  if (!Number.isInteger(value)) throw new DataError(path, "expected a whole number");
  return value as number;
}

export function expectFraction(value: unknown, path: string): number {
  if (typeof value !== "number" || !(value >= 0 && value <= 1))
    throw new DataError(path, "expected a number between 0 and 1");
  return value;
}

export function expectOneOf<T extends string>(
  value: unknown,
  options: readonly T[],
  path: string,
): T {
  const match = options.find((option) => option === value);
  if (match === undefined)
    throw new DataError(path, `expected one of ${options.join(", ")}, got ${JSON.stringify(value)}`);
  return match;
}

export function expectTextList(value: unknown, path: string, length?: number): string[] {
  const list = expectArray(value, path);
  if (length !== undefined && list.length !== length)
    throw new DataError(path, `expected ${length} entries, got ${list.length}`);
  return list.map((item, i) => expectText(item, `${path}[${i}]`));
}
