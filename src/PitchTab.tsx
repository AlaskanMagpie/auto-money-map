// Admin-only Pitch & ROI view. Mirrors src/product/PITCH.md so the narrative
// lives both as a doc (for the repo) and in-app (for live review).

const QR_SRC = `${import.meta.env.BASE_URL}preview-qr.png`;
const PREVIEW_URL = "https://alaskanmagpie.github.io/auto-money-map/";

export default function PitchTab() {
  return (
    <div className="pitch-tab">
      <section className="panel">
        <h2>PromptForge — the pitch</h2>
        <p className="section-intro">
          Built from the <strong>lemonsqueezy-saas-starter</strong> opportunity on the map: “one tiny paid utility,
          one niche, one price.” A prompt vault for people who live in AI tools — organize, templatize, ship.
        </p>
        <p className="pitch-oneliner">
          “Stop losing your best prompts in chat history and sticky notes. PromptForge keeps them organized,
          turns them into reusable templates, and stays 100% on your machine.”
        </p>
        <div className="pitch-value">
          <div className="pitch-value-card">
            <h4>Organize</h4>
            <p>Collections, tags, favorites, instant search across every prompt.</p>
          </div>
          <div className="pitch-value-card">
            <h4>Templatize</h4>
            <p>
              <code>{"{{variables}}"}</code> → fill-in form → live compiled output → one-click copy. The core feature.
            </p>
          </div>
          <div className="pitch-value-card">
            <h4>Stay private</h4>
            <p>Local-only storage. No account, no upload — privacy is the selling point.</p>
          </div>
        </div>
      </section>

      <section className="panel">
        <h2>Who it's for</h2>
        <p>
          AI power users, prompt engineers, and indie builders who reuse the same prompts weekly and currently
          scatter them across notes apps, docs, and chat history. Same audience this whole app already speaks to.
        </p>
      </section>

      <section className="panel">
        <h2>Immediate ROI expectation (30-day)</h2>
        <div className="pitch-roi">
          <div className="stat">
            <span className="stat-label">Pricing</span>
            <span className="stat-value">$29</span>
            <span className="stat-sub">lifetime · or $9/mo Pro</span>
          </div>
          <div className="stat">
            <span className="stat-label">Target signups</span>
            <span className="stat-value">~50</span>
            <span className="stat-sub">first 30 days</span>
          </div>
          <div className="stat">
            <span className="stat-label">Conversions</span>
            <span className="stat-value">5–15</span>
            <span className="stat-sub">free → paid</span>
          </div>
          <div className="stat">
            <span className="stat-label">Revenue</span>
            <span className="stat-value">$145–$435</span>
            <span className="stat-sub">month one</span>
          </div>
        </div>
        <p className="pitch-fine">
          Costs: ~$50 domain + Lemon Squeezy fees (~8%). Hosting $0 (static). Numbers mirror the business plan's
          30-day targets — validate with a real 7-day launch sprint.
        </p>
      </section>

      <section className="panel">
        <h2>The play (go-to-market)</h2>
        <ol className="phase-tasks">
          <li>Week 1 — Validate the pain in 5 subreddits + 3 Discords (r/ChatGPT, r/PromptEngineering, AI Discords).</li>
          <li>Week 2 — Ship MVP (this build) + landing page + Lemon Squeezy checkout.</li>
          <li>Week 3 — Launch on Product Hunt + niche forums; collect the first reviews.</li>
          <li>Week 4 — Add the features requested 3+ times; turn on affiliate at 20 sales.</li>
          <li>Scale — Bundle with a prompt-pack at $500/mo revenue; cloud sync unlocks the $9/mo tier.</li>
        </ol>
      </section>

      <section className="panel">
        <h2>Share this preview</h2>
        <div className="pitch-share">
          <img className="pitch-qr" src={QR_SRC} alt="QR code to the preview portal" width={180} height={180} />
          <div>
            <p>
              Scan to open the password gate, or send the link:
              <br />
              <a href={PREVIEW_URL} target="_blank" rel="noreferrer" className="detail-link">
                {PREVIEW_URL} ↗
              </a>
            </p>
            <p className="pitch-fine">
              Passwords: <code>preview-2026</code> (MVP preview) · <code>forge-admin-2026</code> (admin — this view).
              Soft client-side gate; rotate the hashes in <code>src/gate/passwords.ts</code> before sharing widely.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
