import { EvaluationResult } from "../../../shared/types";
import { parseEvaluation } from "./evaluationSchema";

export interface EvaluatorInput { code: string; question: string; explanation: string; }
export interface LLMEvaluator { evaluate(input: EvaluatorInput): Promise<EvaluationResult>; }

export class MockEvaluator implements LLMEvaluator {
  async evaluate(input: EvaluatorInput): Promise<EvaluationResult> {
    const explanation = input.explanation.trim();
    const security = /auth|token|password|session|jwt|oauth/i.test(input.code);
    const hasMechanism = /because|so that|returns?|validat|refresh|encrypt|hash|database|request|error|fallback/i.test(explanation);
    const score = explanation.length < 18 ? 28 : hasMechanism ? (security ? 90 : 84) : 58;
    const result = {
      understanding_score: score,
      status: score >= 75 ? "verified" : score >= 45 ? "partial" : "needs_review",
      concepts_understood: hasMechanism ? ["the main control flow", security ? "the security-sensitive path" : "the primary behavior"] : ["the broad intent"],
      concepts_missing: hasMechanism ? [] : [security ? "how credentials or session state are protected" : "what happens when the operation fails"],
      confidence: 0.78,
      follow_up_question: score < 75 ? `In one sentence, what happens when ${security ? "the credential or session check fails" : "this operation encounters an error"}?` : undefined,
    };
    return parseEvaluation(result);
  }
}
