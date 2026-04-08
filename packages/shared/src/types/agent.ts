export interface ParsedAgent {
  slug: string;
  name: string;
  team: string;
  subTeam: string | null;
  identity: string;
  whenToUse: string;
  instructions: AgentInstruction[];
  outputFormat: string;
  saveLocations: {
    vault: string;
    output: string;
  };
  dependencies: string[];
  variables: string[];
  filePath: string;
  rawMarkdown: string;
}

export interface AgentInstruction {
  index: number;
  text: string;
  subSteps: string[];
  vaultPaths: string[];
}

export interface AgentTeamLead {
  slug: string;
  name: string;
  team: string;
  agentCount: number;
  subTeams: SubTeamEntry[];
  executionSteps: string[];
  coordinationRules: string[];
  filePath: string;
  rawMarkdown: string;
}

export interface SubTeamEntry {
  name: string;
  agentCount: number;
  agents: string[];
  path: string;
}

export type AgentTaskType =
  | "strategy"
  | "research"
  | "content"
  | "social"
  | "analysis"
  | "sales"
  | "qa"
  | "default";
