export function generateQuestion(code: string, label: string): string {
  const symbols = [...code.matchAll(/\b(?:const|let|var|function|class|def|async)\s+([A-Za-z_$][\w$]*)/g)].map((match) => match[1]).filter(Boolean).slice(0, 2);
  const calls = [...code.matchAll(/\b([A-Za-z_$][\w$]*)\s*\(/g)].map((match) => match[1]).filter((name) => !["if", "for", "while", "catch", "switch"].includes(name)).slice(0, 2);
  const security = /auth|token|password|session|jwt|oauth|permission/i.test(code);
  const api = /fetch\s*\(|axios|request\s*\(|https?:\/\//i.test(code);
  const subject = symbols[0] || label || "this block";
  if (security) return `What does ${subject} protect, and what specifically happens when the credential or session check fails?`;
  if (api) return `How does ${subject} handle the response from ${calls[0] || "the external request"}, including an error or unexpected payload?`;
  if (symbols.length >= 2) return `How does ${symbols[0]} use ${symbols[1]} to produce the block's result, and what assumption does that flow rely on?`;
  return `Walk through what ${subject} does from input to result, including the most important branch in this block.`;
}
