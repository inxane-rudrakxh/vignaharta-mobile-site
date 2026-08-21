import * as vscode from "vscode";
import { CodeBlock } from "../../../shared/types";

export class StatusDecorations implements vscode.Disposable {
  private readonly types: Record<string, vscode.TextEditorDecorationType> = {
    verified: vscode.window.createTextEditorDecorationType({ gutterIconPath: this.svg("#62c994", "✓") }),
    partial: vscode.window.createTextEditorDecorationType({ gutterIconPath: this.svg("#d6a950", "△") }),
    unverified: vscode.window.createTextEditorDecorationType({ gutterIconPath: this.svg("#8b93a3", "○") }),
    needs_review: vscode.window.createTextEditorDecorationType({ gutterIconPath: this.svg("#8b93a3", "○") }),
    exempt: vscode.window.createTextEditorDecorationType({ gutterIconPath: this.svg("#737b89", "—") }),
  };

  update(editor: vscode.TextEditor, blocks: CodeBlock[]) {
    for (const [status, type] of Object.entries(this.types)) {
      const options = blocks.filter((block) => block.status === status).map((block) => ({ range: new vscode.Range(block.startLine - 1, 0, block.startLine - 1, 0), hoverMessage: new vscode.MarkdownString(`**CodeIQ · ${block.status}**\\n\\nRisk score: **${block.riskScore}/100**\\n\\n${block.riskReasons.join(" · ")}\\n\\n[Review](command:codeiq.reviewCurrentFile)`), }));
      editor.setDecorations(type, options);
    }
  }

  dispose() { Object.values(this.types).forEach((type) => type.dispose()); }
  private svg(color: string, glyph: string) { return vscode.Uri.parse(`data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><text x="1" y="13" fill="${color}" font-size="14">${glyph}</text></svg>`)}`); }
}
