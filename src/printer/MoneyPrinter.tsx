import { useEffect, useRef, useState } from "react";
import { useLocalStorage } from "../product/useLocalStorage";
import {
  MAX_QUEUE,
  approveDraft,
  formatCents,
  gateAccuracy,
  initialState,
  rejectDraft,
  stepTick,
} from "./engine";
import type { Draft, LedgerEntry, LiveProduct, PrinterState } from "./types";
import "./printer.css";

const TICK_MS = { slow: 2200, normal: 1200, fast: 500 } as const;
type Speed = keyof typeof TICK_MS;

const KIND_ICON: Record<LedgerEntry["kind"], string> = {
  sale: "💸",
  refund: "↩",
  launch: "🚀",
  reject: "🗑",
  takedown: "⛔",
  praise: "★",
  warn: "⚠",
  info: "·",
};

function DraftCard({
  draft,
  onApprove,
  onReject,
}: {
  draft: Draft;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <article className="mp-draft">
      <header className="mp-draft-head">
        <h4>{draft.name}</h4>
        <span className="mp-draft-price">${draft.priceUsd}</span>
      </header>
      <p className="mp-draft-meta">
        {draft.platform} · {draft.niche}
      </p>
      <ul className="mp-draft-notes">
        {draft.notes.map((n) => (
          <li key={n}>{n}</li>
        ))}
      </ul>
      {draft.flags.length > 0 && (
        <div className="mp-draft-flags">
          {draft.flags.map((f) => (
            <span key={f} className="mp-flag">
              ⚠ {f}
            </span>
          ))}
        </div>
      )}
      <div className="mp-draft-actions">
        <button type="button" className="mp-btn mp-btn--approve" onClick={onApprove}>
          ✓ Approve & publish
        </button>
        <button type="button" className="mp-btn mp-btn--reject" onClick={onReject}>
          ✕ Reject
        </button>
      </div>
    </article>
  );
}

function ProductRow({ p, tick }: { p: LiveProduct; tick: number }) {
  return (
    <div className="mp-product">
      <div className="mp-product-main">
        <strong>{p.name}</strong>
        <span className="mp-product-meta">
          {p.platform} · ${p.priceUsd} · live {tick - p.launchedAtTick}h
        </span>
      </div>
      <div className="mp-product-nums">
        <span className="mp-product-sales">{p.sales} sold</span>
        <span className="mp-product-rev">{formatCents(p.revenueCents)}</span>
      </div>
    </div>
  );
}

