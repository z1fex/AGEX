export interface Client {
  id: string;
  userId: string;
  name: string;
  slug: string;
  industry: string | null;
  website: string | null;
  status: "active" | "archived";
  vaultPath: string;
  onboardedAt: number;
  createdAt: number;
  updatedAt: number;
}

export interface ClientProfile {
  name: string;
  industry: string;
  website: string;
  description: string;
  products: string[];
  targetMarket: string;
}

export interface ClientBrandVoice {
  tone: string;
  personality: string[];
  doUse: string[];
  dontUse: string[];
  examples: string[];
}

export interface ClientICP {
  title: string;
  demographics: string;
  painPoints: string[];
  goals: string[];
  channels: string[];
  objections: string[];
}

export interface ClientGoals {
  primary: string[];
  secondary: string[];
  kpis: string[];
  timeline: string;
  budget: string;
}

export interface ClientCompetitors {
  competitors: CompetitorEntry[];
}

export interface CompetitorEntry {
  name: string;
  website: string;
  strengths: string[];
  weaknesses: string[];
}

export interface ClientContext {
  profile: ClientProfile;
  brandVoice: ClientBrandVoice;
  icp: ClientICP;
  goals: ClientGoals;
  competitors: ClientCompetitors;
}
