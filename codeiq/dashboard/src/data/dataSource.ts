import type { CodeIqStore, ProjectSummary } from "../../../shared/types";
import seed from "../../../seed/demo-store.json";

export interface DashboardData extends CodeIqStore { summary: ProjectSummary; }

export async function loadData(): Promise<DashboardData> {
  try {
    const response = await fetch("http://127.0.0.1:4174/data", { cache: "no-store" });
    if (response.ok) return await response.json() as DashboardData;
  } catch { /* extension API is optional in standalone demo mode */ }
  return seed as DashboardData;
}
