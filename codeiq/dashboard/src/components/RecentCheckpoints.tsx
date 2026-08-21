import type { Checkpoint } from "../../../shared/types";
export function RecentCheckpoints({ checkpoints }: { checkpoints: Checkpoint[] }) { return <div>{checkpoints.map((checkpoint) => <div key={checkpoint.id}>{checkpoint.question}</div>)}</div>; }
