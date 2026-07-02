// Money Printer — domain types.
// A human-in-the-loop revenue simulator: agents draft products, nothing ships
// (or earns) until the human approves it at the review gate.

export type LedgerKind =
  | "sale"
  | "refund"
  | "launch"
  | "reject"
  | "takedown"
  | "praise"
  | "warn"
  | "info";

export interface LedgerEntry {
  id: string;
  tick: number;
  kind: LedgerKind;
  text: string;
  amountCents?: number;
}

/** A product draft waiting at the human review gate. Quality is hidden from the UI. */
export interface Draft {
  id: string;
  name: string;
  niche: string;
  platform: string;
  priceUsd: number;
  /** Hidden 0–100 score. The QA flags/notes below are noisy signals of it. */
  quality: number;
  flags: string[];
  notes: string[];
  createdAtTick: number;
}

export interface LiveProduct {
  id: string;
  name: string;
  niche: string;
  platform: string;
  priceUsd: number;
  quality: number;
  launchedAtTick: number;
  sales: number;
  refunds: number;
  revenueCents: number;
}

export interface PrinterStats {
  approved: number;
  rejected: number;
  goodApprovals: number;
  badApprovals: number;
  goodRejections: number;
  badRejections: number;
  sales: number;
  refunds: number;
  takedowns: number;
}

export interface PrinterState {
  version: 1;
  running: boolean;
  tick: number;
  cashCents: number;
  lifetimeCents: number;
  /** Revenue multiplier, 0.25–2.0. Moves with the quality of your gate decisions. */
  reputation: number;
  /** 0–100. Fills while agents work; a full bar yields a new draft for review. */
  pipelineProgress: number;
  stats: PrinterStats;
  queue: Draft[];
  live: LiveProduct[];
  ledger: LedgerEntry[];
}
