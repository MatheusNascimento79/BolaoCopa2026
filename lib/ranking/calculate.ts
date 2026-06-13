import type { Bet, Profile, RankingEntry, Team } from "@/lib/domain/types";

type PrizePodium = {
  championTeamId: string | null;
  runnerUpTeamId: string | null;
  thirdPlaceTeamId: string | null;
};

type PrizeCategory = {
  tier: number;
  label: string;
  slots: Array<keyof PrizePodium>;
};

type PlacementProbabilities = Record<string, Record<keyof PrizePodium, number>>;

export const prizeCategories: PrizeCategory[] = [
  { tier: 1, label: "Campeão, vice e terceiro", slots: ["championTeamId", "runnerUpTeamId", "thirdPlaceTeamId"] },
  { tier: 2, label: "Campeão e vice", slots: ["championTeamId", "runnerUpTeamId"] },
  { tier: 3, label: "Campeão e terceiro", slots: ["championTeamId", "thirdPlaceTeamId"] },
  { tier: 4, label: "Somente campeão", slots: ["championTeamId"] },
  { tier: 5, label: "Vice e terceiro", slots: ["runnerUpTeamId", "thirdPlaceTeamId"] },
  { tier: 6, label: "Somente vice", slots: ["runnerUpTeamId"] },
  { tier: 7, label: "Somente terceiro", slots: ["thirdPlaceTeamId"] },
];

function getOfficialPodium(teamList: Team[]): PrizePodium {
  return {
    championTeamId: teamList.find((team) => team.status === "campeao")?.id ?? null,
    runnerUpTeamId: teamList.find((team) => team.status === "vice")?.id ?? null,
    thirdPlaceTeamId: teamList.find((team) => team.status === "terceiro")?.id ?? null,
  };
}

function getBetTeamId(betEntry: Bet, slot: keyof PrizePodium) {
  return betEntry[slot];
}

function isSlotImpossible(betEntry: Bet, slot: keyof PrizePodium, podium: PrizePodium, teamList: Team[]) {
  const teamId = getBetTeamId(betEntry, slot);
  const team = teamList.find((entry) => entry.id === teamId) ?? null;
  const officialTeamForSlot = podium[slot];

  if (!team || team.status === "eliminado") return true;
  if (officialTeamForSlot && officialTeamForSlot !== teamId) return true;
  if (team.status === "campeao" && slot !== "championTeamId") return true;
  if (team.status === "vice" && slot !== "runnerUpTeamId") return true;
  if (team.status === "terceiro" && slot !== "thirdPlaceTeamId") return true;

  return false;
}

function clampProbability(value: number) {
  return Math.max(0, Math.min(1, value));
}

function teamLiveStrength(team: Team) {
  if (team.status === "eliminado") return 0;
  if (team.status === "campeao") return 1;
  if (team.status === "vice") return 0.82;
  if (team.status === "terceiro") return 0.68;

  const rankingScore = (220 - Math.min(team.fifaRanking, 220)) / 220;
  const pointsScore = team.stats.points / 9;
  const goalScore = (team.stats.goalDifference + 8) / 16;
  const attackScore = team.stats.goalsFor / 10;
  const survivalScore = team.status === "ativo" ? 1 : 0;

  return clampProbability(
    0.42 * rankingScore +
      0.28 * pointsScore +
      0.16 * goalScore +
      0.09 * attackScore +
      0.05 * survivalScore,
  );
}

function normalizePlacementWeights(teamList: Team[], exponent: number) {
  const weighted = teamList.map((team) => ({
    teamId: team.id,
    weight: team.status === "eliminado" ? 0 : Math.pow(teamLiveStrength(team), exponent),
  }));
  const totalWeight = weighted.reduce((total, entry) => total + entry.weight, 0);

  return Object.fromEntries(
    weighted.map((entry) => [entry.teamId, totalWeight > 0 ? entry.weight / totalWeight : 0]),
  ) as Record<string, number>;
}

function calculatePlacementProbabilities(teamList: Team[], podium: PrizePodium): PlacementProbabilities {
  const championWeights = normalizePlacementWeights(teamList, 1.85);
  const runnerUpWeights = normalizePlacementWeights(teamList, 1.35);
  const thirdPlaceWeights = normalizePlacementWeights(teamList, 1.05);

  return Object.fromEntries(
    teamList.map((team) => {
      const values = {
        championTeamId: championWeights[team.id] ?? 0,
        runnerUpTeamId: runnerUpWeights[team.id] ?? 0,
        thirdPlaceTeamId: thirdPlaceWeights[team.id] ?? 0,
      };

      (Object.keys(values) as Array<keyof PrizePodium>).forEach((slot) => {
        if (podium[slot]) values[slot] = podium[slot] === team.id ? 1 : 0;
        if (team.status === "eliminado") values[slot] = 0;
        if (team.status === "campeao") values[slot] = slot === "championTeamId" ? 1 : 0;
        if (team.status === "vice") values[slot] = slot === "runnerUpTeamId" ? 1 : 0;
        if (team.status === "terceiro") values[slot] = slot === "thirdPlaceTeamId" ? 1 : 0;
      });

      return [team.id, values];
    }),
  ) as PlacementProbabilities;
}

