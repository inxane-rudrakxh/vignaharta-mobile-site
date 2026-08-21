import * as vscode from "vscode";
import { sendCodeToLLM } from "../settings/configuration";

const SECRET_PATTERNS = [
  /(api[_-]?key|token|secret|password|authorization)\s*[:=]\s*["'`]([^"'`\n]+)["'`]/gi,
  /Bearer\s+[A-Za-z0-9._-]+/gi,
  /-----BEGIN [^-]+-----[\s\S]*?-----END [^-]+-----/gi,
];

export class PrivacyGuard {
  constructor(private readonly context: vscode.ExtensionContext) {}

  maySendCode(): boolean { return sendCodeToLLM(); }

  redact(code: string): string {
    return SECRET_PATTERNS.reduce((value, pattern) => value.replace(pattern, (match, key) => key ? `${key}: [redacted]` : "[redacted]"), code);
  }

  canUseTelemetry(): boolean {
    return vscode.workspace.getConfiguration().get<boolean>("codeiq.enableTelemetry", false) && Boolean(this.context.globalState.get<boolean>("codeiq.telemetryConsent"));
  }

  assertCodeTransferAllowed(): void {
    if (!this.maySendCode()) throw new Error("CodeIQ privacy setting prevents code transfer.");
  }
}
