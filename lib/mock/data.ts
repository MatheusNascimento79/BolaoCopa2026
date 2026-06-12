import type {
  AppSettings,
  Bet,
  Match,
  PaymentSummary,
  Profile,
  RankingEntry,
  Team,
  TournamentStage,
} from "./types";

export const mockPaymentLink =
  "https://nubank.com.br/cobrar/12wih4/6a2b139e-244a-4a4c-a02e-852654ee183c";

export const appSettings: AppSettings = {
  betsOpen: true,
  registrationOpen: true,
  paymentAmountCents: 5000,
  paymentLink: mockPaymentLink,
  updatedBy: "profile-admin",
  updatedAt: "2026-06-11T18:40:00-03:00",
  auditTrail: [
    {
      id: "audit-bets-opened-001",
      actorId: "profile-admin",
      action: "bets_opened",
      previousOpen: false,
      nextOpen: true,
      createdAt: "2026-06-11T18:40:00-03:00",
    },
    {
      id: "audit-bets-closed-001",
      actorId: "profile-admin",
      action: "bets_closed",
      previousOpen: true,
      nextOpen: false,
      createdAt: "2026-06-10T20:10:00-03:00",
    },
  ],
};

export const profiles: Profile[] = [
  {
    id: "profile-admin",
    email: "matheusan@gmail.com",
    fullName: "Matheus Nascimento",
    nickname: "Admin Matheus",
    role: "super_admin",
    paymentStatus: "pago",
    createdAt: "2026-06-01T09:00:00-03:00",
  },
  {
    id: "profile-current",
    email: "participante.demo@bolao.local",
    fullName: "Participante Demo",
    nickname: "Canarinho 10",
    role: "participant",
    paymentStatus: "pago",
    createdAt: "2026-06-02T10:15:00-03:00",
  },
  {
    id: "profile-awaiting",
    email: "aguardando.demo@bolao.local",
    fullName: "Aline Valida",
    nickname: "Aline Gol",
    role: "participant",
    paymentStatus: "aguardando",
    createdAt: "2026-06-03T14:20:00-03:00",
  },
  {
    id: "profile-pending",
    email: "pendente.demo@bolao.local",
    fullName: "Bruno Pendência",
    nickname: "Bruno Zebra",
    role: "participant",
    paymentStatus: "pendente",
    createdAt: "2026-06-04T08:35:00-03:00",
  },
  {
    id: "profile-rejected",
    email: "rejeitado.demo@bolao.local",
    fullName: "Camila Reenvio",
    nickname: "Camisa 9",
    role: "participant",
    paymentStatus: "rejeitado",
    createdAt: "2026-06-05T18:05:00-03:00",
  },
  {
    id: "profile-luiz",
    email: "luiz.demo@bolao.local",
    fullName: "Luiz Torres",
    nickname: "Torres FC",
    role: "participant",
    paymentStatus: "pago",
    createdAt: "2026-06-06T11:30:00-03:00",
  },
  {
    id: "profile-nina",
    email: "nina.demo@bolao.local",
    fullName: "Nina Costa",
    nickname: "Nina Hexa",
    role: "participant",
    paymentStatus: "pago",
    createdAt: "2026-06-06T12:10:00-03:00",
  },
];

export const currentProfile = profiles[1];

