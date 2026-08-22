import * as vscode from "vscode";
import { detectBlocks, languageForFile } from "./blockDetector";

export interface SignificantInsertion {
  document: vscode.TextDocument;
  range: vscode.Range;
  content: string;
  lineCount: number;
  source: "paste" | "ai_agent_detected" | "unknown";
  provenanceLabel: string;
  blocks: ReturnType<typeof detectBlocks>;
}

/**
 * Paste provenance is intentionally heuristic. VS Code does not expose a universal
 * "this came from an AI" event, so CodeIQ combines insertion shape and code signals
 * and always presents the result as likely, never confirmed.
 */
function classifyProvenance(text: string, lineCount: number): { source: SignificantInsertion["source"]; provenanceLabel: string } {
  const explicitAgentMarker = /copilot|cursor|claude|chatgpt|gemini|codeium|tabnine/i.test(text);
  const generatedShape = lineCount >= 15 && (
    /```|TODO:|eslint-disable|@ts-ignore|try\s*\{|catch\s*\(|export\s+(?:async\s+)?(?:function|class)/i.test(text) ||
    (text.match(/\b(?:async|await|interface|type|class|function|return)\b/g) || []).length >= 5
  );
  if (explicitAgentMarker || generatedShape) return { source: "ai_agent_detected", provenanceLabel: "heuristic: likely AI-assisted or pasted (not confirmed)" };
  return { source: "paste", provenanceLabel: "heuristic: likely pasted (not confirmed AI-generated)" };
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
    // Small incremental edits are intentionally ignored. A large single event is
    // the starting signal; risk scoring decides whether a checkpoint is worthwhile.
    if (rapid && chars < 220 && lines < this.lineSignal()) return;
    if (chars < 180 && lines < this.lineSignal()) return;
    clearTimeout(this.pending);
    this.pending = setTimeout(() => {
      const provenance = classifyProvenance(change.text, lines);
      this.onInsertion({
        document: event.document,
        range: new vscode.Range(change.range.start, change.range.start.translate(Math.max(lines - 1, 0), 0)),
        content: change.text,
        lineCount: lines,
        ...provenance,
        blocks: detectBlocks(change.text, change.range.start.line + 1, languageForFile(event.document.fileName)),
      });
    }, 90);
  }

  dispose() { clearTimeout(this.pending); this.disposable.dispose(); }
}
