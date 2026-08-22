export function generateOverview(code: string, label: string): string {
  const subject = label || [...code.matchAll(/\b(?:function|class|def|const)\s+([A-Za-z_$][\w$]*)/g)][0]?.[1] || "This block";
  const actions: string[] = [];
  if (/fetch\s*\(|axios|request\s*\(|https?:\/\//i.test(code)) actions.push("communicates with an external API");
  if (/\b(select|insert|update|delete|query|prisma|drizzle|supabase|mongoose|db\.)/i.test(code)) actions.push("reads or writes persistent data");
  if (/auth|token|password|session|jwt|oauth|permission|role/i.test(code)) actions.push("handles authentication or authorization-sensitive state");
  if (/if\s*\(|else\b|switch\s*\(|catch\s*\(|try\s*\{/i.test(code)) actions.push("branches on conditions and includes failure handling");
  if (!actions.length) actions.push("defines reusable application behavior");
  return `${subject} appears to ${joinNatural(actions)}. This is a quick local explanation to orient you; the checkpoint below helps verify the details that matter.`;
}

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

function joinNatural(items: string[]): string {
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}
