import * as vscode from "vscode";
import { detectBlocks, languageForFile } from "./blockDetector";

export interface SignificantInsertion {
  document: vscode.TextDocument;
  range: vscode.Range;
  content: string;
  lineCount: number;
  source: "paste" | "ai_agent_detected" | "unknown";
  blocks: ReturnType<typeof detectBlocks>;
}

export class PasteWatcher implements vscode.Disposable {
  private readonly disposable: vscode.Disposable;
  private lastEditAt = 0;
  private pending?: ReturnType<typeof setTimeout>;

  constructor(private readonly lineSignal: () => number, private readonly onInsertion: (event: SignificantInsertion) => void) {
    this.disposable = vscode.workspace.onDidChangeTextDocument((event) => this.handle(event));
  }

  private handle(event: vscode.TextDocumentChangeEvent) {
    if (event.document.uri.scheme !== "file" || event.contentChanges.length !== 1) return;
    const change = event.contentChanges[0];
    if (!change.text.trim() || change.rangeLength > 0) return;
    const lines = change.text.split(/\r?\n/).length;
    const chars = change.text.length;
    const now = Date.now();
    const rapid = now - this.lastEditAt < 180;
    this.lastEditAt = now;
    if (rapid && chars < 220 && lines < this.lineSignal()) return;
    if (chars < 180 && lines < this.lineSignal()) return;
    clearTimeout(this.pending);
    this.pending = setTimeout(() => {
      const source = /copilot|cursor|claude/i.test(change.text) ? "ai_agent_detected" : "paste";
      this.onInsertion({
        document: event.document,
        range: new vscode.Range(change.range.start, change.range.start.translate(Math.max(lines - 1, 0), 0)),
        content: change.text,
        lineCount: lines,
        source,
        blocks: detectBlocks(change.text, change.range.start.line + 1, languageForFile(event.document.fileName)),
      });
    }, 90);
  }

  dispose() { clearTimeout(this.pending); this.disposable.dispose(); }
}