export const teams: Team[] = [
  {
    id: "team-bra",
    externalId: "BRA",
    name: "Brasil",
    flagUrl: "https://flagcdn.com/br.svg",
    groupName: "Grupo G",
    confederation: "CONMEBOL",
    fifaRanking: 5,
    coach: "Carlo Ancelotti",
    stats: { played: 2, wins: 2, draws: 0, losses: 0, goalsFor: 5, goalsAgainst: 1, goalDifference: 4, points: 6 },
    status: "ativo",
  },
  {
    id: "team-arg",
    externalId: "ARG",
    name: "Argentina",
    flagUrl: "https://flagcdn.com/ar.svg",
    groupName: "Grupo A",
    confederation: "CONMEBOL",
    fifaRanking: 1,
    coach: "Lionel Scaloni",
    stats: { played: 2, wins: 1, draws: 1, losses: 0, goalsFor: 3, goalsAgainst: 1, goalDifference: 2, points: 4 },
    status: "ativo",
  },
  {
    id: "team-fra",
    externalId: "FRA",
    name: "França",
    flagUrl: "https://flagcdn.com/fr.svg",
    groupName: "Grupo D",
    confederation: "UEFA",
    fifaRanking: 2,
    coach: "Didier Deschamps",
    stats: { played: 2, wins: 1, draws: 1, losses: 0, goalsFor: 4, goalsAgainst: 2, goalDifference: 2, points: 4 },
    status: "ativo",
  },
  {
    id: "team-eng",
    externalId: "ENG",
    name: "Inglaterra",
    flagUrl: "https://flagcdn.com/gb-eng.svg",
    groupName: "Grupo B",
    confederation: "UEFA",
    fifaRanking: 4,
    coach: "Thomas Tuchel",
    stats: { played: 2, wins: 1, draws: 0, losses: 1, goalsFor: 2, goalsAgainst: 2, goalDifference: 0, points: 3 },
    status: "ativo",
  },
  {
    id: "team-esp",
    externalId: "ESP",
    name: "Espanha",
    flagUrl: "https://flagcdn.com/es.svg",
    groupName: "Grupo E",
    confederation: "UEFA",
    fifaRanking: 8,
    coach: "Luis de la Fuente",
    stats: { played: 2, wins: 2, draws: 0, losses: 0, goalsFor: 6, goalsAgainst: 2, goalDifference: 4, points: 6 },
    status: "ativo",
  },
  {
    id: "team-ger",
    externalId: "GER",
    name: "Alemanha",
    flagUrl: "https://flagcdn.com/de.svg",
    groupName: "Grupo C",
    confederation: "UEFA",
    fifaRanking: 10,
    coach: "Julian Nagelsmann",
    stats: { played: 2, wins: 1, draws: 0, losses: 1, goalsFor: 3, goalsAgainst: 3, goalDifference: 0, points: 3 },
    status: "ativo",
  },
  {
    id: "team-por",
    externalId: "POR",
    name: "Portugal",
    flagUrl: "https://flagcdn.com/pt.svg",
    groupName: "Grupo H",
    confederation: "UEFA",
    fifaRanking: 6,
    coach: "Roberto Martinez",
    stats: { played: 2, wins: 1, draws: 1, losses: 0, goalsFor: 4, goalsAgainst: 1, goalDifference: 3, points: 4 },
    status: "ativo",
  },
  {
    id: "team-usa",
    externalId: "USA",
    name: "Estados Unidos",
    flagUrl: "https://flagcdn.com/us.svg",
    groupName: "Grupo I",
    confederation: "CONCACAF",
    fifaRanking: 13,
    coach: "Mauricio Pochettino",
    stats: { played: 2, wins: 1, draws: 0, losses: 1, goalsFor: 2, goalsAgainst: 2, goalDifference: 0, points: 3 },
    status: "ativo",
  },
  {
    id: "team-mex",
    externalId: "MEX",
    name: "México",
    flagUrl: "https://flagcdn.com/mx.svg",
    groupName: "Grupo A",
    confederation: "CONCACAF",
    fifaRanking: 14,
    coach: "Javier Aguirre",
    stats: { played: 2, wins: 0, draws: 1, losses: 1, goalsFor: 1, goalsAgainst: 3, goalDifference: -2, points: 1 },
    status: "ativo",
  },
  {
    id: "team-mar",
    externalId: "MAR",
    name: "Marrocos",
    flagUrl: "https://flagcdn.com/ma.svg",
    groupName: "Grupo F",
    confederation: "CAF",
    fifaRanking: 12,
    coach: "Walid Regragui",
    stats: { played: 2, wins: 1, draws: 1, losses: 0, goalsFor: 2, goalsAgainst: 1, goalDifference: 1, points: 4 },
    status: "ativo",
  },
  {
    id: "team-jpn",
    externalId: "JPN",
    name: "Japão",
    flagUrl: "https://flagcdn.com/jp.svg",
    groupName: "Grupo J",
    confederation: "AFC",
    fifaRanking: 18,
    coach: "Hajime Moriyasu",
    stats: { played: 2, wins: 0, draws: 2, losses: 0, goalsFor: 2, goalsAgainst: 2, goalDifference: 0, points: 2 },
    status: "ativo",
  },
  {
    id: "team-nzl",
    externalId: "NZL",
    name: "Nova Zelândia",
    flagUrl: "https://flagcdn.com/nz.svg",
    groupName: "Grupo K",
    confederation: "OFC",
    fifaRanking: 89,
    coach: "Darren Bazeley",
    stats: { played: 2, wins: 0, draws: 0, losses: 2, goalsFor: 0, goalsAgainst: 5, goalDifference: -5, points: 0 },
    status: "eliminado",
  },
];

