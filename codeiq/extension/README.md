# CodeIQ VS Code extension

CodeIQ is a privacy-first understanding gate for AI-assisted coding. It does not attempt to prove whether code came from AI, and it never blocks editing or commits. When a meaningful insertion has a high weighted risk score, it opens a non-modal checkpoint with a question grounded in the actual code.

## Run in the Extension Development Host

From this directory, run `npm install` and `npm run compile`. Open the repository root in VS Code, press `F5`, and choose **Extension Development Host**. In the development host, enable `codeiq.useMockEvaluator` for a deterministic offline demo. Paste a meaningful TypeScript or Python block into a file and answer the contextual question.

## Privacy and evaluation modes

CodeIQ stores its state in `.codeiq/store.json` and creates `.codeiq/config.json` on first activation. The extension asks before adding `.codeiq/` to `.gitignore`. The default is local-only: `codeiq.sendCodeToLLM` is `false`, so no code or explanation is sent over the network. The mock evaluator is used automatically in local-only mode. To use Anthropic, set `codeiq.sendCodeToLLM` to `true`, provide `CODEIQ_ANTHROPIC_API_KEY` in the extension host environment or configure `codeiq.anthropicApiKey`, and accept the one-time consent prompt.

All live requests are made by the extension host, never by the webview. Secret-like values are redacted before transfer, the response is parsed against the controlled `EvaluationResult` shape, and malformed or failed responses settle to `needs_review` rather than crashing the editor.

## Commands

| Command | Purpose |
|---|---|
| CodeIQ: Open Understanding Dashboard | Opens the local dashboard and exports the current store. |
| CodeIQ: Review Current File | Reopens the first pending block in the active file. |
| CodeIQ: Mark Block Exempt | Marks the first tracked block in the active file as exempt. |
| CodeIQ: Install Commit Warning Hook | Installs a non-blocking `.git/hooks/pre-commit` marker with consent. |

## Packaging

Run `npm run package` to produce a `.vsix` package after compiling. The extension uses JSON storage instead of SQLite for a zero-native-dependency MVP and keeps a small localhost endpoint on `127.0.0.1:4174` for the companion dashboard.
