// PromptForge — the templating engine. This is the "beefy" core feature.
// Parses {{variable}} and {{variable:default value}} tokens, extracts a unique
// ordered variable list, and compiles a prompt by substituting values.
//
// Pure functions only — trivially unit-testable, no React/DOM/storage deps.

export interface TemplateVar {
  name: string;
  default: string;
}

// {{ name }} or {{ name : default text (may contain spaces) }}
const TOKEN = /\{\{\s*([a-zA-Z0-9_.-]+)\s*(?::([^}]*))?\}\}/g;

/** Extract unique variables in first-seen order. Later defaults don't override earlier ones. */
export function parseVariables(body: string): TemplateVar[] {
  const seen = new Map<string, TemplateVar>();
  for (const match of body.matchAll(TOKEN)) {
    const name = match[1];
    const def = (match[2] ?? "").trim();
    if (!seen.has(name)) {
      seen.set(name, { name, default: def });
    } else if (def && !seen.get(name)!.default) {
      seen.set(name, { name, default: def });
    }
  }
  return [...seen.values()];
}

/** Compile a template. Missing values fall back to the token's default, then to "". */
export function compile(body: string, values: Record<string, string>): string {
  return body.replace(TOKEN, (_full, rawName: string, rawDefault?: string) => {
    const name = rawName;
    const provided = values[name];
    if (provided !== undefined && provided !== "") return provided;
    return (rawDefault ?? "").trim();
  });
}

/** True if the body still contains unresolved tokens given the provided values. */
export function hasUnfilled(body: string, values: Record<string, string>): boolean {
  for (const match of body.matchAll(TOKEN)) {
    const name = match[1];
    const def = (match[2] ?? "").trim();
    const provided = values[name];
    if ((provided === undefined || provided === "") && !def) return true;
  }
  return false;
}
