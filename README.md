# Auto Money Map

Automation-first income explorer — **55+ legal opportunities**, ROI scoring, OpenServ multi-agent workflows, and full business plans for the top picks.

**Not part of waypoint-shelter.** Standalone repo.

## Quick start

```bash
cd c:\Users\Otami.DESKTOP-8I60AFT\Desktop\gits\auto
npm install
npm run dev
```

Open **http://localhost:5173**

## What's inside

| Tab | Content |
|-----|---------|
| **Explorer** | Filter/search/sort 55 opportunities by category, label, ROI |
| **Top Plans** | 14 deep business plans with launch steps and scale triggers |
| **OpenServ Stack** | 6-agent orchestration + human approval gates |
| **Launch Calendar** | 48h setup → 7-day validation → 30-day compounding |

## ROI assumptions (lean baseline)

- 5–10 hours/week
- Under $100 startup spend
- Existing tools: Cursor, GPT/Claude, Hermes, OpenServ, GitHub
- Reinvest only after validation

## Build

```bash
npm run build
npm run preview
```

## Structure

```
src/
  data/
    opportunities.ts   # 55 ranked opportunities
    businessPlans.ts   # Top business plans
    openserv.ts        # Agent workflows + launch phases
  App.tsx              # Interactive landing page
  types.ts             # ROI scoring model
```

## Guardrails

Copyright clearance, platform ToS, AI disclosure where required, no spam uploads, no misleading claims. Human-in-the-loop before every publish.
