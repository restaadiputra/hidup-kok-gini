// The tile vocabulary is defined by the content itself: every key in
// categories.json is a tile kind, and all but the two special tiles are card decks.
export type TileKind = keyof typeof import("../data/content/categories.json");
export type SpecialTile = "gajian" | "kejutan";
export type Category = Exclude<TileKind, SpecialTile>;
export type SpecialDeck = "krisis" | "debt-collector";
export type DeckId = Category | SpecialDeck | "gajian";
export type Crisis = "burnout" | "apes";
export interface TileMeta {
  label: string;
  icon: string;
  color: string;
}
export type Stat = "dompet" | "kewarasan" | "relasi" | "hoki" | "hutang";
export type BoundedStat = "kewarasan" | "relasi" | "hoki";
export type MoneyStat = "dompet" | "hutang";
export type Stats = Record<Stat, number>;
export type StatRequirement = Partial<Record<BoundedStat, number>>;
export type EffectTarget = "self" | "all" | "others";
export type StatusTrigger =
  | { stat: BoundedStat; atMost: number; clearAbove: number }
  | { stat: "hutang"; above: number };
export interface StatusDef {
  id: string;
  label: string;
  icon: string;
  months: number | null;
  payday: Partial<Stats>;
  trigger: StatusTrigger | null;
}
export type StatusCatalog = Record<string, StatusDef>;
export interface ActiveStatus {
  id: string;
  untilMonth: number | null;
}
export interface StatusEffect {
  status: string;
  effects: Partial<Stats>;
}
export interface Choice {
  label: string;
  effects: Partial<Stats>;
  result: string;
  requires: StatRequirement;
  requiresStatus: string | null;
  blockedByStatus: string | null;
  gains: string[];
  clears: string[];
  tags: string[];
  target?: EffectTarget;
}
export interface EventCard {
  id: string;
  category: DeckId;
  title: string;
  description: string;
  choices: Choice[];
  requiresStatus: string | null;
  crisis: Crisis | null;
  /** Broad content theme used to avoid consecutive joke beats. */
  theme: string;
}
export interface Tile extends TileMeta {
  category: TileKind;
}
export interface MoneyRange {
  min: number;
  max: number;
  step: number;
}
export interface DebtRules {
  feeRate: number;
  interestRate: number;
  installmentMax: number;
  collectorChance: number;
}
export interface Economy {
  salary: MoneyRange;
  livingCost: MoneyRange;
  deduction: MoneyRange;
  rareChance: number;
  rareBill: MoneyRange;
  debt: DebtRules;
}
export interface PaydayReasons {
  common: string[];
  rare: string[];
}
export interface Ending {
  title: string;
  text: string;
}
export interface EndingRule extends Ending {
  stat: Stat;
  test: "below" | "atMost" | "atLeast";
  threshold: number;
}
export interface Endings {
  rules: EndingRule[];
  fallback: Ending;
}
export interface Player {
  id: number;
  name: string;
  position: number;
  stats: Stats;
  statuses: ActiveStatus[];
}
export type Phase = "ready" | "payday" | "payday-event" | "event" | "resolved" | "finished";
export interface Paycheck {
  salary: number;
  livingCost: number;
  deduction: number;
  reason: string;
  rare: boolean;
  net: number;
  statusEffects: StatusEffect[];
  interest: number;
  installment: number;
}
export interface GameState {
  players: Player[];
  currentPlayer: number;
  month: number;
  phase: Phase;
  rng: number;
  dice: number | null;
  eventId: string | null;
  choiceEffects: Partial<Stats>[];
  drawn: string[];
  recentThemes?: string[];
  suddenEventSeen?: boolean;
  resolution: string;
  lastEffects: Partial<Stats>;
  payday: boolean;
  paydayDetails: Paycheck | null;
  monthPaychecks?: Array<{ playerId: number; paycheck: Paycheck }>;
  paydayPlayer?: number;
  paydayChoiceEffects?: Partial<Stats>[];
  paydayEventId?: string | null;
  pendingPosition: number | null;
  log: string[];
  turn: number;
}
export type Action =
  | { type: "ROLL" }
  | { type: "CONTINUE_PAYDAY" }
  | { type: "PAYDAY_CHOOSE"; index: number }
  | { type: "CHOOSE"; index: number }
  | { type: "NEXT" };
export interface Session {
  version: 7;
  names: string[];
  seed: number;
  actions: Action[];
}
