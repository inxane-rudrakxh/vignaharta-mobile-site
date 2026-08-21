import * as fs from "node:fs";
import * as path from "node:path";
import * as crypto from "node:crypto";
import * as vscode from "vscode";
import { Checkpoint, CodeBlock, CodeIqStore, emptyStore, summarizeStore } from "../../../shared/types";

export class ProjectStore {
  private readonly root: string;
  private readonly dir: string;
  private readonly file: string;
  private state: CodeIqStore;

  private constructor(root: string, state: CodeIqStore) {
    this.root = root;
    this.dir = path.join(root, ".codeiq");
    this.file = path.join(this.dir, "store.json");
    this.state = state;
  }

  static open(root: string): ProjectStore {
    const dir = path.join(root, ".codeiq");
    const file = path.join(dir, "store.json");
    fs.mkdirSync(dir, { recursive: true });
    let state: CodeIqStore;
    try {
      state = JSON.parse(fs.readFileSync(file, "utf8")) as CodeIqStore;
      if (state.version !== 1 || !Array.isArray(state.blocks)) throw new Error("unsupported store");
    } catch {
      state = emptyStore(root);
      fs.writeFileSync(file, JSON.stringify(state, null, 2));
    }
    return new ProjectStore(root, state);
  }

  get workspaceRoot() { return this.root; }
  get blocks() { return [...this.state.blocks]; }
  summary() { return summarizeStore(this.state); }
  getBlock(id: string) { return this.state.blocks.find((block) => block.id === id); }

  upsertBlock(block: CodeBlock): CodeBlock {
    const index = this.state.blocks.findIndex((candidate) => candidate.id === block.id);
    if (index >= 0) this.state.blocks[index] = block;
    else this.state.blocks.push(block);
    this.persist();
    return block;
  }

  addCheckpoint(blockId: string, checkpoint: Checkpoint): CodeBlock | undefined {
    const block = this.getBlock(blockId);
    if (!block) return undefined;
    block.checkpoints.push(checkpoint);
    block.status = checkpoint.result.status;
    block.lastReviewedAt = checkpoint.createdAt;
    this.persist();
    return block;
  }

  updateStatus(blockId: string, status: CodeBlock["status"]): void {
    const block = this.getBlock(blockId);
    if (!block) return;
    block.status = status;
    block.lastReviewedAt = new Date().toISOString();
    this.persist();
  }

  exportPath(): string { return this.file; }
  exportPayload() { return { ...this.state, summary: this.summary() }; }

  private persist() {
    this.state.updatedAt = new Date().toISOString();
    const temp = `${this.file}.${process.pid}.tmp`;
    fs.writeFileSync(temp, JSON.stringify(this.state, null, 2));
    fs.renameSync(temp, this.file);
  }
}

export function stableHash(text: string): string {
  return crypto.createHash("sha256").update(text).digest("hex").slice(0, 16);
}

export function ensureWorkspaceFiles(root: string): void {
  const codeiqDir = path.join(root, ".codeiq");
  fs.mkdirSync(codeiqDir, { recursive: true });
  const config = path.join(codeiqDir, "config.json");
  if (!fs.existsSync(config)) fs.writeFileSync(config, JSON.stringify({ version: 1, privacy: "local-first" }, null, 2));
}

export function ensureGitignorePrompt(root: string): Thenable<string | undefined> {
  const gitignore = path.join(root, ".gitignore");
  if (!fs.existsSync(gitignore)) return Promise.resolve(undefined);
  const content = fs.readFileSync(gitignore, "utf8");
  if (content.split(/\r?\n/).some((line) => line.trim() === ".codeiq/")) return Promise.resolve(undefined);
  return vscode.window.showInformationMessage("CodeIQ keeps local project data in .codeiq/. Add it to .gitignore?", "Add", "Not now").then((choice) => {
    if (choice === "Add") fs.appendFileSync(gitignore, `${content.endsWith("\n") ? "" : "\n"}.codeiq/\n`);
    return choice;
  });
}
