import { useState, type ReactNode } from "react";
import { checkPassword, type GateRole } from "./passwords";
import "./gate.css";

const STORAGE_KEY = "amm.gate.role";

function readStoredRole(): GateRole | null {
  try {
    const v = sessionStorage.getItem(STORAGE_KEY);
    return v === "admin" || v === "preview" ? v : null;
  } catch {
    return null;
  }
}

/**
 * Soft password gate wrapping the whole app. Renders a password screen until a
 * valid password is entered, then calls `children(role)` with the access level.
 * Unlock persists for the browser session only (sessionStorage).
 */
export default function PasswordGate({ children }: { children: (role: GateRole) => ReactNode }) {
  const [role, setRole] = useState<GateRole | null>(readStoredRole);
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  if (role) return <>{children(role)}</>;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(false);
    const result = await checkPassword(input);
    setBusy(false);
    if (result) {
      try {
        sessionStorage.setItem(STORAGE_KEY, result);
      } catch {
        /* ignore */
      }
      setRole(result);
    } else {
      setError(true);
      setInput("");
    }
  }

  return (
    <div className="gate">
      <form className="gate-card" onSubmit={submit}>
        <span className="gate-logo">⚡</span>
        <h1>PromptForge — Preview</h1>
        <p className="gate-sub">Enter the access password to view the live MVP preview.</p>
        <input
          type="password"
          className={`gate-input ${error ? "gate-input--error" : ""}`}
          placeholder="Password"
          value={input}
          autoFocus
          onChange={(e) => {
            setInput(e.target.value);
            setError(false);
          }}
        />
        {error && <p className="gate-error">Incorrect password — try again.</p>}
        <button type="submit" className="gate-btn" disabled={busy || !input}>
          {busy ? "Checking…" : "Unlock preview"}
        </button>
        <p className="gate-fine">Private preview build · access by invitation only</p>
      </form>
    </div>
  );
}
