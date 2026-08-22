import * as vscode from "vscode";
import * as fs from "node:fs";
import * as path from "node:path";
import { CheckpointPanel } from "./checkpoint/checkpointPanel";
import { generateQuestion } from "./checkpoint/questionGenerator";
import { StatusDecorations } from "./decorations/statusDecorations";
import { CommitGuard } from "./git/commitGuard";
import { MockEvaluator } from "./evaluation/mockEvaluator";
import { AnthropicEvaluator } from "./evaluation/llmEvaluator";
import { PasteWatcher } from "./paste/pasteWatcher";
import { RiskEngine } from "./risk/riskEngine";
import { ensureGitignorePrompt, ensureWorkspaceFiles, ProjectStore, stableHash } from "./state/projectStore";
import { DashboardServer } from "./state/dashboardServer";
import { PrivacyGuard } from "./telemetry/privacyGuard";
import { lineCountSignal, promptForLLMConsent, riskThreshold, riskWeights, sendCodeToLLM, useMockEvaluator } from "./settings/configuration";
import { CodeBlock } from "../../shared/types";

export function activate(context: vscode.ExtensionContext) {
  const root = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!root) return;
  ensureWorkspaceFiles(root);
  void ensureGitignorePrompt(root);
  const store = ProjectStore.open(root);
  const dashboardServer = new DashboardServer(store);
  dashboardServer.start();
  const privacy = new PrivacyGuard(context);
  const evaluator = useMockEvaluator() || !sendCodeToLLM() ? new MockEvaluator() : new AnthropicEvaluator(privacy);
  const risk = new RiskEngine(riskThreshold(), riskWeights());
  const decorations = new StatusDecorations();
  const checkpoint = new CheckpointPanel(context, store, evaluator);
  const guard = new CommitGuard(store);

  const refresh = () => { if (vscode.window.activeTextEditor) decorations.update(vscode.window.activeTextEditor, store.blocks.filter((block) => path.resolve(block.filePath) === path.resolve(vscode.window.activeTextEditor!.document.fileName))); };
  const watcher = new PasteWatcher(lineCountSignal, (event) => {
    const decision = risk.evaluate({ content: event.content, filePath: event.document.fileName, lineCount: event.lineCount, language: event.document.languageId }, { version: 1, projectName: path.basename(root), workspaceRoot: root, blocks: store.blocks, createdAt: "", updatedAt: "" });
    const autoExplain = event.lineCount >= lineCountSignal() || event.source === "ai_agent_detected" || decision.checkpointRecommended;
    if (autoExplain) void vscode.window.showInformationMessage(`CodeIQ: ${event.provenanceLabel}. Starting an explanation now.`, "Let's review");
    for (const detected of event.blocks) {
      const id = stableHash(`${event.document.fileName}:${detected.startLine}:${detected.content}`);
      const reasons = [...decision.reasons, event.provenanceLabel];
      const block: CodeBlock = { id, filePath: event.document.fileName, startLine: detected.startLine, endLine: detected.endLine, insertedAt: new Date().toISOString(), lineCount: detected.content.split(/\r?\n/).length, source: event.source, riskScore: decision.score, riskReasons: reasons, status: autoExplain ? "unverified" : "exempt", checkpoints: [], contentHash: stableHash(detected.content), language: event.document.languageId, excerpt: detected.content.slice(0, 5000) };
      store.upsertBlock(block);
      if (autoExplain) {
        void (async () => { if (sendCodeToLLM() && !useMockEvaluator() && !(await promptForLLMConsent(context))) return; checkpoint.open(block, generateQuestion(detected.content, detected.label)); refresh(); })();
      }
    }
    refresh();
  });

  context.subscriptions.push(watcher, decorations, dashboardServer, vscode.window.onDidChangeActiveTextEditor(refresh));
  context.subscriptions.push(vscode.commands.registerCommand("codeiq.openDashboard", () => openDashboard(root, store)));
  context.subscriptions.push(vscode.commands.registerCommand("codeiq.reviewCurrentFile", () => {
    const file = vscode.window.activeTextEditor?.document.fileName;
    const block = store.blocks.find((candidate) => candidate.filePath === file && candidate.status !== "verified" && candidate.status !== "exempt");
    if (block) checkpoint.open(block, generateQuestion(block.excerpt || "", path.basename(block.filePath)));
    else vscode.window.showInformationMessage("No pending CodeIQ blocks in the active file.");
  }));
  context.subscriptions.push(vscode.commands.registerCommand("codeiq.markCurrentBlockExempt", () => {
    const file = vscode.window.activeTextEditor?.document.fileName;
    const block = store.blocks.find((candidate) => candidate.filePath === file);
    if (block) { store.updateStatus(block.id, "exempt"); refresh(); }
  }));
  context.subscriptions.push(vscode.commands.registerCommand("codeiq.installGitHook", () => guard.installHook()));
  context.subscriptions.push(vscode.commands.registerCommand("codeiq.exportData", () => openDashboard(root, store)));
  refresh();
}

function openDashboard(root: string, store: ProjectStore) {
  const exportFile = path.join(root, ".codeiq", "dashboard-data.json");
  fs.writeFileSync(exportFile, JSON.stringify(store.exportPayload(), null, 2));
  vscode.env.openExternal(vscode.Uri.parse(`http://localhost:4173/?data=${encodeURIComponent(exportFile)}`));
  vscode.window.showInformationMessage(`Dashboard data exported to ${path.relative(root, exportFile)}. Run the local dashboard to view it.`);
}

export function deactivate() {}