export default function MoneyPrinter() {
  const [state, setState] = useLocalStorage<PrinterState>("money-printer-v1", initialState());
  const [speed, setSpeed] = useState<Speed>("normal");
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    if (!state.running) return;
    const id = window.setInterval(() => {
      setState(stepTick(stateRef.current));
    }, TICK_MS[speed]);
    return () => window.clearInterval(id);
  }, [state.running, speed, setState]);

  const accuracy = gateAccuracy(state.stats);
  const queueFull = state.queue.length >= MAX_QUEUE;

  return (
    <div className="mp">
      <section className="mp-header panel">
        <div className="mp-title-row">
          <div>
            <h2>Human-in-the-Loop Money Printer</h2>
            <p className="section-intro mp-intro">
              Agents research, draft, and QA products around the clock — but nothing goes live until{" "}
              <strong>you</strong> stamp it at the review gate. QA notes are noisy and sometimes wrong. Approve junk
              and refunds, takedowns, and reputation damage eat your margins. Reject winners and you print nothing.
            </p>
          </div>
          <div className="mp-controls">
            <button
              type="button"
              className={`mp-btn ${state.running ? "mp-btn--pause" : "mp-btn--run"}`}
              onClick={() => setState({ ...state, running: !state.running })}
            >
              {state.running ? "❚❚ Pause printer" : "▶ Start printer"}
            </button>
            <select value={speed} onChange={(e) => setSpeed(e.target.value as Speed)} aria-label="Simulation speed">
              <option value="slow">Slow</option>
              <option value="normal">Normal</option>
              <option value="fast">Fast</option>
            </select>
            <button
              type="button"
              className="mp-btn mp-btn--ghost"
              onClick={() => {
                if (window.confirm("Reset the printer? All cash, products, and history are wiped.")) {
                  setState(initialState());
                }
              }}
            >
              Reset
            </button>
          </div>
        </div>

        <div className="mp-stats">
          <div className="mp-stat">
            <span className="mp-stat-label">Cash</span>
            <span className={`mp-stat-value ${state.cashCents < 0 ? "mp-neg" : ""}`}>
              {formatCents(state.cashCents)}
            </span>
          </div>
          <div className="mp-stat">
            <span className="mp-stat-label">Lifetime printed</span>
            <span className="mp-stat-value">{formatCents(state.lifetimeCents)}</span>
          </div>
          <div className="mp-stat">
            <span className="mp-stat-label">Reputation ×</span>
            <span className="mp-stat-value">{state.reputation.toFixed(2)}</span>
          </div>
          <div className="mp-stat">
            <span className="mp-stat-label">Gate accuracy</span>
            <span className="mp-stat-value">{accuracy === null ? "—" : `${accuracy}%`}</span>
          </div>
          <div className="mp-stat">
            <span className="mp-stat-label">Hours run</span>
            <span className="mp-stat-value">{state.tick}</span>
          </div>
        </div>
      </section>

      <div className="mp-grid">
        <section className="panel mp-col">
          <h3 className="mp-col-title">
            1 · Agent pipeline
            <span className={`mp-live-dot ${state.running ? "mp-live-dot--on" : ""}`} />
          </h3>
          <div className="mp-pipeline">
            {["Researcher", "Creator", "QA"].map((agent, i) => (
              <div key={agent} className="mp-pipe-stage">
                <span className="mp-pipe-name">{agent}</span>
                <div className="mp-pipe-bar">
                  <div
                    className="mp-pipe-fill"
                    style={{
                      width: `${Math.min(100, Math.max(0, state.pipelineProgress * 3 - i * 100))}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="mp-pipe-note">
            {queueFull
              ? "Queue full — agents idle until you clear the gate."
              : state.running
                ? "Agents grinding. Next draft lands when QA completes."
                : "Printer paused. Press start to put the agents to work."}
          </p>

          <h3 className="mp-col-title mp-col-title--gap">
            2 · Your review gate <span className="mp-queue-count">{state.queue.length} waiting</span>
          </h3>
          {state.queue.length === 0 ? (
            <p className="mp-empty">Gate is clear. Drafts appear here as agents finish them.</p>
          ) : (
            <div className="mp-queue">
              {state.queue.map((d) => (
                <DraftCard
                  key={d.id}
                  draft={d}
                  onApprove={() => setState(approveDraft(stateRef.current, d.id))}
                  onReject={() => setState(rejectDraft(stateRef.current, d.id))}
                />
              ))}
            </div>
          )}
        </section>

        <section className="panel mp-col">
          <h3 className="mp-col-title">3 · Live shelf ({state.live.length})</h3>
          {state.live.length === 0 ? (
            <p className="mp-empty">Nothing live yet. Approve a draft to start printing.</p>
          ) : (
            <div className="mp-shelf">
              {[...state.live]
                .sort((a, b) => b.revenueCents - a.revenueCents)
                .map((p) => (
                  <ProductRow key={p.id} p={p} tick={state.tick} />
                ))}
            </div>
          )}

          <h3 className="mp-col-title mp-col-title--gap">4 · Ledger</h3>
          <div className="mp-ledger">
            {state.ledger.map((e) => (
              <div key={e.id} className={`mp-ledger-row mp-ledger-row--${e.kind}`}>
                <span className="mp-ledger-icon">{KIND_ICON[e.kind]}</span>
                <span className="mp-ledger-text">{e.text}</span>
                {e.amountCents !== undefined && (
                  <span className={`mp-ledger-amt ${e.amountCents < 0 ? "mp-neg" : "mp-pos"}`}>
                    {formatCents(e.amountCents)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      <p className="mp-fineprint">
        Simulation, not a brokerage. It models the thesis of this whole map: automation does the volume, the
        human-in-the-loop gate protects the margin. Decision stats — {state.stats.goodApprovals} good approvals,{" "}
        {state.stats.badApprovals} junk shipped, {state.stats.goodRejections} dodged bullets,{" "}
        {state.stats.badRejections} winners binned, {state.stats.takedowns} takedowns.
      </p>
    </div>
  );
}
