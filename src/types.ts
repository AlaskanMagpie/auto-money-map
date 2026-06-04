export type OpportunityCategory =
  | "digital-products"
  | "design-templates"
  | "stock-licensing"
  | "print-on-demand"
  | "writing-fiction"
  | "game-assets"
  | "code-automation"
  | "productized-services";

export type OpportunityLabel =
  | "fast-cash"
  | "asset-compounding"
  | "audience-compounding"
  | "high-upside"
  | "low-confidence"
  | "requires-portfolio"
  | "requires-approval";

export type EthicalRisk = "low" | "medium";

export interface Opportunity {
  id: string;
  name: string;
  category: OpportunityCategory;
  platform: string;
  platformUrl: string;
  whatYouUpload: string;
  description: string;
  automationStack: string[];
  humanReviewPoints: string[];
  setupHours: number;
  weeklyHours: number;
  startupCostUsd: number;
  platformFeePct: number;
  avgPriceUsd: number;
  firstDollarDays: number;
  firstDollarProbPct: number;
  revenue30DayUsd: [number, number];
  revenue90DayUsd: [number, number];
  compoundingScore: number;
  automationScore: number;
  frictionScore: number;
  ethicalRisk: EthicalRisk;
  labels: OpportunityLabel[];
  overallScore: number;
  topPlan?: boolean;
}

export interface BusinessPlan {
  opportunityId: string;
  tagline: string;
  productConcept: string;
  targetBuyer: string;
  pricing: string;
  expectedCosts: string;
  automationWorkflow: string[];
  humanGates: string[];
  launchSteps: string[];
  day30Targets: string[];
  scaleTriggers: string[];
}

export interface OpenServAgent {
  id: string;
  name: string;
  role: string;
  tools: string[];
  outputs: string[];
}

export interface LaunchPhase {
  id: string;
  title: string;
  duration: string;
  tasks: string[];
}

export const CATEGORY_LABELS: Record<OpportunityCategory, string> = {
  "digital-products": "Digital Products",
  "design-templates": "Design & Templates",
  "stock-licensing": "Stock & Licensing",
  "print-on-demand": "Print on Demand",
  "writing-fiction": "Writing & Stories",
  "game-assets": "Game & Dev Assets",
  "code-automation": "Code & Automation",
  "productized-services": "Productized Services",
};

export const LABEL_META: Record<OpportunityLabel, string> = {
  "fast-cash": "Fast cash",
  "asset-compounding": "Asset compounding",
  "audience-compounding": "Audience compounding",
  "high-upside": "High upside",
  "low-confidence": "Low confidence",
  "requires-portfolio": "Needs portfolio",
  "requires-approval": "Needs approval",
};

export function computeOverallScore(o: Omit<Opportunity, "overallScore">): number {
  const rev30Mid = (o.revenue30DayUsd[0] + o.revenue30DayUsd[1]) / 2;
  const rev90Mid = (o.revenue90DayUsd[0] + o.revenue90DayUsd[1]) / 2;
  const speed = Math.max(0, 100 - o.firstDollarDays * 1.2);
  const prob = o.firstDollarProbPct;
  const auto = o.automationScore * 10;
  const compound = o.compoundingScore * 10;
  const friction = (11 - o.frictionScore) * 8;
  const rev = Math.min(40, rev30Mid / 25) + Math.min(30, rev90Mid / 50);
  const lean = o.startupCostUsd <= 50 ? 8 : o.startupCostUsd <= 100 ? 4 : 0;
  return Math.round(
    speed * 0.12 + prob * 0.18 + auto * 0.14 + compound * 0.14 + friction * 0.1 + rev * 0.22 + lean * 0.1,
  );
}

export function formatUsdRange([lo, hi]: [number, number]): string {
  if (lo === hi) return `$${lo.toLocaleString()}`;
  return `$${lo.toLocaleString()}–$${hi.toLocaleString()}`;
}
