export const DEFAULT_RISK_WEIGHTS = {
    lineCount: 15,
    complexity: 15,
    security: 20,
    databaseApi: 15,
    unfamiliarDependency: 10,
    businessLogic: 10,
    verifiedSimilar: -20,
    understoodMarker: -15,
};
export function emptyStore(workspaceRoot) {
    const now = new Date().toISOString();
    return {
        version: 1,
        projectName: workspaceRoot.split(/[\\/]/).pop() || "CodeIQ project",
        workspaceRoot,
        blocks: [],
        createdAt: now,
        updatedAt: now,
    };
}
export function summarizeStore(store) {
    const blocks = store.blocks;
    const totalWeight = blocks.reduce((sum, block) => sum + Math.max(block.riskScore, 1), 0);
    const understoodWeight = blocks.reduce((sum, block) => {
        const multiplier = block.status === "verified" || block.status === "exempt" ? 1 : block.status === "partial" ? 0.5 : 0;
        return sum + Math.max(block.riskScore, 1) * multiplier;
    }, 0);
    const verified = blocks.filter((block) => block.status === "verified" || block.status === "exempt").length;
    const languageBreakdown = {};
    for (const block of blocks)
        languageBreakdown[block.language || "other"] = (languageBreakdown[block.language || "other"] || 0) + 1;
    const recentCheckpoints = blocks
        .flatMap((block) => block.checkpoints)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 8);
    return {
        understandingPercent: totalWeight ? Math.round((understoodWeight / totalWeight) * 100) : 0,
        verifiedPercent: blocks.length ? Math.round((verified / blocks.length) * 100) : 0,
        unverifiedPercent: blocks.length ? Math.round((blocks.filter((b) => b.status === "unverified" || b.status === "needs_review").length / blocks.length) * 100) : 0,
        understandingDebtPercent: totalWeight ? Math.round(100 - (understoodWeight / totalWeight) * 100) : 0,
        criticalUnverifiedCount: blocks.filter((b) => b.riskScore >= 60 && (b.status === "unverified" || b.status === "needs_review" || b.status === "partial")).length,
        languageBreakdown,
        recentCheckpoints,
    };
}
//# sourceMappingURL=types.js.map