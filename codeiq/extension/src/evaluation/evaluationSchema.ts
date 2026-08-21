import { EvaluationResult, VerificationStatus } from "../../../shared/types";

const statuses: VerificationStatus[] = ["verified", "partial", "unverified", "exempt", "needs_review"];

export function parseEvaluation(value: unknown): EvaluationResult {
  if (!value || typeof value !== "object") throw new Error("Evaluation was not an object");
  const candidate = value as Record<string, unknown>;
  const score = Number(candidate.understanding_score);
  const confidence = Number(candidate.confidence);
  const status = candidate.status;
  if (!Number.isFinite(score) || score < 0 || score > 100 || !Number.isFinite(confidence) || confidence < 0 || confidence > 1 || typeof status !== "string" || !statuses.includes(status as VerificationStatus)) throw new Error("Evaluation failed schema validation");
  const list = (key: string) => Array.isArray(candidate[key]) ? candidate[key].filter((item): item is string => typeof item === "string").slice(0, 8) : [];
  return { understanding_score: Math.round(score), status: status as VerificationStatus, concepts_understood: list("concepts_understood"), concepts_missing: list("concepts_missing"), confidence, follow_up_question: typeof candidate.follow_up_question === "string" ? candidate.follow_up_question.slice(0, 500) : undefined };
}

export const evaluationJsonInstruction = `Return JSON only with this exact shape: {"understanding_score": number 0-100, "status":"verified"|"partial"|"unverified"|"exempt"|"needs_review", "concepts_understood": string[], "concepts_missing": string[], "confidence": number 0-1, "follow_up_question"?: string}. Never include markdown.`;
