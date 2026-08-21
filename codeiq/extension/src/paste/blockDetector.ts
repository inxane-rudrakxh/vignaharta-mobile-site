export interface DetectedBlock {
  startLine: number;
  endLine: number;
  content: string;
  label: string;
}

function lineNumberAt(text: string, offset: number): number { return text.slice(0, offset).split(/\r?\n/).length; }

export function detectBlocks(content: string, insertionStartLine: number, languageId: string): DetectedBlock[] {
  const lines = content.split(/\r?\n/);
  const blocks: DetectedBlock[] = [];
  const pattern = /(?:export\s+)?(?:default\s+)?(?:async\s+)?(?:function|class|interface|type|const|def|async\s+def|router\.(?:get|post|put|delete))\s+([A-Za-z_$][\w$]*)?/;
  let currentStart = 0;
  let currentLabel = "inserted logic";
  lines.forEach((line, index) => {
    const match = line.match(pattern);
    if (match && index > currentStart) {
      blocks.push({ startLine: insertionStartLine + currentStart, endLine: insertionStartLine + index - 1, content: lines.slice(currentStart, index).join("\n"), label: currentLabel });
      currentStart = index;
    }
    if (match) currentLabel = match[1] || "inserted logic";
  });
  if (lines.length > currentStart) blocks.push({ startLine: insertionStartLine + currentStart, endLine: insertionStartLine + lines.length - 1, content: lines.slice(currentStart).join("\n"), label: currentLabel });
  return blocks.filter((block) => block.content.trim().length > 0);
}

export function detectSingleBlock(content: string, startLine: number): DetectedBlock {
  const firstMeaningful = content.split(/\r?\n/).find((line) => line.trim()) || "inserted logic";
  const name = firstMeaningful.match(/(?:function|class|def|const)\s+([A-Za-z_$][\w$]*)/)?.[1] || "inserted logic";
  return { startLine, endLine: startLine + content.split(/\r?\n/).length - 1, content, label: name };
}

export function languageForFile(fileName: string): string {
  const extension = fileName.split(".").pop()?.toLowerCase();
  return extension === "ts" || extension === "tsx" ? "TypeScript" : extension === "js" || extension === "jsx" ? "JavaScript" : extension === "py" ? "Python" : extension || "other";
}
