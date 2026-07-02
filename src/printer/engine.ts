// Money Printer simulation engine. Pure functions over PrinterState so the
// React layer stays a thin shell. One tick ≈ one simulated "hour" of hustle.

import type {
  Draft,
  LedgerEntry,
  LedgerKind,
  LiveProduct,
  PrinterState,
} from "./types";

export const MAX_QUEUE = 5;
export const MAX_LEDGER = 60;
export const MAX_LIVE = 12;

// Pipeline fills this much per tick, slower when the review queue is backed up.
const PIPELINE_RATE = 9;
const QUEUE_DRAG_PER_DRAFT = 1.4;

function uid(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

// —— Draft generation ————————————————————————————————————————————————

const NICHES = [
  "ADHD freelancers",
  "D&D game masters",
  "indie game devs",
  "wedding planners",
  "van-life budgeters",
  "Etsy shop owners",
  "junior data analysts",
  "houseplant collectors",
  "solo podcasters",
  "college RAs",
  "youth soccer coaches",
  "beekeeping hobbyists",
];

const PRODUCT_KINDS = [
  { kind: "Notion OS", platform: "Gumroad", price: [12, 39] as const },
  { kind: "printable planner pack", platform: "Etsy", price: [6, 18] as const },
  { kind: "prompt vault", platform: "Gumroad", price: [9, 29] as const },
  { kind: "spreadsheet toolkit", platform: "Payhip", price: [8, 24] as const },
  { kind: "icon + asset bundle", platform: "itch.io", price: [5, 15] as const },
  { kind: "email course", platform: "Ko-fi", price: [15, 45] as const },
  { kind: "micro-SaaS starter repo", platform: "Lemon Squeezy", price: [19, 59] as const },
];

const ADJECTIVES = ["Ultimate", "Minimal", "Cozy", "Turbo", "Zen", "Feral", "Tactical", "Deluxe"];

const GOOD_NOTES = [
  "QA: passed usability test on first try",
  "Researcher: 8 of 10 competitors are stale listings",
  "QA: copy reads clean, zero trademark hits",
  "Researcher: niche search volume up 3 months straight",
  "Creator: reused proven template from last winner",
  "QA: screenshots render crisp at all sizes",
];

const BAD_NOTES = [
  "QA: 2 broken links found in final PDF",
  "Researcher: niche looks saturated, 40+ near-identical listings",
  "QA: title tone borders on a misleading income claim",
  "Creator: shipped in one pass, no revision cycle",
  "QA: cover art is low-contrast and hard to read",
  "Researcher: could not verify demand — thin data",
];

const RISK_FLAGS = [
  "possible trademark term in title",
  "AI-disclosure tag missing",
  "price 3× above niche median",
  "asset pack overlaps a competitor's look",
];

function pick<T>(arr: readonly T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

export function makeDraft(tick: number, rand: () => number = Math.random): Draft {
  const kind = pick(PRODUCT_KINDS, rand);
  const niche = pick(NICHES, rand);
  const quality = Math.round(15 + rand() * 80); // 15–95
  const priceUsd = Math.round(kind.price[0] + rand() * (kind.price[1] - kind.price[0]));

  // Noisy signals: good drafts mostly get good notes, but not always —
  // that's what makes the human gate an actual judgment call.
  const notes: string[] = [];
  const flags: string[] = [];
  const noteCount = 2 + Math.floor(rand() * 2);
  for (let i = 0; i < noteCount; i++) {
    const truthy = rand() < 0.78; // 22% of signals are misleading
    const positive = truthy ? quality >= 55 : quality < 55;
    const pool = positive ? GOOD_NOTES : BAD_NOTES;
    const note = pick(pool, rand);
    if (!notes.includes(note)) notes.push(note);
  }
  if (quality < 45 && rand() < 0.6) flags.push(pick(RISK_FLAGS, rand));
  else if (rand() < 0.15) flags.push(pick(RISK_FLAGS, rand)); // false-positive flag

  return {
    id: uid(),
    name: `${pick(ADJECTIVES, rand)} ${kind.kind} for ${niche}`,
    niche,
    platform: kind.platform,
    priceUsd,
    quality,
    flags,
    notes,
    createdAtTick: tick,
  };
}

// —— State ———————————————————————————————————————————————————————————

export function initialState(): PrinterState {
  return {
    version: 1,
    running: false,
    tick: 0,
    cashCents: 0,
    lifetimeCents: 0,
    reputation: 1,
    pipelineProgress: 0,
    stats: {
      approved: 0,
      rejected: 0,
      goodApprovals: 0,
      badApprovals: 0,
      goodRejections: 0,
      badRejections: 0,
      sales: 0,
      refunds: 0,
      takedowns: 0,
    },
    queue: [makeDraft(0)],
    live: [],
    ledger: [
      entry(0, "info", "Printer online. Agents are drafting — you hold the approve stamp."),
    ],
  };
}

function entry(tick: number, kind: LedgerKind, text: string, amountCents?: number): LedgerEntry {
  return { id: uid(), tick, kind, text, amountCents };
}

function pushLedger(ledger: LedgerEntry[], e: LedgerEntry): LedgerEntry[] {
  return [e, ...ledger].slice(0, MAX_LEDGER);
}

function clampReputation(r: number): number {
  return Math.min(2, Math.max(0.25, Math.round(r * 100) / 100));
}

// —— Tick ————————————————————————————————————————————————————————————

export function stepTick(state: PrinterState, rand: () => number = Math.random): PrinterState {
  if (!state.running) return state;

  const tick = state.tick + 1;
  let { pipelineProgress, cashCents, lifetimeCents, reputation } = state;
  let ledger = state.ledger;
  let queue = state.queue;
  let live = state.live;
  const stats = { ...state.stats };

  // 1. Agents grind the pipeline; a full bar produces a draft for review.
  if (queue.length < MAX_QUEUE) {
    pipelineProgress += PIPELINE_RATE - queue.length * QUEUE_DRAG_PER_DRAFT + rand() * 4;
    if (pipelineProgress >= 100) {
      pipelineProgress = 0;
      const draft = makeDraft(tick, rand);
      queue = [...queue, draft];
      ledger = pushLedger(ledger, entry(tick, "info", `Agents delivered “${draft.name}” for your review.`));
    }
  } else {
    ledger =
      rand() < 0.08
        ? pushLedger(ledger, entry(tick, "warn", "Review queue full — agents are idling. Approve or reject something."))
        : ledger;
  }

  // 2. Live products sell (or misfire) based on hidden quality × reputation.
  // Clone before updating — the incoming objects are still referenced by React state.
  live = live.map((prev) => {
    const p = { ...prev };
    const saleChance = (p.quality / 100) * 0.32 * reputation;
    if (rand() < saleChance) {
      const gross = p.priceUsd * 100;
      const net = Math.round(gross * 0.9); // platform fee
      p.sales += 1;
      p.revenueCents += net;
      cashCents += net;
      lifetimeCents += net;
      stats.sales += 1;
      ledger = pushLedger(ledger, entry(tick, "sale", `Sale: “${p.name}” on ${p.platform}`, net));
    } else if (p.quality < 45 && rand() < 0.05) {
      const loss = Math.round(p.priceUsd * 100 * 0.9);
      p.refunds += 1;
      cashCents -= loss;
      stats.refunds += 1;
      reputation = clampReputation(reputation - 0.04);
      ledger = pushLedger(ledger, entry(tick, "refund", `Refund: “${p.name}” — buyer says it's half-baked.`, -loss));
    }
    return p;
  });

  // 3. Very bad products occasionally get taken down by the platform.
  const takedownIdx = live.findIndex((p) => p.quality < 30 && rand() < 0.03);
  if (takedownIdx >= 0) {
    const dead = live[takedownIdx];
    live = live.filter((_, i) => i !== takedownIdx);
    stats.takedowns += 1;
    reputation = clampReputation(reputation - 0.15);
    ledger = pushLedger(
      ledger,
      entry(tick, "takedown", `Takedown: ${dead.platform} pulled “${dead.name}” for quality violations. Reputation hit.`),
    );
  }

  // 4. Occasional flavor for healthy shops.
  if (live.length > 0 && rand() < 0.03) {
    const best = [...live].sort((a, b) => b.quality - a.quality)[0];
    if (best.quality >= 70) {
      reputation = clampReputation(reputation + 0.02);
      ledger = pushLedger(ledger, entry(tick, "praise", `5★ review on “${best.name}” — reputation climbing.`));
    }
  }

  return {
    ...state,
    tick,
    pipelineProgress,
    cashCents,
    lifetimeCents,
    reputation,
    stats,
    queue,
    live,
    ledger,
  };
}

// —— Human gate decisions ————————————————————————————————————————————

export function approveDraft(state: PrinterState, draftId: string): PrinterState {
  const draft = state.queue.find((d) => d.id === draftId);
  if (!draft) return state;

  const stats = { ...state.stats, approved: state.stats.approved + 1 };
  let reputation = state.reputation;
  if (draft.quality >= 55) {
    stats.goodApprovals += 1;
    reputation = clampReputation(reputation + 0.05);
  } else {
    stats.badApprovals += 1;
    reputation = clampReputation(reputation - 0.08);
  }

  const product: LiveProduct = {
    id: draft.id,
    name: draft.name,
    niche: draft.niche,
    platform: draft.platform,
    priceUsd: draft.priceUsd,
    quality: draft.quality,
    launchedAtTick: state.tick,
    sales: 0,
    refunds: 0,
    revenueCents: 0,
  };

  // Shelf space is finite: launching past the cap retires the weakest earner.
  let live = [product, ...state.live];
  let ledger = pushLedger(
    state.ledger,
    entry(state.tick, "launch", `You approved “${draft.name}” — live on ${draft.platform} at $${draft.priceUsd}.`),
  );
  if (live.length > MAX_LIVE) {
    const retired = [...live].sort((a, b) => a.revenueCents - b.revenueCents)[0];
    live = live.filter((p) => p.id !== retired.id);
    ledger = pushLedger(ledger, entry(state.tick, "info", `Retired “${retired.name}” to make shelf space.`));
  }

  return {
    ...state,
    reputation,
    stats,
    queue: state.queue.filter((d) => d.id !== draftId),
    live,
    ledger,
  };
}

export function rejectDraft(state: PrinterState, draftId: string): PrinterState {
  const draft = state.queue.find((d) => d.id === draftId);
  if (!draft) return state;

  const stats = { ...state.stats, rejected: state.stats.rejected + 1 };
  let reputation = state.reputation;
  let text: string;
  if (draft.quality < 55) {
    stats.goodRejections += 1;
    reputation = clampReputation(reputation + 0.03);
    text = `You rejected “${draft.name}” — good call, that one was trouble.`;
  } else {
    stats.badRejections += 1;
    text = `You rejected “${draft.name}”. (It was actually solid — the gate cuts both ways.)`;
  }

  return {
    ...state,
    reputation,
    stats,
    queue: state.queue.filter((d) => d.id !== draftId),
    ledger: pushLedger(state.ledger, entry(state.tick, "reject", text)),
  };
}

// —— Formatting helpers ——————————————————————————————————————————————

export function formatCents(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  return `${sign}$${(abs / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function gateAccuracy(stats: PrinterState["stats"]): number | null {
  const decided = stats.approved + stats.rejected;
  if (decided === 0) return null;
  return Math.round(((stats.goodApprovals + stats.goodRejections) / decided) * 100);
}
