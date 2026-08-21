import type { CodeBlock } from "../../../shared/types";
export function CriticalBlocksList({ blocks }: { blocks: CodeBlock[] }) { return <div>{blocks.map((block) => <div key={block.id}>{block.filePath}:{block.startLine}–{block.endLine} · risk {block.riskScore}</div>)}</div>; }
