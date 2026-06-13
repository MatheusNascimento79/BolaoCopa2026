import { appSettings, bets, paymentSummary, profiles, teams } from "@/lib/mock";
import type { AppSettings, Bet, PaymentReceipt, PaymentStatus, Profile } from "@/lib/mock";
import type {
  BetsOpenResult,
  PaymentDecision,
  PaymentDecisionResult,
  PaymentReceiptWithProfile,
  SubmitBetInput,
  SubmitBetResult,
} from "./types";

let profileState: Profile[] = profiles.map((profile) => ({ ...profile }));
let receiptState: PaymentReceipt[] = paymentSummary.receipts.map((receipt) => ({ ...receipt }));
let betState: Bet[] = bets.map((bet) => ({ ...bet }));
let settingsState: AppSettings = {
  ...appSettings,
  auditTrail: appSettings.auditTrail.map((entry) => ({ ...entry })),
};

function now() {
  return new Date().toISOString();
}

function receiptWithProfile(receipt: PaymentReceipt): PaymentReceiptWithProfile {
  const profile = profileState.find((item) => item.id === receipt.userId) ?? null;

  return {
    ...receipt,
    profile: profile
      ? {
          fullName: profile.fullName,
          nickname: profile.nickname,
        }
      : null,
  };
}

function setProfilePaymentStatus(profileId: string, paymentStatus: PaymentStatus) {
  profileState = profileState.map((profile) =>
    profile.id === profileId
      ? {
          ...profile,
          paymentStatus,
        }
      : profile,
  );
}

export function listProfiles() {
  return profileState.map((profile) => ({ ...profile }));
}

export function getProfile(profileId: string) {
  const profile = profileState.find((item) => item.id === profileId);
  return profile ? { ...profile } : null;
}

export function listPaymentReceipts() {
  return receiptState.map(receiptWithProfile);
}

export function getPaymentSummary() {
  const paid = profileState.filter((profile) => profile.role === "participant" && profile.paymentStatus === "pago").length;
  const awaiting = profileState.filter((profile) => profile.paymentStatus === "aguardando").length;
  const pending = profileState.filter((profile) => profile.paymentStatus === "pendente").length;
  const rejected = receiptState.filter((receipt) => receipt.status === "rejeitado").length;

  return {
    awaiting,
    paid,
    pending,
    rejected,
    totalRaisedCents: paid * settingsState.paymentAmountCents,
  };
}

export function decidePayment(receiptId: string, decision: PaymentDecision, actorId = "profile-admin"): PaymentDecisionResult {
  const receipt = receiptState.find((item) => item.id === receiptId);

  if (!receipt) {
    throw new Error("receipt_not_found");
  }

  if (receipt.status !== "aguardando") {
    throw new Error("receipt_not_awaiting");
  }

  const approved = decision === "aprovado";
  const updatedReceipt: PaymentReceipt = {
    ...receipt,
    status: decision,
    approvedAt: approved ? now() : null,
    approvedBy: approved ? actorId : null,
    rejectionReason: approved ? null : "Pagamento não recebido. Reenvie novo comprovante ou efetue o pagamento.",
  };

  receiptState = receiptState.map((item) => (item.id === receiptId ? updatedReceipt : item));
  setProfilePaymentStatus(receipt.userId, approved ? "pago" : "pendente");

  settingsState = {
    ...settingsState,
    auditTrail: [
      {
        id: `audit-payment-${decision}-${receiptId}-${Date.now()}`,
        actorId,
        action: approved ? "payment_approved" : "payment_rejected",
        previousOpen: settingsState.betsOpen,
        nextOpen: settingsState.betsOpen,
        createdAt: now(),
      },
      ...settingsState.auditTrail,
    ],
  };

  return {
    receipt: receiptWithProfile(updatedReceipt),
    receipts: listPaymentReceipts(),
    summary: getPaymentSummary(),
  };
}

export function getSettings(): BetsOpenResult {
  return {
    settings: {
      ...settingsState,
      auditTrail: settingsState.auditTrail.map((entry) => ({ ...entry })),
    },
  };
}

export function setBetsOpen(open: boolean, actorId = "profile-admin"): BetsOpenResult {
  const previousOpen = settingsState.betsOpen;
  settingsState = {
    ...settingsState,
    betsOpen: open,
    registrationOpen: open,
    updatedBy: actorId,
    updatedAt: now(),
    auditTrail: [
      {
        id: `audit-bets-${open ? "opened" : "closed"}-${Date.now()}`,
        actorId,
        action: open ? "bets_opened" : "bets_closed",
        previousOpen,
        nextOpen: open,
        createdAt: now(),
      },
      ...settingsState.auditTrail,
    ],
  };

  return getSettings();
}

export function getBetForUser(userId: string) {
  const bet = betState.find((entry) => entry.userId === userId);
  return bet ? { ...bet } : null;
}

export function submitBet(input: SubmitBetInput): SubmitBetResult {
  const existing = betState.find((entry) => entry.userId === input.userId);
  const profile = profileState.find((item) => item.id === input.userId);

  if (existing?.locked) {
    throw new Error("bet_already_locked");
  }

  if (!settingsState.betsOpen) {
    throw new Error("bets_closed");
  }

  if (!profile || profile.role !== "participant") {
    throw new Error("profile_not_allowed");
  }

  if (profile.paymentStatus !== "pago") {
    throw new Error("payment_not_approved");
  }

  const uniquePicks = new Set([input.championTeamId, input.runnerUpTeamId, input.thirdPlaceTeamId]);
  if (uniquePicks.size !== 3) {
    throw new Error("bet_duplicate_teams");
  }

  const validTeamIds = new Set(teams.map((team) => team.id));
  const hasInvalidTeam = Array.from(uniquePicks).some((teamId) => !validTeamIds.has(teamId) && !/^team-[a-z0-9-]+$/i.test(teamId));
  if (hasInvalidTeam) {
    throw new Error("team_not_found");
  }

  const bet: Bet = {
    id: existing?.id ?? `bet-${input.userId}`,
    userId: input.userId,
    championTeamId: input.championTeamId,
    runnerUpTeamId: input.runnerUpTeamId,
    thirdPlaceTeamId: input.thirdPlaceTeamId,
    submittedAt: now(),
    locked: true,
  };

  betState = existing
    ? betState.map((entry) => (entry.userId === input.userId ? bet : entry))
    : [bet, ...betState];

  return { bet: { ...bet } };
}
