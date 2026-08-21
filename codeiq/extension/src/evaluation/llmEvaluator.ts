import { EvaluationResult } from "../../../shared/types";
import { PrivacyGuard } from "../telemetry/privacyGuard";
import * as vscode from "vscode";
import { evaluationModel } from "../settings/configuration";
import { evaluationJsonInstruction, parseEvaluation } from "./evaluationSchema";
import { EvaluatorInput, LLMEvaluator } from "./mockEvaluator";

function safeDefault(): EvaluationResult {
  return { understanding_score: 0, status: "needs_review", concepts_understood: [], concepts_missing: ["The evaluation could not be completed safely."], confidence: 0, follow_up_question: "Would you like to review the key control flow manually?" };
}

export class AnthropicEvaluator implements LLMEvaluator {
  constructor(private readonly privacy: PrivacyGuard) {}

  async evaluate(input: EvaluatorInput): Promise<EvaluationResult> {
    try {
      this.privacy.assertCodeTransferAllowed();
      const code = this.privacy.redact(input.code).slice(0, 12000);
      const prompt = `Code block:\n${code}\n\nQuestion:\n${input.question}\n\nDeveloper explanation:\n${input.explanation}\n\nEvaluate understanding, not code quality. ${evaluationJsonInstruction}`;
      const first = await this.request(prompt);
      try { return parseEvaluation(first); } catch {
        const retry = await this.request(`${prompt}\n\nYour previous response was not valid JSON. Respond with JSON only, with no prose or markdown.`);
        return parseEvaluation(retry);
      }
    } catch { return safeDefault(); }
  }

  private async request(prompt: string): Promise<unknown> {
    const apiKey = process.env.CODEIQ_ANTHROPIC_API_KEY || vscode.workspace.getConfiguration().get<string>("codeiq.anthropicApiKey", "");
    if (!apiKey) throw new Error("No Anthropic API key configured");
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: evaluationModel(), max_tokens: 700, system: "You are a careful developer educator. Evaluate whether the explanation demonstrates understanding of the specific code. Do not judge whether AI was used.", messages: [{ role: "user", content: prompt }] }),
      signal: AbortSignal.timeout(18000),
    });
    if (!response.ok) throw new Error(`Anthropic request failed with ${response.status}`);
    const payload = await response.json() as { content?: Array<{ text?: string }> };
    const raw = payload.content?.map((part) => part.text || "").join("") || "";
    return JSON.parse(raw.replace(/^```json\s*/i, "").replace(/```$/i, "").trim());
  }
}

