export type TierEpisode = {
  seriesId: string;
  seasonNumber: number;
  episodeNumber: number;
  durationSeconds: number;
  createdAt: string;
};

export type CreatorTier = {
  grade: "A" | "B" | "C" | "Rising";
  label: string;
  qualifyingSeries: number;
  qualifyingEpisodes: number;
  totalRuntimeSeconds: number;
  publishingSpanDays: number;
  nextRequirement: string;
};

export const TIER_RULES = {
  C: { series: 1, episodes: 3, runtimeSeconds: 180, spanDays: 0 },
  B: { series: 2, episodes: 6, runtimeSeconds: 420, spanDays: 7 },
  A: { series: 3, episodes: 9, runtimeSeconds: 720, spanDays: 21 },
} as const;

export function creatorTier(episodes: TierEpisode[]): CreatorTier {
  const bySeries = new Map<string, TierEpisode[]>();
  for (const episode of episodes) {
    if (!episode.seriesId) continue;
    const group = bySeries.get(episode.seriesId) ?? [];
    group.push(episode);
    bySeries.set(episode.seriesId, group);
  }

  const qualifying = [...bySeries.values()].filter(qualifiesAsSeries);
  const qualifyingEpisodes = qualifying.flat();
  const totalRuntimeSeconds = qualifyingEpisodes.reduce(
    (total, episode) => total + episode.durationSeconds,
    0,
  );
  const dates = qualifyingEpisodes
    .map((episode) => new Date(episode.createdAt).getTime())
    .filter(Number.isFinite);
  const publishingSpanDays = dates.length
    ? Math.floor((Math.max(...dates) - Math.min(...dates)) / 86_400_000)
    : 0;
  const metrics = {
    series: qualifying.length,
    episodes: qualifyingEpisodes.length,
    runtimeSeconds: totalRuntimeSeconds,
    spanDays: publishingSpanDays,
  };

  if (passes(metrics, TIER_RULES.A)) {
    return result("A", "Established storyteller", metrics, "Top structural tier earned.");
  }
  if (passes(metrics, TIER_RULES.B)) {
    return result(
      "B",
      "Serial storyteller",
      metrics,
      "Reach 3 qualifying series, 9 episodes, 12 minutes, and a 21-day publishing span.",
    );
  }
  if (passes(metrics, TIER_RULES.C)) {
    return result(
      "C",
      "Series creator",
      metrics,
      "Reach 2 qualifying series, 6 episodes, 7 minutes, and a 7-day publishing span.",
    );
  }
  return result(
    "Rising",
    "Rising creator",
    metrics,
    "Publish 3 consecutive episodes of at least 60 seconds in one series.",
  );
}

function qualifiesAsSeries(episodes: TierEpisode[]): boolean {
  if (episodes.length < 3 || episodes.some((episode) => episode.durationSeconds < 60)) {
    return false;
  }
  const seasons = new Map<number, number[]>();
  for (const episode of episodes) {
    const season = Math.max(1, Math.floor(episode.seasonNumber));
    const numbers = seasons.get(season) ?? [];
    numbers.push(Math.floor(episode.episodeNumber));
    seasons.set(season, numbers);
  }
  const orderedSeasons = [...seasons.values()].map((numbers) => {
    const ordered = [...new Set(numbers)].sort((a, b) => a - b);
    return {
      valid:
        ordered.length === numbers.length &&
        ordered.every((number, index) => number === index + 1),
      count: ordered.length,
    };
  });
  return orderedSeasons.every((season) => season.valid) && orderedSeasons.some((season) => season.count >= 3);
}

function passes(
  metrics: { series: number; episodes: number; runtimeSeconds: number; spanDays: number },
  rule: { series: number; episodes: number; runtimeSeconds: number; spanDays: number },
): boolean {
  return (
    metrics.series >= rule.series &&
    metrics.episodes >= rule.episodes &&
    metrics.runtimeSeconds >= rule.runtimeSeconds &&
    metrics.spanDays >= rule.spanDays
  );
}

function result(
  grade: CreatorTier["grade"],
  label: string,
  metrics: { series: number; episodes: number; runtimeSeconds: number; spanDays: number },
  nextRequirement: string,
): CreatorTier {
  return {
    grade,
    label,
    qualifyingSeries: metrics.series,
    qualifyingEpisodes: metrics.episodes,
    totalRuntimeSeconds: metrics.runtimeSeconds,
    publishingSpanDays: metrics.spanDays,
    nextRequirement,
  };
}
