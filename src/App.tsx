import { useMemo, useState } from "react";
import PromptForge from "./product/PromptForge";
import MoneyPrinter from "./printer/MoneyPrinter";
import PitchTab from "./PitchTab";
import { OPPORTUNITIES } from "./data/opportunities";
import { BUSINESS_PLANS, getPlanByOpportunityId } from "./data/businessPlans";
import {
  HUMAN_GATES,
  LAUNCH_PHASES,
  OPENSERV_AGENTS,
  SCALE_TRIGGERS,
  TOOL_STACK,
} from "./data/openserv";
import {
  CATEGORY_LABELS,
  LABEL_META,
  formatUsdRange,
  type Opportunity,
  type OpportunityCategory,
  type OpportunityLabel,
} from "./types";

type Tab = "promptforge" | "printer" | "explorer" | "plans" | "openserv" | "launch" | "pitch";
type SortKey = "score" | "rev30" | "rev90" | "speed" | "automation";

const ALL_CATEGORIES = Object.keys(CATEGORY_LABELS) as OpportunityCategory[];
const ALL_LABELS = Object.keys(LABEL_META) as OpportunityLabel[];

function avgMid([lo, hi]: [number, number]): number {
  return (lo + hi) / 2;
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="stat">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
      {sub && <span className="stat-sub">{sub}</span>}
    </div>
  );
}