export const matches: Match[] = [
  {
    id: "match-g-a-001",
    externalId: "wc26-001",
    stage: "fase_de_grupos",
    groupName: "Grupo A",
    kickoffAt: "2026-06-11T21:00:00-03:00",
    venue: "Estadio Azteca",
    city: "Cidade do México",
    homeTeamId: "team-mex",
    awayTeamId: "team-arg",
    homeScore: 1,
    awayScore: 2,
    status: "encerrado",
  },
  {
    id: "match-g-g-014",
    externalId: "wc26-014",
    stage: "fase_de_grupos",
    groupName: "Grupo G",
    kickoffAt: "2026-06-15T19:00:00-03:00",
    venue: "SoFi Stadium",
    city: "Los Angeles",
    homeTeamId: "team-bra",
    awayTeamId: "team-arg",
    homeScore: 2,
    awayScore: 0,
    status: "ao_vivo",
  },
  {
    id: "match-g-d-022",
    externalId: "wc26-022",
    stage: "fase_de_grupos",
    groupName: "Grupo D",
    kickoffAt: "2026-06-18T16:00:00-03:00",
    venue: "BMO Field",
    city: "Toronto",
    homeTeamId: "team-fra",
    awayTeamId: "team-mar",
    homeScore: null,
    awayScore: null,
    status: "agendado",
  },
  {
    id: "match-r32-001",
    externalId: "wc26-r32-001",
    stage: "32_avos",
    kickoffAt: "2026-06-29T18:00:00-03:00",
    venue: "MetLife Stadium",
    city: "Nova Jersey",
    homeTeamId: "team-bra",
    awayTeamId: "team-usa",
    homeScore: null,
    awayScore: null,
    status: "agendado",
  },
  {
    id: "match-r16-001",
    externalId: "wc26-r16-001",
    stage: "oitavas",
    kickoffAt: "2026-07-04T17:00:00-03:00",
    venue: "AT&T Stadium",
    city: "Dallas",
    homeTeamId: "team-arg",
    awayTeamId: "team-ger",
    homeScore: null,
    awayScore: null,
    status: "agendado",
  },
  {
    id: "match-qf-001",
    externalId: "wc26-qf-001",
    stage: "quartas",
    kickoffAt: "2026-07-09T20:00:00-03:00",
    venue: "Gillette Stadium",
    city: "Boston",
    homeTeamId: "team-esp",
    awayTeamId: "team-por",
    homeScore: null,
    awayScore: null,
    status: "agendado",
  },
  {
    id: "match-sf-001",
    externalId: "wc26-sf-001",
    stage: "semifinais",
    kickoffAt: "2026-07-14T21:00:00-03:00",
    venue: "Mercedes-Benz Stadium",
    city: "Atlanta",
    homeTeamId: "team-bra",
    awayTeamId: "team-fra",
    homeScore: null,
    awayScore: null,
    status: "agendado",
  },
  {
    id: "match-third-001",
    externalId: "wc26-third-001",
    stage: "terceiro_lugar",
    kickoffAt: "2026-07-18T17:00:00-03:00",
    venue: "Hard Rock Stadium",
    city: "Miami",
    homeTeamId: "team-arg",
    awayTeamId: "team-por",
    homeScore: null,
    awayScore: null,
    status: "agendado",
  },
  {
    id: "match-final-001",
    externalId: "wc26-final-001",
    stage: "final",
    kickoffAt: "2026-07-19T19:00:00-03:00",
    venue: "MetLife Stadium",
    city: "Nova Jersey",
    homeTeamId: "team-bra",
    awayTeamId: "team-esp",
    homeScore: null,
    awayScore: null,
    status: "agendado",
  },
];

export const stageLabels: Record<TournamentStage, string> = {
  fase_de_grupos: "Fase de grupos",
  "32_avos": "32 avos",
  oitavas: "Oitavas",
  quartas: "Quartas",
  semifinais: "Semifinais",
  terceiro_lugar: "Disputa de terceiro lugar",
  final: "Final",
};

export const stageOrder: TournamentStage[] = [
  "fase_de_grupos",
  "32_avos",
  "oitavas",
  "quartas",
  "semifinais",
  "terceiro_lugar",
  "final",
];

export const matchesByStage = stageOrder.reduce(
  (acc, stage) => {
    acc[stage] = matches.filter((match) => match.stage === stage);
    return acc;
  },
  {} as Record<TournamentStage, Match[]>,
);

export const bet: Bet = {
  id: "bet-current-profile",
  userId: "profile-current",
  championTeamId: "team-bra",
  runnerUpTeamId: "team-esp",
  thirdPlaceTeamId: "team-arg",
  submittedAt: "2026-06-11T19:05:00-03:00",
  locked: true,
};

export const bets: Bet[] = [
  bet,
  {
    id: "bet-luiz",
    userId: "profile-luiz",
    championTeamId: "team-arg",
    runnerUpTeamId: "team-bra",
    thirdPlaceTeamId: "team-fra",
    submittedAt: "2026-06-11T19:12:00-03:00",
    locked: true,
  },
  {
    id: "bet-nina",
    userId: "profile-nina",
    championTeamId: "team-esp",
    runnerUpTeamId: "team-fra",
    thirdPlaceTeamId: "team-bra",
    submittedAt: "2026-06-11T19:20:00-03:00",
    locked: true,
  },
];

