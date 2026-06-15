import type { AppSettings, Bet, PaymentReceipt, Profile } from "@/lib/domain/types";

export type BetAuditEntry = {
  id: string;
  userId: string;
  fullName: string;
  nickname: string;
  email: string;
  champion: string;
  runnerUp: string;
  thirdPlace: string;
  submittedAt: string;
};

export type PaymentReceiptWithProfile = PaymentReceipt & {
  profile: Pick<Profile, "fullName" | "nickname"> | null;
};

export type PaymentDecision = "aprovado" | "rejeitado";

export type PaymentDecisionResult = {
  receipt: PaymentReceiptWithProfile;
  receipts: PaymentReceiptWithProfile[];
  summary: {
    awaiting: number;
    paid: number;
    pending: number;
    rejected: number;
    totalRaisedCents: number;
  };
};

export type BetsOpenResult = {
  settings: AppSettings;
};

export type UpdateBetsSettingsInput = {
  betsDeadlineAt?: string | null;
  open?: boolean;
};

export type SubmitBetInput = Pick<Bet, "championTeamId" | "runnerUpTeamId" | "thirdPlaceTeamId"> & {
  userId: string;
};

export type SubmitBetResult = {
  bet: Bet;
};
