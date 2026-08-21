import * as vscode from "vscode";
import { CodeBlock, EvaluationResult } from "../../../shared/types";
import { enableVoiceInput } from "../settings/configuration";
import { LLMEvaluator } from "../evaluation/mockEvaluator";
import { ProjectStore } from "../state/projectStore";

export class CheckpointPanel {
  private panel?: vscode.WebviewPanel;
  private activeBlock?: CodeBlock;
  private followUpCount = 0;

  constructor(private readonly context: vscode.ExtensionContext, private readonly store: ProjectStore, private readonly evaluator: LLMEvaluator) {}

  open(block: CodeBlock, question: string) {
    this.activeBlock = block;
    this.followUpCount = 0;
    this.panel = this.panel || vscode.window.createWebviewPanel("codeiqCheckpoint", "CodeIQ · Verify understanding", vscode.ViewColumn.Beside, { enableScripts: true, retainContextWhenHidden: true });
    this.panel.title = `CodeIQ · ${block.status === "unverified" ? "Let's verify" : "Review"}`;
    this.panel.webview.html = this.render(block, question);
    this.panel.webview.onDidReceiveMessage(async (message) => {
      if (!this.activeBlock) return;
      if (message.type === "skip") { this.store.updateStatus(this.activeBlock.id, "unverified"); this.panel?.dispose(); return; }
      if (message.type === "exempt") { this.store.updateStatus(this.activeBlock.id, "exempt"); this.panel?.dispose(); return; }
      if (message.type === "evaluate") await this.evaluate(message.explanation, message.question);
    }, undefined, this.context.subscriptions);
    this.panel.onDidDispose(() => { this.panel = undefined; }, undefined, this.context.subscriptions);
    this.panel.reveal(vscode.ViewColumn.Beside);
  }

  private async evaluate(explanation: string, question: string) {
    if (!this.activeBlock || !this.panel) return;
    this.panel.webview.postMessage({ type: "loading" });
    const result = await this.evaluator.evaluate({ code: this.activeBlock.excerpt || "", question, explanation });
    const checkpoint = { id: `${this.activeBlock.id}-${Date.now()}`, blockId: this.activeBlock.id, question, userExplanation: explanation, createdAt: new Date().toISOString(), result };
    this.store.addCheckpoint(this.activeBlock.id, checkpoint);
    const canFollowUp = result.status === "partial" || result.status === "needs_review";
    if (canFollowUp && result.follow_up_question && this.followUpCount < 2) this.followUpCount += 1;
    this.panel.webview.postMessage({ type: "result", result, followUpQuestion: canFollowUp && this.followUpCount <= 2 ? result.follow_up_question : undefined });
  }

  private render(block: CodeBlock, question: string): string {
    const nonce = `${Date.now()}`;
    const voice = enableVoiceInput();
    const excerpt = (block.excerpt || "").slice(0, 2400).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return `<!doctype html><html><head><meta charset="UTF-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';"><style>${styles}</style></head><body>
      <main><div class="eyebrow">CODEIQ CHECKPOINT</div><h1>Let's verify this block.</h1><p class="lede">AI can help you write the code. CodeIQ makes sure you understand the code you keep.</p>
      <section class="context"><div class="context-top"><strong>${escapeHtml(block.filePath)}</strong><span>Lines ${block.startLine}–${block.endLine} · Risk ${block.riskScore}/100</span></div><pre>${excerpt}</pre><div class="reasons">${block.riskReasons.map((reason) => `<span>${escapeHtml(reason)}</span>`).join("")}</div></section>
      <section class="question"><div class="eyebrow">ONE CONTEXTUAL QUESTION</div><h2 id="question">${escapeHtml(question)}</h2><textarea id="explanation" placeholder="Explain the behavior in your own words…" rows="5"></textarea><div class="actions"><button class="primary" id="verify">Verify understanding</button>${voice ? '<button class="secondary" id="voice">Voice input</button>' : ""}</div><p class="privacy">Local-first by default. Code is only sent to an evaluator when you explicitly opt in through settings.</p></section>
      <div id="result" class="result hidden"></div><div class="footer"><button id="skip" class="quiet">Skip for now</button><button id="exempt" class="quiet">Mark exempt</button></div></main><script nonce="${nonce}">${script}</script></body></html>`;
  }
}

