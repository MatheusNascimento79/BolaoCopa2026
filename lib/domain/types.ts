export type UserRole = "participant" | "super_admin";

export type PaymentStatus = "pendente" | "aguardando" | "pago" | "rejeitado";

export type ReceiptStatus = "pendente" | "aguardando" | "aprovado" | "rejeitado";

export type MatchStatus = "agendado" | "ao_vivo" | "encerrado" | "adiado" | "cancelado";

export type TournamentStage =
  | "fase_de_grupos"
  | "32_avos"
  | "oitavas"
  | "quartas"
  | "semifinais"
  | "terceiro_lugar"
  | "final";

export type TeamStatus = "ativo" | "eliminado" | "campeao" | "vice" | "terceiro";

export type Confederation = "AFC" | "CAF" | "CONCACAF" | "CONMEBOL" | "OFC" | "UEFA";

export type AppSettings = {
  betsOpen: boolean;
  registrationOpen: boolean;
  paymentAmountCents: number;
  paymentLink: string;
  paymentPixKey: string;
  updatedBy: string;
  updatedAt: string;
  auditTrail: AppSettingsAuditEntry[];
};

export type AppSettingsAuditEntry = {
  id: string;
  actorId: string;
  action: "bets_opened" | "bets_closed" | "payment_approved" | "payment_rejected";
  previousOpen: boolean;
  nextOpen: boolean;
  createdAt: string;
};

export type Profile = {
  id: string;
  email: string;
  fullName: string;
  nickname: string;
  role: UserRole;
  paymentStatus: PaymentStatus;
  createdAt: string;
};

export type TeamStats = {
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
};

export type Team = {
  id: string;
  externalId: string;
  name: string;
  flagUrl: string;
  groupName: string;
  confederation: Confederation;
  fifaRanking: number;
  coach: string;
  stats: TeamStats;
  status: TeamStatus;
};

export type Match = {
  id: string;
  externalId: string;
  stage: TournamentStage;
  groupName?: string;
  kickoffAt: string;
  venue: string;
  city: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number | null;
  awayScore: number | null;
  status: MatchStatus;
};

export type Bet = {
  id: string;
  userId: string;
  championTeamId: string;
  runnerUpTeamId: string;
  thirdPlaceTeamId: string;
  submittedAt: string;
  locked: boolean;
};

export type RankingEntry = {
  id: string;
  snapshotId: string;
  userId: string;
  position: number;
  nickname: string;
  probabilityScore: number;
  expectedTier: number;
  expectedPrizeCents: number;
  prizeLabel: string;
  reasoningSummary: string;
  rankingSnapshotAt: string;
};

export type PaymentReceipt = {
  id: string;
  userId: string;
  status: ReceiptStatus;
  storagePath: string | null;
  detectedAmountCents: number | null;
  detectedBeneficiary: string | null;
  detectedConfidence: number | null;
  uploadedAt: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  rejectionReason: string | null;
};

export type PaymentSummary = {
  amountPerParticipantCents: number;
  paidParticipants: number;
  pendingParticipants: number;
  awaitingParticipants: number;
  rejectedReceipts: number;
  totalRaisedCents: number;
  receipts: PaymentReceipt[];
};

export type ParticipantStatus = {
  userId: string;
  nickname: string;
  hasBet: boolean;
};
