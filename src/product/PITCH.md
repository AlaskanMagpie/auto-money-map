# PromptForge — MVP pitch

Built from the **`lemonsqueezy-saas-starter`** opportunity on the Auto Money Map:
_"one tiny paid utility, one niche, one price."_ Of the 14 business plans, this is the only one
shippable as working software today — so it became the live MVP.

## Why I built it
- **Buildable now:** a focused, client-side web utility fits the existing Vite + React stack and
  reaches ~90% done in one pass — no backend, no API keys, no infra.
- **Audience fit:** the buyers (AI power users / prompt engineers) are the exact people this whole
  app already speaks to.
- **Recurring-revenue fit:** organizing + reusing prompts is a weekly habit, which justifies a
  $9/mo tier on top of the $29 lifetime.
- **Beefy by design:** the templating engine (`{{variables}}` → fill-in form → live compiled
  output) is genuinely useful, not a toy.

## Who it's for
AI power users, prompt engineers, and indie builders who reuse the same prompts every week and
currently scatter them across notes apps, docs, and chat history.

## The pitch
> "Stop losing your best prompts in chat history and sticky notes. PromptForge keeps them
> organized, turns them into reusable templates, and stays 100% on your machine."

- **Organize** — collections, tags, favorites, instant search.
- **Templatize** — variables compile into ready-to-paste prompts in one click.
- **Stay private** — local-only storage; no account, no upload.

## Immediate ROI expectation (first 30 days)
- **Pricing:** $29 lifetime / $9/mo Pro.
- **Targets:** ~50 signups, 5–15 paid conversions, **$145–$435 revenue** (mirrors the business
  plan's 30-day targets).
- **Costs:** ~$50 domain + Lemon Squeezy fees (~8%); hosting $0 (static).

## The play (go-to-market)
1. **Week 1** — Validate the pain in 5 subreddits + 3 Discords (r/ChatGPT, r/PromptEngineering, AI Discords).
2. **Week 2** — Ship MVP (this build) + landing page + Lemon Squeezy checkout.
3. **Week 3** — Launch on Product Hunt + niche forums; collect first reviews.
4. **Week 4** — Build the features requested 3+ times; turn on affiliate at 20 sales.
5. **Scale** — Bundle a prompt-pack at $500/mo revenue; cloud sync unlocks the recurring $9/mo tier.

## What's intentionally NOT built (the ~10%)
- Real payment / license verification (checkout is a stub).
- Accounts + cloud sync (local-only by design for the MVP).
- Production hardening of the share gate (it's a soft client-side password).
