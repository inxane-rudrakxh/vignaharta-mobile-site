import * as fs from "node:fs";
import * as path from "node:path";
import * as vscode from "vscode";
import { ProjectStore } from "../state/projectStore";

export class CommitGuard {
  constructor(private readonly store: ProjectStore) {}

  async warnBeforeCommit(): Promise<void> {
    const important = this.store.blocks.filter((block) => block.riskScore >= 60 && ["unverified", "needs_review", "partial"].includes(block.status));
    if (!important.length) return;
    const choice = await vscode.window.showWarningMessage(`${important.length} important code block${important.length === 1 ? " hasn't" : "s haven't"} been verified.`, "Review", "Commit Anyway");
    if (choice === "Review") await vscode.commands.executeCommand("codeiq.reviewCurrentFile");
  }

  async installHook(): Promise<void> {
    const root = this.store.workspaceRoot;
    const hook = path.join(root, ".git", "hooks", "pre-commit");
    if (!fs.existsSync(path.dirname(hook))) { vscode.window.showInformationMessage("CodeIQ could not find a Git repository in this workspace."); return; }
    const choice = await vscode.window.showInformationMessage("Install a non-blocking CodeIQ pre-commit warning? It will never prevent a commit.", "Install", "Not now");
    if (choice !== "Install") return;
    const marker = "# CodeIQ non-blocking understanding warning";
    const existing = fs.existsSync(hook) ? fs.readFileSync(hook, "utf8") : "#!/bin/sh\n";
    if (!existing.includes(marker)) fs.writeFileSync(hook, `${existing.trimEnd()}\n\n${marker}\n# The extension provides the interactive warning when running in VS Code.\nexit 0\n`);
    fs.chmodSync(hook, 0o755);
    vscode.window.showInformationMessage("CodeIQ commit warning hook installed.");
  }
}
