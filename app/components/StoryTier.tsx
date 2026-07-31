import type { CreatorTier } from "@/app/lib/creator-tier";
import { formatDuration } from "@/app/lib/format";

export function StoryTier({ tier, compact = false }: { tier: CreatorTier; compact?: boolean }) {
  return (
    <div className={compact ? "story-tier compact" : "story-tier"}>
      <span className="tier-grade">{tier.grade}</span>
      <div>
        <strong>{tier.label}</strong>
        <p>
          {tier.qualifyingSeries} qualifying series · {tier.qualifyingEpisodes} episodes ·{" "}
          {formatDuration(tier.totalRuntimeSeconds)} · {tier.publishingSpanDays} day span
        </p>
        {!compact ? <small>{tier.nextRequirement}</small> : null}
      </div>
    </div>
  );
}