const script = `const vscode=acquireVsCodeApi();const q=document.getElementById('question');const input=document.getElementById('explanation');const result=document.getElementById('result');document.getElementById('verify').addEventListener('click',()=>{if(!input.value.trim())return;vscode.postMessage({type:'evaluate',question:q.textContent,explanation:input.value});});document.getElementById('skip').addEventListener('click',()=>vscode.postMessage({type:'skip'}));document.getElementById('exempt').addEventListener('click',()=>vscode.postMessage({type:'exempt'}));${enableVoiceInput() ? "document.getElementById('voice').addEventListener('click',()=>{const R=window.SpeechRecognition||window.webkitSpeechRecognition;if(!R)return;const r=new R();r.onresult=e=>input.value=e.results[0][0].transcript;r.start();});" : ""}window.addEventListener('message',e=>{if(e.data.type==='loading'){result.className='result loading';result.textContent='Evaluating your explanation…';}if(e.data.type==='result'){const r=e.data.result;result.className='result '+r.status;const symbol=r.status==='verified'?'✓':r.status==='partial'?'△':'○';result.innerHTML='<strong>'+symbol+' '+(r.status==='verified'?'Understanding verified':r.status==='partial'?'Partial understanding':'Needs clarification')+'</strong><p>'+r.concepts_understood.join(' · ')+'</p>'+(r.concepts_missing.length?'<p class="missing">To explore next: '+r.concepts_missing.join(' · ')+'</p>':'')+(e.data.followUpQuestion?'<div class="followup"><span>One simpler follow-up</span><h2>'+e.data.followUpQuestion+'</h2></div>':'');if(e.data.followUpQuestion){q.textContent=e.data.followUpQuestion;input.value='';}}});`;

const styles = `:root{color-scheme:dark}body{font-family:var(--vscode-font-family);color:var(--vscode-foreground);background:var(--vscode-editor-background);margin:0}main{max-width:760px;margin:0 auto;padding:34px 30px}.eyebrow{font-size:10px;letter-spacing:.14em;color:var(--vscode-textLink-foreground);font-weight:700}.lede{color:var(--vscode-descriptionForeground);line-height:1.55;max-width:560px}h1{font-size:26px;margin:9px 0 0;letter-spacing:-.03em}h2{font-size:17px;line-height:1.45;margin:10px 0 16px}.context,.question,.result{border:1px solid var(--vscode-panel-border);background:color-mix(in srgb,var(--vscode-sideBar-background) 82%,transparent);border-radius:10px;padding:16px;margin-top:22px}.context-top{display:flex;justify-content:space-between;gap:12px;font-size:12px}.context-top span{color:var(--vscode-descriptionForeground)}pre{white-space:pre-wrap;max-height:210px;overflow:auto;color:var(--vscode-textPreformat-foreground);font:12px/1.55 var(--vscode-editor-font-family);margin:14px 0}.reasons{display:flex;flex-wrap:wrap;gap:6px}.reasons span{font-size:11px;border-radius:999px;padding:4px 8px;background:var(--vscode-badge-background);color:var(--vscode-badge-foreground)}textarea{box-sizing:border-box;width:100%;resize:vertical;border:1px solid var(--vscode-input-border);border-radius:7px;background:var(--vscode-input-background);color:var(--vscode-input-foreground);padding:12px;font:13px/1.5 var(--vscode-font-family)}button{border:0;border-radius:6px;padding:9px 14px;font:600 12px var(--vscode-font-family);cursor:pointer}.primary{background:var(--vscode-button-background);color:var(--vscode-button-foreground)}.secondary{background:var(--vscode-button-secondaryBackground);color:var(--vscode-button-secondaryForeground)}.actions{display:flex;gap:8px;margin-top:12px}.privacy{font-size:11px;color:var(--vscode-descriptionForeground)}.footer{display:flex;gap:16px;margin-top:16px}.quiet{padding:0;background:none;color:var(--vscode-descriptionForeground)}.result strong{font-size:16px}.result.verified{border-color:#5cc692}.result.partial{border-color:#d6a950}.result.needs_review{border-color:#8b93a3}.missing{color:#e5b75d}.loading{color:var(--vscode-descriptionForeground)}.followup{border-top:1px solid var(--vscode-panel-border);margin-top:16px;padding-top:13px}.followup span{font-size:10px;letter-spacing:.1em;color:var(--vscode-descriptionForeground);text-transform:uppercase}.hidden{display:none}`;

function escapeHtml(value: string): string { return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
