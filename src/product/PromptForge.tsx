import { useMemo, useState } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { SEED_LIBRARY } from "./seed";
import { compile, hasUnfilled, parseVariables } from "./template";
import { MODEL_LABELS, type ModelTarget, type Prompt, type PromptLibrary } from "./types";
import "./promptforge.css";

// Free-tier cap (the deliberate "Pro gating" mock). Real license check is the unbuilt 10%.
const FREE_LIMIT = 12;
const LEMON_CHECKOUT_URL = "https://promptforge.lemonsqueezy.com/checkout"; // stub

function uid(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

function emptyPrompt(collectionId: string | null): Prompt {
  const now = Date.now();
  return {
    id: uid(),
    title: "Untitled prompt",
    body: "Write about {{topic}} for {{audience:everyone}}.",
    collectionId,
    tags: [],
    model: "any",
    favorite: false,
    createdAt: now,
    updatedAt: now,
  };
}

function CopyButton({ text, label = "Copy", className = "" }: { text: string; label?: string; className?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className={`pf-btn ${className}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1400);
        } catch {
          /* clipboard blocked */
        }
      }}
    >
      {done ? "Copied ✓" : label}
    </button>
  );
}

function UpgradeModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="pf-modal-backdrop" onClick={onClose}>
      <div className="pf-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="pf-modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <span className="pf-pro-badge">PromptForge Pro</span>
        <h3>Unlock the full vault</h3>
        <p>You hit the free limit of {FREE_LIMIT} prompts. Pro removes the cap and unlocks export.</p>
        <ul className="pf-price-list">
          <li>
            <strong>$29</strong> one-time — lifetime license
          </li>
          <li>
            <strong>$9/mo</strong> — Pro with future cloud sync
          </li>
        </ul>
        <a className="pf-btn pf-btn--primary pf-btn--block" href={LEMON_CHECKOUT_URL} target="_blank" rel="noreferrer">
          Checkout with Lemon Squeezy →
        </a>
        <p className="pf-fineprint">Demo build — checkout is a stub. Your prompts stay 100% on this device.</p>
      </div>
    </div>
  );
}

function TemplateRunner({ prompt }: { prompt: Prompt }) {
  const vars = useMemo(() => parseVariables(prompt.body), [prompt.body]);
  const [values, setValues] = useState<Record<string, string>>({});
  const compiled = compile(prompt.body, values);
  const unfilled = hasUnfilled(prompt.body, values);

  return (
    <div className="pf-runner">
      <div className="pf-runner-head">
        <h4>Run template</h4>
        <span className="pf-var-count">{vars.length} variable{vars.length === 1 ? "" : "s"}</span>
      </div>

      {vars.length === 0 ? (
        <p className="pf-muted">No variables — this prompt is ready to copy as-is.</p>
      ) : (
        <div className="pf-var-grid">
          {vars.map((v) => (
            <label key={v.name} className="pf-field">
              <span className="pf-field-label">{v.name}</span>
              <input
                type="text"
                placeholder={v.default ? `default: ${v.default}` : "—"}
                value={values[v.name] ?? ""}
                onChange={(e) => setValues((s) => ({ ...s, [v.name]: e.target.value }))}
              />
            </label>
          ))}
        </div>
      )}

      <div className="pf-compiled">
        <div className="pf-compiled-head">
          <span>Compiled output {unfilled && <em className="pf-warn-pill">unfilled vars use defaults</em>}</span>
          <CopyButton text={compiled} label="Copy output" className="pf-btn--primary" />
        </div>
        <pre className="pf-output">{compiled}</pre>
      </div>
    </div>
  );
}

export default function PromptForge({ isAdmin = false }: { isAdmin?: boolean }) {
  const [lib, setLib] = useLocalStorage<PromptLibrary>("promptforge.library.v1", SEED_LIBRARY);
  const [isPro, setIsPro] = useLocalStorage<boolean>("promptforge.pro", false);
  const [search, setSearch] = useState("");
  const [filterCol, setFilterCol] = useState<string>("all"); // "all" | "favorites" | collectionId
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(lib.prompts[0]?.id ?? null);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const allTags = useMemo(
    () => [...new Set(lib.prompts.flatMap((p) => p.tags))].sort(),
    [lib.prompts],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return lib.prompts
      .filter((p) => {
        if (filterCol === "favorites" && !p.favorite) return false;
        if (filterCol !== "all" && filterCol !== "favorites" && p.collectionId !== filterCol) return false;
        if (filterTag && !p.tags.includes(filterTag)) return false;
        if (q) {
          return (
            p.title.toLowerCase().includes(q) ||
            p.body.toLowerCase().includes(q) ||
            p.tags.some((t) => t.toLowerCase().includes(q))
          );
        }
        return true;
      })
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [lib.prompts, search, filterCol, filterTag]);

  const selected = lib.prompts.find((p) => p.id === selectedId) ?? null;
  const atFreeCap = !isPro && lib.prompts.length >= FREE_LIMIT;

  function patchPrompt(id: string, patch: Partial<Prompt>) {
    setLib((s) => ({
      ...s,
      prompts: s.prompts.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: Date.now() } : p)),
    }));
  }

  function addPrompt() {
    if (atFreeCap) {
      setShowUpgrade(true);
      return;
    }
    const collectionId = filterCol !== "all" && filterCol !== "favorites" ? filterCol : null;
    const p = emptyPrompt(collectionId);
    setLib((s) => ({ ...s, prompts: [p, ...s.prompts] }));
    setSelectedId(p.id);
  }

  function deletePrompt(id: string) {
    setLib((s) => ({ ...s, prompts: s.prompts.filter((p) => p.id !== id) }));
    if (selectedId === id) setSelectedId(null);
  }

  function duplicatePrompt(p: Prompt) {
    if (atFreeCap) {
      setShowUpgrade(true);
      return;
    }
    const copy: Prompt = { ...p, id: uid(), title: `${p.title} (copy)`, createdAt: Date.now(), updatedAt: Date.now() };
    setLib((s) => ({ ...s, prompts: [copy, ...s.prompts] }));
    setSelectedId(copy.id);
  }

  function exportLibrary() {
    if (!isPro) {
      setShowUpgrade(true);
      return;
    }
    const blob = new Blob([JSON.stringify(lib, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "promptforge-library.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function importLibrary(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result)) as PromptLibrary;
        if (Array.isArray(data.prompts)) {
          setLib({ version: 1, collections: data.collections ?? [], prompts: data.prompts });
          setSelectedId(data.prompts[0]?.id ?? null);
        }
      } catch {
        alert("Could not read that file — expected a PromptForge JSON export.");
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="pf">
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}

      <header className="pf-topbar">
        <div className="pf-brand">
          <span className="pf-logo">⚡</span>
          <div>
            <h2>PromptForge</h2>
            <p>Your prompt vault — organize, templatize, ship. 100% local.</p>
          </div>
        </div>
        <div className="pf-topbar-actions">
          <span className={`pf-tier ${isPro ? "pf-tier--pro" : ""}`}>
            {isPro ? "Pro" : `Free · ${lib.prompts.length}/${FREE_LIMIT}`}
          </span>
          {!isPro && (
            <button type="button" className="pf-btn pf-btn--primary" onClick={() => setShowUpgrade(true)}>
              Upgrade
            </button>
          )}
          {isAdmin && (
            <button type="button" className="pf-btn pf-btn--ghost" onClick={() => setIsPro((v) => !v)} title="Admin demo toggle">
              {isPro ? "Demo: set Free" : "Demo: set Pro"}
            </button>
          )}
        </div>
      </header>

      <div className="pf-body">
        <aside className="pf-sidebar">
          <button type="button" className="pf-btn pf-btn--primary pf-btn--block" onClick={addPrompt}>
            + New prompt
          </button>

          <nav className="pf-nav">
            <button className={filterCol === "all" ? "pf-nav-item active" : "pf-nav-item"} onClick={() => setFilterCol("all")}>
              All prompts <span>{lib.prompts.length}</span>
            </button>
            <button
              className={filterCol === "favorites" ? "pf-nav-item active" : "pf-nav-item"}
              onClick={() => setFilterCol("favorites")}
            >
              ★ Favorites <span>{lib.prompts.filter((p) => p.favorite).length}</span>
            </button>
          </nav>

          <p className="pf-nav-heading">Collections</p>
          <nav className="pf-nav">
            {lib.collections.map((c) => (
              <button
                key={c.id}
                className={filterCol === c.id ? "pf-nav-item active" : "pf-nav-item"}
                onClick={() => setFilterCol(c.id)}
              >
                {c.name} <span>{lib.prompts.filter((p) => p.collectionId === c.id).length}</span>
              </button>
            ))}
          </nav>

          {allTags.length > 0 && (
            <>
              <p className="pf-nav-heading">Tags</p>
              <div className="pf-tags">
                {allTags.map((t) => (
                  <button
                    key={t}
                    className={filterTag === t ? "pf-tag active" : "pf-tag"}
                    onClick={() => setFilterTag(filterTag === t ? null : t)}
                  >
                    #{t}
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="pf-io">
            <button type="button" className="pf-btn pf-btn--ghost pf-btn--block" onClick={exportLibrary}>
              Export JSON {!isPro && "🔒"}
            </button>
            <label className="pf-btn pf-btn--ghost pf-btn--block pf-import">
              Import JSON
              <input
                type="file"
                accept="application/json"
                onChange={(e) => e.target.files?.[0] && importLibrary(e.target.files[0])}
              />
            </label>
          </div>
        </aside>

        <section className="pf-list">
          <input
            type="search"
            className="pf-search"
            placeholder="Search prompts, bodies, tags…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="pf-list-scroll">
            {filtered.length === 0 && <p className="pf-empty">No prompts match. Try clearing filters.</p>}
            {filtered.map((p) => (
              <button
                key={p.id}
                className={`pf-card ${selectedId === p.id ? "active" : ""}`}
                onClick={() => setSelectedId(p.id)}
              >
                <div className="pf-card-top">
                  <span className="pf-card-title">{p.title}</span>
                  {p.favorite && <span className="pf-star">★</span>}
                </div>
                <p className="pf-card-snippet">{p.body.slice(0, 90)}</p>
                <div className="pf-card-meta">
                  <span className="pf-model">{MODEL_LABELS[p.model]}</span>
                  {p.tags.slice(0, 3).map((t) => (
                    <span key={t} className="pf-card-tag">#{t}</span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="pf-detail">
          {!selected ? (
            <div className="pf-detail-empty">
              <p>Select a prompt, or create a new one to start.</p>
            </div>
          ) : (
            <div className="pf-editor">
              <div className="pf-editor-head">
                <input
                  className="pf-title-input"
                  value={selected.title}
                  onChange={(e) => patchPrompt(selected.id, { title: e.target.value })}
                />
                <div className="pf-editor-actions">
                  <button
                    type="button"
                    className={`pf-icon ${selected.favorite ? "on" : ""}`}
                    onClick={() => patchPrompt(selected.id, { favorite: !selected.favorite })}
                    title="Favorite"
                  >
                    ★
                  </button>
                  <button type="button" className="pf-btn pf-btn--ghost" onClick={() => duplicatePrompt(selected)}>
                    Duplicate
                  </button>
                  <button type="button" className="pf-btn pf-btn--danger" onClick={() => deletePrompt(selected.id)}>
                    Delete
                  </button>
                </div>
              </div>

              <div className="pf-editor-controls">
                <label className="pf-field">
                  <span className="pf-field-label">Collection</span>
                  <select
                    value={selected.collectionId ?? ""}
                    onChange={(e) => patchPrompt(selected.id, { collectionId: e.target.value || null })}
                  >
                    <option value="">None</option>
                    {lib.collections.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="pf-field">
                  <span className="pf-field-label">Model</span>
                  <select
                    value={selected.model}
                    onChange={(e) => patchPrompt(selected.id, { model: e.target.value as ModelTarget })}
                  >
                    {(Object.keys(MODEL_LABELS) as ModelTarget[]).map((m) => (
                      <option key={m} value={m}>
                        {MODEL_LABELS[m]}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="pf-field pf-field--grow">
                  <span className="pf-field-label">Tags (comma-separated)</span>
                  <input
                    type="text"
                    value={selected.tags.join(", ")}
                    onChange={(e) =>
                      patchPrompt(selected.id, {
                        tags: e.target.value
                          .split(",")
                          .map((t) => t.trim().toLowerCase())
                          .filter(Boolean),
                      })
                    }
                  />
                </label>
              </div>

              <label className="pf-field">
                <span className="pf-field-label">
                  Prompt body — use <code>{"{{variable}}"}</code> or <code>{"{{variable:default}}"}</code>
                </span>
                <textarea
                  className="pf-textarea"
                  rows={8}
                  value={selected.body}
                  onChange={(e) => patchPrompt(selected.id, { body: e.target.value })}
                />
              </label>

              <div className="pf-editor-copyrow">
                <CopyButton text={selected.body} label="Copy raw" className="pf-btn--ghost" />
              </div>

              <TemplateRunner prompt={selected} />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
