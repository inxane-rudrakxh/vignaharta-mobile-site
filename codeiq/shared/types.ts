export type VerificationStatus =
  | "verified"
  | "partial"
  | "unverified"
  | "exempt"
  | "needs_review";

export type CodeSource =
  | "paste"
  | "ai_agent_detected"
  | "manual_typing"
  | "unknown";

export interface EvaluationResult {
  understanding_score: number;
  status: VerificationStatus;
  concepts_understood: string[];
  concepts_missing: string[];
  confidence: number;
  follow_up_question?: string;
}

export interface Checkpoint {
  id: string;
  blockId: string;
  question: string;
  userExplanation: string;
  createdAt: string;
  result: EvaluationResult;
  followUp?: Checkpoint;
}

export interface CodeBlock {
  id: string;
  filePath: string;
  startLine: number;
  endLine: number;
  insertedAt: string;
  lineCount: number;
  source: CodeSource;
  riskScore: number;
  riskReasons: string[];
  status: VerificationStatus;
  checkpoints: Checkpoint[];
  contentHash: string;
  language?: string;
  excerpt?: string;
  lastReviewedAt?: string;
}

export interface ProjectSummary {
  understandingPercent: number;
  verifiedPercent: number;
  unverifiedPercent: number;
  understandingDebtPercent: number;
  criticalUnverifiedCount: number;
  languageBreakdown: Record<string, number>;
  recentCheckpoints: Checkpoint[];
}

export interface RiskWeights {
  lineCount: number;
  complexity: number;
  security: number;
  databaseApi: number;
  unfamiliarDependency: number;
  businessLogic: number;
  verifiedSimilar: number;
  understoodMarker: number;
}

export interface CodeIqStore {
  version: 1;
  projectName: string;
  workspaceRoot: string;
  blocks: CodeBlock[];
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_RISK_WEIGHTS: RiskWeights = {
  lineCount: 15,
  complexity: 15,
  security: 20,
  databaseApi: 15,
  unfamiliarDependency: 10,
  businessLogic: 10,
  verifiedSimilar: -20,
  understoodMarker: -15,
};

export function emptyStore(workspaceRoot: string): CodeIqStore {
  const now = new Date().toISOString();
  return {
    version: 1,
    projectName: workspaceRoot.split(/[\\/]/).pop() || "CodeIQ project",
    workspaceRoot,
    blocks: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function summarizeStore(store: CodeIqStore): ProjectSummary {
  const blocks = store.blocks;
  const totalWeight = blocks.reduce((sum, block) => sum + Math.max(block.riskScore, 1), 0);
  const understoodWeight = blocks.reduce((sum, block) => {
    const multiplier = block.status === "verified" || block.status === "exempt" ? 1 : block.status === "partial" ? 0.5 : 0;
    return sum + Math.max(block.riskScore, 1) * multiplier;
  }, 0);
  const verified = blocks.filter((block) => block.status === "verified" || block.status === "exempt").length;
  const languageBreakdown: Record<string, number> = {};
  for (const block of blocks) languageBreakdown[block.language || "other"] = (languageBreakdown[block.language || "other"] || 0) + 1;
  const recentCheckpoints = blocks
    .flatMap((block) => block.checkpoints)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 8);
  return {
    understandingPercent: totalWeight ? Math.round((understoodWeight / totalWeight) * 100) : 0,
    verifiedPercent: blocks.length ? Math.round((verified / blocks.length) * 100) : 0,
    unverifiedPercent: blocks.length ? Math.round((blocks.filter((b) => b.status === "unverified" || b.status === "needs_review").length / blocks.length) * 100) : 0,
    understandingDebtPercent: totalWeight ? Math.round(100 - (understoodWeight / totalWeight) * 100) : 0,
    criticalUnverifiedCount: blocks.filter((b) => b.riskScore >= 60 && (b.status === "unverified" || b.status === "needs_review" || b.status === "partial")).length,
    languageBreakdown,
    recentCheckpoints,
  };
}
