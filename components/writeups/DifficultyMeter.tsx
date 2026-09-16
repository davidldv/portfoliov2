import type { Difficulty } from "@/lib/writeups";
import { cn } from "@/lib/utils";

const LEVEL: Record<Difficulty, { n: number; color: string }> = {
  easy: { n: 1, color: "bg-status-good" },
  medium: { n: 2, color: "bg-status-warning" },
  hard: { n: 3, color: "bg-status-serious" },
  insane: { n: 4, color: "bg-status-critical" },
};

/** Four bars plus a text label, so difficulty never relies on color alone. */
export function DifficultyMeter({ level, className }: { level: Difficulty; className?: string }) {
  const { n, color } = LEVEL[level];
  return (
    <span className={cn("inline-flex items-center gap-2", className)} title={`Difficulty: ${level}`}>
      <span className="inline-flex items-end gap-[3px]" aria-hidden>
        {[1, 2, 3, 4].map((i) => (
          <span key={i} className={cn("w-[3px]", i <= n ? color : "bg-border-strong")} style={{ height: 5 + i * 2 }} />
        ))}
      </span>
      <span className="font-mono text-[0.7rem] capitalize text-fg-muted">{level}</span>
    </span>
  );
}
