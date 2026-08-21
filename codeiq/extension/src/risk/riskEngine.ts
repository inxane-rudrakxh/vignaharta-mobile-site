import { CodeIqStore, RiskWeights } from "../../../shared/types";
import { calculateRisk, RiskInput } from "./riskFactors";

export interface RiskDecision {
  score: number;
  reasons: string[];
  checkpointRecommended: boolean;
}

export class RiskEngine {
  constructor(private readonly threshold: number, private readonly weights: RiskWeights) {}

  evaluate(input: RiskInput, store: CodeIqStore): RiskDecision {
    const result = calculateRisk(input, store, this.weights);
    return { ...result, checkpointRecommended: result.score >= this.threshold };
  }
}
