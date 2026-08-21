import { CodeBlock, CodeIqStore, RiskWeights } from "../../../shared/types";

export interface RiskInput {
  content: string;
  filePath: string;
  lineCount: number;
  language?: string;
}

export interface RiskFactorResult { score: number; reason?: string; }

const clamp = (value: number) => Math.max(0, Math.min(100, value));

export function lineCountFactor(input: RiskInput, weight: number): RiskFactorResult {
  const normalized = 1 - Math.exp(-Math.max(0, input.lineCount) / 45);
  return { score: normalized * weight, reason: `${input.lineCount} new lines` };
}

export function complexityFactor(input: RiskInput, weight: number): RiskFactorResult {
  const branches = (input.content.match(/\b(if|else|for|while|switch|case|catch|\?\?|&&|\|\|)\b/g) || []).length;
  const score = Math.min(1, branches / 12) * weight;
  return score > 0 ? { score, reason: "branching and control flow" } : { score: 0 };
}

export function securityFactor(input: RiskInput, weight: number): RiskFactorResult {
  const match = input.content.match(/\b(auth|authenticate|authorization|token|password|session|crypto|jwt|oauth|permission|role)\b/gi);
  return match?.length ? { score: weight, reason: "authentication or security logic" } : { score: 0 };
}

export function databaseApiFactor(input: RiskInput, weight: number): RiskFactorResult {
  const match = input.content.match(/\b(select|insert|update|delete|sql|fetch|axios|request|query|prisma|drizzle|supabase|mongoose|transaction)\b|https?:\/\//gi);
  return match?.length ? { score: weight, reason: "database or external API operation" } : { score: 0 };
}

export function unfamiliarDependencyFactor(input: RiskInput, store: CodeIqStore, weight: number): RiskFactorResult {
  const imports = [...input.content.matchAll(/(?:from\s+["']|require\(["']|import\s+["'])([^"']+)/g)].map((match) => match[1]);
  const known = new Set(store.blocks.flatMap((block) => (block.excerpt?.match(/(?:from\s+["']|require\(["']|import\s+["'])([^"']+)/g) || []).map((value) => value.replace(/.*["']/, "").replace(/["']$/, ""))));
  const unfamiliar = imports.filter((value) => !known.has(value) && !value.startsWith(".") && !value.startsWith("node:"));
  return unfamiliar.length ? { score: weight, reason: "unfamiliar dependency" } : { score: 0 };
}

export function businessLogicFactor(input: RiskInput, weight: number): RiskFactorResult {
  const pathSignal = /(^|[\\/])(services?|core|domain|billing|auth|payments?)([\\/]|$)/i.test(input.filePath);
  const functionSignal = (input.content.match(/\b(function|class|async|export)\b/g) || []).length >= 2;
  return pathSignal || functionSignal ? { score: weight, reason: "core business logic" } : { score: 0 };
}

export function verifiedSimilarFactor(input: RiskInput, store: CodeIqStore, weight: number): RiskFactorResult {
  const tokens = new Set((input.content.match(/[A-Za-z_$][\w$]{3,}/g) || []).slice(0, 80));
  const similar = store.blocks.find((block) => {
    if (block.status !== "verified" || !block.excerpt) return false;
    const other = new Set(block.excerpt.match(/[A-Za-z_$][\w$]{3,}/g) || []);
    const overlap = [...tokens].filter((token) => other.has(token)).length;
    return tokens.size > 0 && overlap / tokens.size > 0.45;
  });
  return similar ? { score: weight, reason: "similar code was already verified" } : { score: 0 };
}

export function understoodMarkerFactor(input: RiskInput, store: CodeIqStore, weight: number): RiskFactorResult {
  const marker = /codeiq:(?:understood|verified)/i.test(input.content);
  const known = marker || store.blocks.some((block) => block.status === "verified" && block.filePath.endsWith(input.filePath));
  return known ? { score: weight, reason: "already-understood marker or verified pattern" } : { score: 0 };
}

export function calculateRisk(input: RiskInput, store: CodeIqStore, weights: RiskWeights): { score: number; reasons: string[] } {
  const factors = [
    lineCountFactor(input, weights.lineCount),
    complexityFactor(input, weights.complexity),
    securityFactor(input, weights.security),
    databaseApiFactor(input, weights.databaseApi),
    unfamiliarDependencyFactor(input, store, weights.unfamiliarDependency),
    businessLogicFactor(input, weights.businessLogic),
    verifiedSimilarFactor(input, store, weights.verifiedSimilar),
    understoodMarkerFactor(input, store, weights.understoodMarker),
  ];
  const reasons = factors.filter((factor) => Boolean(factor.reason) && Math.abs(factor.score) > 0.1).map((factor) => factor.reason as string);
  return { score: clamp(Math.round(factors.reduce((sum, factor) => sum + factor.score, 0))), reasons };
}
