import type { AppSettings, Bet, PaymentReceipt, Profile } from "@/lib/domain/types";

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

export type SubmitBetInput = Pick<Bet, "championTeamId" | "runnerUpTeamId" | "thirdPlaceTeamId"> & {
  userId: string;
};

export type SubmitBetResult = {
  bet: Bet;
};