const paidParticipantProfiles = profiles.filter((profile) => profile.role === "participant" && profile.paymentStatus === "pago");
const totalRaisedCents = paidParticipantProfiles.length * appSettings.paymentAmountCents;

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

const rankingSnapshotAt = "2026-06-11T19:30:00-03:00";
const rankingSnapshotId = "ranking-snapshot-001";

export const prizeCategories: PrizeCategory[] = [
  {
    tier: 1,
    label: "Campeão, vice e terceiro",
    slots: ["championTeamId", "runnerUpTeamId", "thirdPlaceTeamId"],
  },
  {
    tier: 2,
    label: "Campeão e vice",
    slots: ["championTeamId", "runnerUpTeamId"],
  },
  {
    tier: 3,
    label: "Campeão e terceiro",
    slots: ["championTeamId", "thirdPlaceTeamId"],
  },
  {
    tier: 4,
    label: "Somente campeão",
    slots: ["championTeamId"],
  },
  {
    tier: 5,
    label: "Vice e terceiro",
    slots: ["runnerUpTeamId", "thirdPlaceTeamId"],
  },
  {
    tier: 6,
    label: "Somente vice",
    slots: ["runnerUpTeamId"],
  },
  {
    tier: 7,
    label: "Somente terceiro",
    slots: ["thirdPlaceTeamId"],
  },
];

function getProfileById(profileId: string) {
  return profiles.find((profile) => profile.id === profileId) ?? null;
}

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

type PlacementProbabilities = Record<string, Record<keyof PrizePodium, number>>;

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
  snapshotAt = rankingSnapshotAt,
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
        snapshotId: rankingSnapshotId,
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

export const rankingEntries: RankingEntry[] = calculateRankingEntries({
  betList: bets,
  profileList: profiles,
  teamList: teams,
  totalPrizeCents: totalRaisedCents,
});

export const paymentSummary: PaymentSummary = {
  amountPerParticipantCents: appSettings.paymentAmountCents,
  paidParticipants: paidParticipantProfiles.length,
  pendingParticipants: profiles.filter((profile) => profile.paymentStatus === "pendente").length,
  awaitingParticipants: profiles.filter((profile) => profile.paymentStatus === "aguardando").length,
  rejectedReceipts: 1,
  totalRaisedCents,
  receipts: [
    {
      id: "receipt-current",
      userId: "profile-current",
      status: "aprovado",
      storagePath: "receipts/profile-current/comprovante-pix.pdf",
      detectedAmountCents: 5000,
      detectedBeneficiary: "Nu Pagamentos S.A.",
      detectedConfidence: 0.96,
      uploadedAt: "2026-06-11T18:50:00-03:00",
      approvedBy: "profile-admin",
      approvedAt: "2026-06-11T19:00:00-03:00",
      rejectionReason: null,
    },
    {
      id: "receipt-awaiting",
      userId: "profile-awaiting",
      status: "aguardando",
      storagePath: "receipts/profile-awaiting/comprovante.png",
      detectedAmountCents: 5000,
      detectedBeneficiary: "Nu Pagamentos S.A.",
      detectedConfidence: 0.83,
      uploadedAt: "2026-06-11T19:10:00-03:00",
      approvedBy: null,
      approvedAt: null,
      rejectionReason: null,
    },
    {
      id: "receipt-pending",
      userId: "profile-pending",
      status: "pendente",
      storagePath: null,
      detectedAmountCents: null,
      detectedBeneficiary: null,
      detectedConfidence: null,
      uploadedAt: null,
      approvedBy: null,
      approvedAt: null,
      rejectionReason: null,
    },
    {
      id: "receipt-rejected",
      userId: "profile-rejected",
      status: "rejeitado",
      storagePath: "receipts/profile-rejected/comprovante-antigo.jpg",
      detectedAmountCents: 2500,
      detectedBeneficiary: "Beneficiário divergente",
      detectedConfidence: 0.61,
      uploadedAt: "2026-06-10T21:45:00-03:00",
      approvedBy: null,
      approvedAt: null,
      rejectionReason: "Pagamento não recebido. Reenvie novo comprovante ou efetue o pagamento.",
    },
  ],
};

export function getTeamById(teamId: string) {
  return teams.find((team) => team.id === teamId) ?? null;
}

export function getMatchesByStage(stage: TournamentStage) {
  return matchesByStage[stage];
}

export function getBetForProfile(profileId: string) {
  return bets.find((entry) => entry.userId === profileId) ?? null;
}
