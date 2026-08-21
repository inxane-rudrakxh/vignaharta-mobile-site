import * as vscode from "vscode";
import { DEFAULT_RISK_WEIGHTS, RiskWeights } from "../../../shared/types";

export function setting<T>(key: string, fallback: T): T {
  return vscode.workspace.getConfiguration().get<T>(key, fallback);
}

export function riskThreshold(): number { return setting("codeiq.riskThreshold", 60); }
export function lineCountSignal(): number { return setting("codeiq.lineCountSignal", 15); }
export function useMockEvaluator(): boolean { return setting("codeiq.useMockEvaluator", false); }
export function sendCodeToLLM(): boolean { return setting("codeiq.sendCodeToLLM", false); }
export function evaluationModel(): string { return setting("codeiq.evaluationModel", "claude-sonnet-4-6"); }
export function enableVoiceInput(): boolean { return setting("codeiq.enableVoiceInput", false); }

export function riskWeights(): RiskWeights {
  const override = setting<Partial<RiskWeights>>("codeiq.riskWeights", {});
  return { ...DEFAULT_RISK_WEIGHTS, ...override };
}

export async function promptForLLMConsent(context: vscode.ExtensionContext): Promise<boolean> {
  const consentKey = "codeiq.llmConsentGranted";
  if (context.globalState.get<boolean>(consentKey)) return true;
  const choice = await vscode.window.showInformationMessage(
    "CodeIQ is ready to verify this block. With your permission, the code excerpt, checkpoint question, and your explanation will be sent to the configured evaluation provider. Nothing is sent while this setting is off.",
    "Allow for this workspace",
    "Keep local-only",
  );
  if (choice === "Allow for this workspace") {
    await context.globalState.update(consentKey, true);
    return true;
  }
  return false;
}
