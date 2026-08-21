export function UnderstandingScore({ value }: { value: number }) { return <div aria-label={`Project understanding ${value}%`}>{value}%</div>; }
