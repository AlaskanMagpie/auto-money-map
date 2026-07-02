// Soft client-side gate for the preview portal.
// NOTE: this is a SHARE gate, not real security — the hashes ship in the bundle,
// so a determined dev could brute/replace them. Good enough for "give a friend
// the link + password to preview." For real auth, move this check server-side.

export type GateRole = "admin" | "preview";

// SHA-256 hashes of the two access passwords (plaintext intentionally not stored).
// To change a password: run `node -e "console.log(require('crypto').createHash('sha256').update('NEW_PW').digest('hex'))"`
// and paste the result below.
const HASHES: Record<string, GateRole> = {
  // admin password → full access incl. internal Pitch/ROI tab
  "4be22e7ac641f31b9d2393565532fc18125906690008e8f559ea28d0d790ee62": "admin",
  // preview password → live MVP preview (no internal pitch)
  "62fd81c8728769f42db83b296f36188621172eb00013db0072a8620cf31640f5": "preview",
};

export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function checkPassword(input: string): Promise<GateRole | null> {
  const hash = await sha256Hex(input.trim());
  return HASHES[hash] ?? null;
}