function ScoreBar({ value, max = 100 }: { value: number; max?: number }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="score-bar">
      <div className="score-bar-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}

function OpportunityCard({
  opp,
  selected,
  onSelect,
}: {
  opp: Opportunity;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={`opp-card ${selected ? "opp-card--selected" : ""}`}
      onClick={onSelect}
    >
      <div className="opp-card-top">
        <span className="opp-score">{opp.overallScore}</span>
        <div className="opp-card-meta">
          <span className="opp-category">{CATEGORY_LABELS[opp.category]}</span>
          {opp.topPlan && <span className="opp-badge">Top plan</span>}
        </div>
      </div>
      <h3 className="opp-name">{opp.name}</h3>
      <p className="opp-platform">{opp.platform}</p>
      <div className="opp-metrics">
        <span>30d {formatUsdRange(opp.revenue30DayUsd)}</span>
        <span>{opp.firstDollarDays}d to $1</span>
      </div>
      <div className="opp-labels">
        {opp.labels.slice(0, 3).map((l) => (
          <span key={l} className="label-chip">
            {LABEL_META[l]}
          </span>
        ))}
      </div>
    </button>
  );
}

function DetailPanel({ opp, onClose }: { opp: Opportunity; onClose: () => void }) {
  const plan = getPlanByOpportunityId(opp.id);

  return (
    <aside className="detail-panel">
      <div className="detail-header">
        <div>
          <span className="detail-category">{CATEGORY_LABELS[opp.category]}</span>
          <h2>{opp.name}</h2>
          <a href={opp.platformUrl} target="_blank" rel="noreferrer" className="detail-link">
            {opp.platform} ↗
          </a>
        </div>
        <button type="button" className="close-btn" onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>

      <div className="detail-score-row">
        <div className="detail-score">
          <span className="detail-score-num">{opp.overallScore}</span>
          <span className="detail-score-label">Overall score</span>
        </div>
        <div className="detail-bars">
          <div className="bar-row">
            <span>Automation</span>
            <ScoreBar value={opp.automationScore * 10} max={100} />
            <span>{opp.automationScore}/10</span>
          </div>
          <div className="bar-row">
            <span>Compounding</span>
            <ScoreBar value={opp.compoundingScore * 10} max={100} />
            <span>{opp.compoundingScore}/10</span>
          </div>
          <div className="bar-row">
            <span>Low friction</span>
            <ScoreBar value={(11 - opp.frictionScore) * 10} max={100} />
            <span>{11 - opp.frictionScore}/10</span>
          </div>
        </div>
      </div>

      <section className="detail-section">
        <h4>ROI estimate (lean: 5–10 hr/wk)</h4>
        <div className="roi-grid">
          <div className="roi-cell">
            <span>30-day</span>
            <strong>{formatUsdRange(opp.revenue30DayUsd)}</strong>
          </div>
          <div className="roi-cell">
            <span>90-day</span>
            <strong>{formatUsdRange(opp.revenue90DayUsd)}</strong>
          </div>
          <div className="roi-cell">
            <span>First $</span>
            <strong>{opp.firstDollarDays} days</strong>
          </div>
          <div className="roi-cell">
            <span>Probability</span>
            <strong>{opp.firstDollarProbPct}%</strong>
          </div>
          <div className="roi-cell">
            <span>Startup</span>
            <strong>${opp.startupCostUsd}</strong>
          </div>
          <div className="roi-cell">
            <span>Platform fee</span>
            <strong>{opp.platformFeePct}%</strong>
          </div>
        </div>
      </section>

      <section className="detail-section">
        <h4>What you upload</h4>
        <p>{opp.whatYouUpload}</p>
      </section>

      <section className="detail-section">
        <h4>Description</h4>
        <p>{opp.description}</p>
      </section>

      <section className="detail-section">
        <h4>Automation stack</h4>
        <ul>
          {opp.automationStack.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </section>

      <section className="detail-section">
        <h4>Human review gates</h4>
        <ul>
          {opp.humanReviewPoints.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </section>

      <section className="detail-section">
        <h4>Labels</h4>
        <div className="opp-labels">
          {opp.labels.map((l) => (
            <span key={l} className="label-chip">
              {LABEL_META[l]}
            </span>
          ))}
        </div>
      </section>

      {plan && (
        <section className="detail-section detail-plan">
          <h4>Business plan preview</h4>
          <p className="plan-tagline">{plan.tagline}</p>
          <p>{plan.productConcept}</p>
          <p>
            <strong>Pricing:</strong> {plan.pricing}
          </p>
        </section>
      )}
    </aside>
  );
}

function BusinessPlanCard({ opportunityId }: { opportunityId: string }) {
  const plan = getPlanByOpportunityId(opportunityId);
  const opp = OPPORTUNITIES.find((o) => o.id === opportunityId);
  const [open, setOpen] = useState(false);

  if (!plan || !opp) return null;

  return (
    <article className="plan-card">
      <button type="button" className="plan-card-head" onClick={() => setOpen(!open)}>
        <div>
          <span className="plan-score">{opp.overallScore}</span>
          <h3>{opp.name}</h3>
          <p className="plan-tagline">{plan.tagline}</p>
        </div>
        <span className="plan-toggle">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="plan-body">
          <div className="plan-block">
            <h4>Product</h4>
            <p>{plan.productConcept}</p>
          </div>
          <div className="plan-block">
            <h4>Target buyer</h4>
            <p>{plan.targetBuyer}</p>
          </div>
          <div className="plan-grid">
            <div>
              <h4>Pricing</h4>
              <p>{plan.pricing}</p>
            </div>
            <div>
              <h4>Costs</h4>
              <p>{plan.expectedCosts}</p>
            </div>
          </div>
          <div className="plan-block">
            <h4>Automation workflow</h4>
            <ol>
              {plan.automationWorkflow.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          </div>
          <div className="plan-block">
            <h4>Human gates</h4>
            <ul>
              {plan.humanGates.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
          </div>
          <div className="plan-block">
            <h4>Launch steps</h4>
            <ol>
              {plan.launchSteps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          </div>
          <div className="plan-grid">
            <div>
              <h4>30-day targets</h4>
              <ul>
                {plan.day30Targets.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4>Scale triggers</h4>
              <ul>
                {plan.scaleTriggers.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

export default function App({ isAdmin = false }: { isAdmin?: boolean }) {
  const [tab, setTab] = useState<Tab>("promptforge");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<OpportunityCategory | "all">("all");
  const [labelFilter, setLabelFilter] = useState<OpportunityLabel | "all">("all");
  const [sort, setSort] = useState<SortKey>("score");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const stats = useMemo(() => {
    const rev30 = OPPORTUNITIES.map((o) => avgMid(o.revenue30DayUsd));
    const rev90 = OPPORTUNITIES.map((o) => avgMid(o.revenue90DayUsd));
    return {
      count: OPPORTUNITIES.length,
      avg30: Math.round(rev30.reduce((a, b) => a + b, 0) / rev30.length),
      avg90: Math.round(rev90.reduce((a, b) => a + b, 0) / rev90.length),
      topPlanCount: BUSINESS_PLANS.length,
    };
  }, []);

  const filtered = useMemo(() => {
    let list = [...OPPORTUNITIES];
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (o) =>
          o.name.toLowerCase().includes(q) ||
          o.platform.toLowerCase().includes(q) ||
          o.description.toLowerCase().includes(q) ||
          o.whatYouUpload.toLowerCase().includes(q),
      );
    }
    if (category !== "all") list = list.filter((o) => o.category === category);
    if (labelFilter !== "all") list = list.filter((o) => o.labels.includes(labelFilter));

    list.sort((a, b) => {
      switch (sort) {
        case "rev30":
          return avgMid(b.revenue30DayUsd) - avgMid(a.revenue30DayUsd);
        case "rev90":
          return avgMid(b.revenue90DayUsd) - avgMid(a.revenue90DayUsd);
        case "speed":
          return a.firstDollarDays - b.firstDollarDays;
        case "automation":
          return b.automationScore - a.automationScore;
        default:
          return b.overallScore - a.overallScore;
      }
    });
    return list;
  }, [search, category, labelFilter, sort]);

  const selected = selectedId ? OPPORTUNITIES.find((o) => o.id === selectedId) : null;

  return (
    <div className="app">
      <div className="preview-banner">
        <span className="preview-dot" /> Private preview build{isAdmin ? " · admin access" : ""} — share by invitation only
      </div>
      <header className="hero">
        <div className="hero-inner">
          <p className="eyebrow">Automation-first income explorer</p>
          <h1>Auto Money Map</h1>
          <p className="hero-sub">
            {stats.count} legal, ethical opportunities ranked by ROI. OpenServ orchestration, human-in-the-loop
            quality gates, lean start → compound winners.
          </p>
          <div className="hero-stats">
            <Stat label="Opportunities" value={String(stats.count)} />
            <Stat label="Avg 30-day ROI" value={`$${stats.avg30}`} sub="lean baseline" />
            <Stat label="Avg 90-day ROI" value={`$${stats.avg90}`} sub="with compounding" />
            <Stat label="Full business plans" value={String(stats.topPlanCount)} />
          </div>
        </div>
      </header>

      <nav className="tabs">
        {(
          [
            ["promptforge", "★ PromptForge (MVP)"],
            ["printer", "🖨 Money Printer"],
            ["explorer", "Explorer"],
            ["plans", "Top Plans"],
            ["openserv", "OpenServ Stack"],
            ["launch", "Launch Calendar"],
            ...(isAdmin ? [["pitch", "Pitch & ROI"] as const] : []),
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`tab ${tab === id ? "tab--active" : ""}`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </nav>

      <main className="main">
        {tab === "promptforge" && <PromptForge isAdmin={isAdmin} />}

        {tab === "printer" && <MoneyPrinter />}

        {tab === "explorer" && (
          <div className={`explorer ${selected ? "explorer--split" : ""}`}>
            <div className="explorer-main">
              <div className="filters">
                <input
                  type="search"
                  placeholder="Search opportunities, platforms, uploads…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="search-input"
                />
                <select value={category} onChange={(e) => setCategory(e.target.value as OpportunityCategory | "all")}>
                  <option value="all">All categories</option>
                  {ALL_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {CATEGORY_LABELS[c]}
                    </option>
                  ))}
                </select>
                <select value={labelFilter} onChange={(e) => setLabelFilter(e.target.value as OpportunityLabel | "all")}>
                  <option value="all">All labels</option>
                  {ALL_LABELS.map((l) => (
                    <option key={l} value={l}>
                      {LABEL_META[l]}
                    </option>
                  ))}
                </select>
                <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
                  <option value="score">Sort: Overall score</option>
                  <option value="rev30">Sort: 30-day revenue</option>
                  <option value="rev90">Sort: 90-day revenue</option>
                  <option value="speed">Sort: Fastest to $1</option>
                  <option value="automation">Sort: Automation score</option>
                </select>
                <span className="filter-count">{filtered.length} results</span>
              </div>
              <div className="opp-grid">
                {filtered.map((opp) => (
                  <OpportunityCard
                    key={opp.id}
                    opp={opp}
                    selected={selectedId === opp.id}
                    onSelect={() => setSelectedId(selectedId === opp.id ? null : opp.id)}
                  />
                ))}
              </div>
            </div>
            {selected && <DetailPanel opp={selected} onClose={() => setSelectedId(null)} />}
          </div>
        )}

        {tab === "plans" && (
          <div className="plans-tab">
            <p className="section-intro">
              Deep business plans for the highest-ranked opportunities. Click to expand full workflow, launch steps,
              and scale triggers.
            </p>
            {BUSINESS_PLANS.map((p) => (
              <BusinessPlanCard key={p.opportunityId} opportunityId={p.opportunityId} />
            ))}
          </div>
        )}

        {tab === "openserv" && (
          <div className="openserv-tab">
            <section className="panel">
              <h2>Multi-agent orchestration</h2>
              <p className="section-intro">
                OpenServ coordinates the pipeline. Human approval gates sit between QA and Publisher — never skip
                them.
              </p>
              <div className="agent-flow">
                {OPENSERV_AGENTS.map((agent, i) => (
                  <div key={agent.id} className="agent-node">
                    {i > 0 && <span className="agent-arrow">→</span>}
                    <div className="agent-card">
                      <h3>{agent.name}</h3>
                      <p>{agent.role}</p>
                      <div className="agent-tools">
                        {agent.tools.map((t) => (
                          <span key={t} className="tool-chip">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                <div className="agent-node">
                  <span className="agent-arrow">→</span>
                  <div className="agent-card agent-card--human">
                    <h3>Human approval</h3>
                    <p>Mandatory gate before publish</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="panel">
              <h2>Human gates (never skip)</h2>
              <ul className="gate-list">
                {HUMAN_GATES.map((g) => (
                  <li key={g}>{g}</li>
                ))}
              </ul>
            </section>

            <section className="panel">
              <h2>Tool stack</h2>
              <div className="tool-grid">
                {TOOL_STACK.map((t) => (
                  <div key={t.name} className="tool-card">
                    <strong>{t.name}</strong>
                    <span>{t.role}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="panel">
              <h2>Scale triggers</h2>
              <ul>
                {SCALE_TRIGGERS.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </section>
          </div>
        )}

        {tab === "launch" && (
          <div className="launch-tab">
            {LAUNCH_PHASES.map((phase) => (
              <section key={phase.id} className="panel launch-phase">
                <div className="phase-head">
                  <h2>{phase.title}</h2>
                  <span className="phase-duration">{phase.duration}</span>
                </div>
                <ol className="phase-tasks">
                  {phase.tasks.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ol>
              </section>
            ))}
          </div>
        )}

        {tab === "pitch" && <PitchTab />}
      </main>

      <footer className="footer">
        <p>
          Lean baseline: 5–10 hr/wk, &lt;$100 startup. ROI ranges are estimates — validate with your own 7-day
          sprint. Legal & ethical only.
        </p>
      </footer>
    </div>
  );
}
