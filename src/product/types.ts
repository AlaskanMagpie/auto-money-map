// PromptForge — domain types.
// Self-contained product module (lemonsqueezy-saas-starter MVP). Local-only, no backend.

export type ModelTarget = "any" | "chatgpt" | "claude" | "gemini" | "midjourney";

export interface Collection {
  id: string;
  name: string;
}

export interface Prompt {
  id: string;
  title: string;
  body: string;
  collectionId: string | null;
  tags: string[];
  model: ModelTarget;
  favorite: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface PromptLibrary {
  version: 1;
  collections: Collection[];
  prompts: Prompt[];
}

export const MODEL_LABELS: Record<ModelTarget, string> = {
  any: "Any model",
  chatgpt: "ChatGPT",
  claude: "Claude",
  gemini: "Gemini",
  midjourney: "Midjourney",
};
