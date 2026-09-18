import type { Category, SpecialTile, Tile, TileKind } from "../game/types";
import boardJson from "./content/board.json";
import categoriesJson from "./content/categories.json";
import { parseCategories, parseRoute } from "./parse/parse-board";

export const CATEGORIES = parseCategories(categoriesJson);

const TILE_KINDS = Object.keys(CATEGORIES) as TileKind[];
const SPECIAL: readonly TileKind[] = ["gajian", "kejutan"] satisfies SpecialTile[];

export const CATEGORY_IDS = TILE_KINDS.filter(
  (kind): kind is Category => !SPECIAL.includes(kind),
);

export const BOARD: Tile[] = parseRoute(boardJson, TILE_KINDS).map((category) => ({
  category,
  ...CATEGORIES[category],
}));
