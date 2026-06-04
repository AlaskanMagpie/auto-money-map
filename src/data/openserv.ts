import type { OpenServAgent, LaunchPhase } from "../types";

export const OPENSERV_AGENTS: OpenServAgent[] = [
  {
    id: "planner",
    name: "Planner",
    role: "Orchestrates the full pipeline from brief to publish decision",
    tools: ["OpenServ reasoning", "ROI scorer", "Calendar scheduler"],
    outputs: ["Daily task queue", "Priority rank", "Resource allocation"],
  },
  {
    id: "researcher",
    name: "Researcher",
    role: "Validates niches, platforms, fees, and competitor gaps",
    tools: ["Firecrawl", "GPT/Claude", "Spreadsheet tracker"],
    outputs: ["Niche brief", "Competitor matrix", "Keyword list", "Fee summary"],
  },
  {
    id: "creator",
    name: "Creator",
    role: "Generates assets, copy, code, or service deliverables",
    tools: ["Cursor", "GPT/Claude", "Hermes", "Canva/Kittl", "Procgen scripts"],
    outputs: ["Draft assets", "Listing copy", "Code scaffolds", "Report drafts"],
  },
  {
    id: "qa",
    name: "QA / Compliance",
    role: "Checks quality, rights, platform rules, and ethical boundaries",
    tools: ["OpenServ policy checker", "Trademark grep", "Visual diff"],
    outputs: ["Pass/fail checklist", "Revision list", "Disclosure tags"],
  },
  {
    id: "publisher",
    name: "Publisher",
    role: "Formats and uploads to target platforms",
    tools: ["Platform APIs", "Batch upload scripts", "Metadata tagger"],
    outputs: ["Live listings", "Upload log", "Cross-post schedule"],
  },
  {
    id: "analytics",
    name: "Analytics",
    role: "Tracks sales, traffic, and ROI; feeds back to Planner",
    tools: ["Stripe/Gumroad webhooks", "Spreadsheet dashboard", "GPT summary"],
    outputs: ["Weekly ROI report", "Scale/kill recommendations", "A/B results"],
  },
];

export const HUMAN_GATES = [
  "Copyright & trademark clearance before any publish",
  "AI disclosure tags where platforms require them",
  "Pricing sanity — not race-to-bottom",
  "Final quality pass on every customer-facing asset",
  "Platform ToS compliance check",
  "No misleading income or capability claims",
  "Client deliverable sign-off for services",
];

export const LAUNCH_PHASES: LaunchPhase[] = [
  {
    id: "48h",
    title: "48-Hour Setup",
    duration: "2 days",
    tasks: [
      "Pick top 3 opportunities from this map (1 fast-cash, 1 asset, 1 service)",
      "Create Gumroad + one marketplace account",
      "Set up OpenServ planner workflow with 6 agents",
      "Create GitHub repo for automation scripts",
      "Build landing page (this app!) for your own brand",
      "Configure Cursor rules for your chosen niche",
    ],
  },
  {
    id: "7d",
    title: "7-Day Validation Sprint",
    duration: "7 days",
    tasks: [
      "Day 1: Researcher agent validates niche + 10 competitors",
      "Day 2–3: Creator agent ships first product draft",
      "Day 4: QA agent + human review gate",
      "Day 5: Publisher agent lists on primary platform",
      "Day 6: Outreach to 3 communities (Reddit, Discord, X)",
      "Day 7: Analytics review — scale, pivot, or kill",
    ],
  },
  {
    id: "30d",
    title: "30-Day Compounding Cycle",
    duration: "30 days",
    tasks: [
      "Week 1: Ship product #1, aim for first dollar",
      "Week 2: Ship product #2 OR first service client",
      "Week 3: Reinvest 20% of revenue into ads/outreach if ROAS > 2x",
      "Week 4: Analytics agent produces ROI report; Planner picks next 3",
      "Throughout: Bank reusable assets (templates, scripts, agents)",
      "End of month: Double down on winner, pause losers",
    ],
  },
];

export const SCALE_TRIGGERS = [
  "First sale → immediately ship variant #2 in same niche",
  "$500/mo revenue → reinvest 20% into paid outreach",
  "$1k/mo revenue → productize best service into Gumroad template",
  "$3k/mo revenue → hire VA for publishing/outreach ($500/mo)",
  "$5k/mo revenue → launch second platform channel for top asset",
  "10+ sales on one product → bundle with complementary product at 20% discount",
];

export const TOOL_STACK = [
  { name: "OpenServ", role: "Multi-agent reasoning & orchestration" },
  { name: "Cursor", role: "Code, templates, rules, scaffolds" },
  { name: "GPT / Claude", role: "Research, copy, drafts, analysis" },
  { name: "Hermes", role: "Eval harness, prompt testing, quality scoring" },
  { name: "Firecrawl", role: "Web research, competitor scraping" },
  { name: "GitHub", role: "Template repos, CI/CD, version control" },
  { name: "Gumroad", role: "Primary digital product storefront" },
  { name: "n8n / Make", role: "Workflow automation pipelines" },
];
