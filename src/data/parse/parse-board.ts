import type { SpecialTile, TileKind, TileMeta } from "../../game/types";
import { DataError } from "./data-error";
import { expectArray, expectOneOf, expectRecord, expectText } from "./primitives";

const SPECIAL_TILES: SpecialTile[] = ["gajian", "kejutan"];
// board.tsx lays the route out as the outer ring of a 5×5 grid.
const ROUTE_LENGTH = 16;

export function parseCategories(json: Record<TileKind, unknown>): Record<TileKind, TileMeta> {
  const file = "categories.json";
  const fields = expectRecord(json, file);
  for (const special of SPECIAL_TILES)
    if (!(special in fields)) throw new DataError(file, `missing the special tile "${special}"`);
  const categories = {} as Record<TileKind, TileMeta>;
  for (const kind of Object.keys(json) as TileKind[]) {
    const meta = expectRecord(fields[kind], `${file} › ${kind}`);
    categories[kind] = {
      label: expectText(meta.label, `${file} › ${kind}.label`),
      icon: expectText(meta.icon, `${file} › ${kind}.icon`),
      color: expectText(meta.color, `${file} › ${kind}.color`),
    };
  }
  return categories;
}

export function parseRoute(json: unknown, kinds: readonly TileKind[]): TileKind[] {
  const file = "board.json";
  const route = expectArray(expectRecord(json, file).route, `${file} › route`).map((kind, i) =>
    expectOneOf(kind, kinds, `${file} › route[${i}]`),
  );
  if (route.length !== ROUTE_LENGTH)
    throw new DataError(`${file} › route`, `expected ${ROUTE_LENGTH} tiles, got ${route.length}`);
  if (route[0] !== "gajian")
    throw new DataError(`${file} › route[0]`, "the route must start on gajian, where salary is paid");
  return route;
}