function categoryProbability(
  betEntry: Bet,
  category: PrizeCategory,
  placementProbabilities: PlacementProbabilities,
) {
  return category.slots.reduce((probability, slot) => {
    const teamId = getBetTeamId(betEntry, slot);
    return probability * (placementProbabilities[teamId]?.[slot] ?? 0);
  }, 1);
}

function evaluateCategory(
  betEntry: Bet,
  category: PrizeCategory,
  podium: PrizePodium,
  teamList: Team[],
  placementProbabilities: PlacementProbabilities,
) {
  const impossible = category.slots.some((slot) => isSlotImpossible(betEntry, slot, podium, teamList));
  if (impossible) return { category, probabilityScore: 0 };

  const allSlotsOfficial = category.slots.every((slot) => Boolean(podium[slot]));
  const allOfficialSlotsMatch = category.slots.every((slot) => podium[slot] === getBetTeamId(betEntry, slot));

  if (allSlotsOfficial && allOfficialSlotsMatch) return { category, probabilityScore: 1 };

  return { category, probabilityScore: categoryProbability(betEntry, category, placementProbabilities) };
}

export function calculateRankingEntries({
  betList,
  profileList,
  teamList,
  totalPrizeCents,
  snapshotAt = new Date().toISOString(),
}: {
  betList: Bet[];
  profileList: Profile[];
  teamList: Team[];
  totalPrizeCents: number;
  snapshotAt?: string;
}): RankingEntry[] {
  const officialPodium = getOfficialPodium(teamList);
  const placementProbabilities = calculatePlacementProbabilities(teamList, officialPodium);
  const evaluated = betList
    .filter((betEntry) => betEntry.locked)
    .map((betEntry) => {
      const bestCategory =
        prizeCategories
          .map((category) => evaluateCategory(betEntry, category, officialPodium, teamList, placementProbabilities))
          .find((result) => result.probabilityScore !== 0) ?? null;

      return {
        betEntry,
        category: bestCategory?.category ?? null,
        probabilityScore: bestCategory ? bestCategory.probabilityScore : 0,
      };
    });

  const confirmedWinningTier = Math.min(
    ...evaluated
      .filter((entry) => entry.probabilityScore === 1)
      .map((entry) => entry.category?.tier ?? Number.POSITIVE_INFINITY),
  );
  const hasConfirmedWinner = Number.isFinite(confirmedWinningTier);
  const confirmedWinnerCount = hasConfirmedWinner
    ? evaluated.filter((entry) => entry.probabilityScore === 1 && entry.category?.tier === confirmedWinningTier).length
    : 0;
  const prizePerWinner = confirmedWinnerCount > 0 ? Math.floor(totalPrizeCents / confirmedWinnerCount) : 0;

  return evaluated
    .sort((left, right) => {
      const leftTier = left.category?.tier ?? Number.POSITIVE_INFINITY;
      const rightTier = right.category?.tier ?? Number.POSITIVE_INFINITY;
      const leftScore = left.probabilityScore;
      const rightScore = right.probabilityScore;

      if (leftScore !== rightScore) return rightScore - leftScore;
      if (leftTier !== rightTier) return leftTier - rightTier;
      return left.betEntry.submittedAt.localeCompare(right.betEntry.submittedAt);
    })
    .map((entry, index) => {
      const profile = profileList.find((item) => item.id === entry.betEntry.userId) ?? null;
      const expectedTier = entry.category?.tier ?? 8;
      const isConfirmedWinningTier =
        hasConfirmedWinner && entry.probabilityScore === 1 && expectedTier === confirmedWinningTier;
      const prizeLabel = entry.category?.label ?? "Sem categoria possível";

      return {
        id: `ranking-entry-${entry.betEntry.userId}`,
        snapshotId: `ranking-snapshot-${snapshotAt}`,
        userId: entry.betEntry.userId,
        position: index + 1,
        nickname: profile?.nickname ?? "Participante",
        probabilityScore: entry.probabilityScore,
        expectedTier,
        expectedPrizeCents: isConfirmedWinningTier ? prizePerWinner : 0,
        prizeLabel,
        reasoningSummary: buildRankingReasoning(entry.category, entry.probabilityScore, confirmedWinnerCount),
        rankingSnapshotAt: snapshotAt,
      };
    });
}

function buildRankingReasoning(category: PrizeCategory | null, probabilityScore: number, winnerCount: number) {
  if (!category || probabilityScore === 0) {
    return "Sem categoria possível pelos resultados oficiais sincronizados.";
  }

  if (probabilityScore === 1) {
    return `Categoria ${category.tier} confirmada; prêmio dividido entre ${winnerCount} ganhador${winnerCount > 1 ? "es" : ""}.`;
  }

  return `Categoria ${category.tier} calculada por força atual dos times, resultados sincronizados e status no torneio.`;
}
