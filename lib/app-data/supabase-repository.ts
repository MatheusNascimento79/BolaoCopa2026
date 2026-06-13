import { createClient } from "@/lib/supabase/server";
import type {
  AppSettings,
  AppSettingsAuditEntry,
  Bet,
  PaymentReceipt,
  PaymentStatus,
  Profile,
  ReceiptStatus,
  Team,
} from "@/lib/domain/types";
import type {
  BetsOpenResult,
  PaymentDecision,
  PaymentDecisionResult,
  PaymentReceiptWithProfile,
  SubmitBetInput,
  SubmitBetResult,
} from "./types";

type ProfileRow = {
  id: string;
  email: string;
  full_name: string;
  nickname: string;
  role: "participant" | "super_admin";
  payment_status: PaymentStatus;
  created_at: string;
};

type TeamRow = {
  id: string;
  external_id: string;
  name: string;
  flag_url: string;
  group_name: string;
  confederation: Team["confederation"];
  fifa_ranking: number;
  stats: Team["stats"];
  status: Team["status"];
};

type BetRow = {
  id: string;
  user_id: string;
  champion_team_id: string;
  runner_up_team_id: string;
  third_place_team_id: string;
  submitted_at: string;
};

type ReceiptRow = {
  id: string;
  user_id: string;
  status: ReceiptStatus;
  storage_path: string | null;
  detected_amount_cents: number | null;
  detected_beneficiary: string | null;
  detected_confidence: number | null;
  created_at: string | null;
  approved_by: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  profiles?: {
    full_name: string;
    nickname: string;
  } | Array<{
    full_name: string;
    nickname: string;
  }> | null;
};

type AuditRow = {
  id: string;
  actor_id: string;
  action: AppSettingsAuditEntry["action"];
  metadata: {
    previous_open?: boolean;
    next_open?: boolean;
  } | null;
  created_at: string;
};

function profileFromRow(row: ProfileRow): Profile {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    nickname: row.nickname,
    role: row.role,
    paymentStatus: row.payment_status,
    createdAt: row.created_at,
  };
}

function teamFromRow(row: TeamRow): Team {
  return {
    id: row.id,
    externalId: row.external_id,
    name: row.name,
    flagUrl: row.flag_url,
    groupName: row.group_name,
    confederation: row.confederation,
    fifaRanking: row.fifa_ranking,
    coach: "A definir",
    stats: row.stats,
    status: row.status,
  };
}

function betFromRow(row: BetRow): Bet {
  return {
    id: row.id,
    userId: row.user_id,
    championTeamId: row.champion_team_id,
    runnerUpTeamId: row.runner_up_team_id,
    thirdPlaceTeamId: row.third_place_team_id,
    submittedAt: row.submitted_at,
    locked: true,
  };
}

function receiptFromRow(row: ReceiptRow): PaymentReceipt {
  return {
    id: row.id,
    userId: row.user_id,
    status: row.status,
    storagePath: row.storage_path,
    detectedAmountCents: row.detected_amount_cents,
    detectedBeneficiary: row.detected_beneficiary,
    detectedConfidence: typeof row.detected_confidence === "number" ? row.detected_confidence : Number(row.detected_confidence ?? 0) || null,
    uploadedAt: row.created_at,
    approvedBy: row.approved_by,
    approvedAt: row.approved_at,
    rejectionReason: row.rejection_reason,
  };
}

function receiptWithProfileFromRow(row: ReceiptRow): PaymentReceiptWithProfile {
  const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;

  return {
    ...receiptFromRow(row),
    profile: profile
      ? {
          fullName: profile.full_name,
          nickname: profile.nickname,
        }
      : null,
  };
}

function auditFromRow(row: AuditRow): AppSettingsAuditEntry {
  const nextOpen = Boolean(row.metadata?.next_open);

  return {
    id: row.id,
    actorId: row.actor_id,
    action: row.action,
    previousOpen: Boolean(row.metadata?.previous_open),
    nextOpen,
    createdAt: row.created_at,
  };
}

export async function listProfiles() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id,email,full_name,nickname,role,payment_status,created_at")
    .order("created_at", { ascending: true });

  if (error) return [];
  return ((data ?? []) as ProfileRow[]).map(profileFromRow);
}

export async function getProfile(profileId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id,email,full_name,nickname,role,payment_status,created_at")
    .eq("id", profileId)
    .maybeSingle();

  return error || !data ? null : profileFromRow(data as ProfileRow);
}

export async function listTeams() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("teams")
    .select("id,external_id,name,flag_url,group_name,confederation,fifa_ranking,stats,status")
    .order("group_name", { ascending: true })
    .order("name", { ascending: true });

  if (error) return [];
  return ((data ?? []) as TeamRow[]).map(teamFromRow);
}

export async function listPaymentReceipts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payment_receipts")
    .select("id,user_id,status,storage_path,detected_amount_cents,detected_beneficiary,detected_confidence,created_at,approved_by,approved_at,rejection_reason,profiles:user_id(full_name,nickname)")
    .order("created_at", { ascending: false });

  if (error) return [];
  return ((data ?? []) as unknown as ReceiptRow[]).map(receiptWithProfileFromRow);
}

export async function getPaymentSummary() {
  const [profiles, receipts] = await Promise.all([listProfiles(), listPaymentReceipts()]);
  const paid = profiles.filter((profile) => profile.role === "participant" && profile.paymentStatus === "pago").length;
  const awaiting = profiles.filter((profile) => profile.paymentStatus === "aguardando").length;
  const pending = profiles.filter((profile) => profile.paymentStatus === "pendente").length;
  const rejected = receipts.filter((receipt) => receipt.status === "rejeitado").length;
  const settings = (await getSettings()).settings;

  return {
    awaiting,
    paid,
    pending,
    rejected,
    totalRaisedCents: paid * settings.paymentAmountCents,
  };
}

export async function decidePayment(receiptId: string, decision: PaymentDecision, actorId?: string): Promise<PaymentDecisionResult> {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const effectiveActorId = actorId ?? claimsData?.claims?.sub;
  const { data, error } = await supabase.rpc("decide_payment_receipt", {
    p_decision: decision,
    p_receipt_id: receiptId,
    p_rejection_reason: decision === "rejeitado" ? "Pagamento não recebido. Reenvie novo comprovante ou efetue o pagamento." : null,
  });

  if (error || !data || !effectiveActorId) {
    throw new Error(error?.message ?? "payment_decision_failed");
  }

  const receipts = await listPaymentReceipts();
  const summary = await getPaymentSummary();

  return {
    receipt: receiptWithProfileFromRow(data as ReceiptRow),
    receipts,
    summary,
  };
}

export async function getSettings(): Promise<BetsOpenResult> {
  const supabase = await createClient();
  const [{ data: setting }, { data: auditRows }] = await Promise.all([
    supabase.from("app_settings").select("value").eq("key", "bets_open").maybeSingle(),
    supabase
      .from("admin_audit_logs")
      .select("id,actor_id,action,metadata,created_at")
      .in("action", ["bets_opened", "bets_closed", "payment_approved", "payment_rejected"])
      .order("created_at", { ascending: false })
      .limit(12),
  ]);
  const value = (setting?.value ?? {}) as { open?: boolean; paymentAmountCents?: number; paymentLink?: string };

  return {
    settings: {
      betsOpen: value.open === true,
      registrationOpen: true,
      paymentAmountCents: typeof value.paymentAmountCents === "number" ? value.paymentAmountCents : 0,
      paymentLink: typeof value.paymentLink === "string" ? value.paymentLink : "",
      updatedBy: "supabase",
      updatedAt: new Date().toISOString(),
      auditTrail: ((auditRows ?? []) as AuditRow[]).map(auditFromRow),
    },
  };
}

export async function setBetsOpen(open: boolean, actorId?: string): Promise<BetsOpenResult> {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const effectiveActorId = actorId ?? claimsData?.claims?.sub;
  const previousOpen = (await getSettings()).settings.betsOpen;

  if (!effectiveActorId) throw new Error("missing_actor");

  const { error: settingError } = await supabase
    .from("app_settings")
    .update({
      updated_by: effectiveActorId,
      updated_at: new Date().toISOString(),
      value: { open },
    })
    .eq("key", "bets_open");

  if (settingError) throw new Error(settingError.message);

  await supabase.from("admin_audit_logs").insert({
    action: open ? "bets_opened" : "bets_closed",
    actor_id: effectiveActorId,
    metadata: {
      previous_open: previousOpen,
      next_open: open,
    },
  });

  return getSettings();
}

export async function getBetForUser(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bets")
    .select("id,user_id,champion_team_id,runner_up_team_id,third_place_team_id,submitted_at")
    .eq("user_id", userId)
    .maybeSingle();

  return error || !data ? null : betFromRow(data as BetRow);
}

export async function listBets() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bets")
    .select("id,user_id,champion_team_id,runner_up_team_id,third_place_team_id,submitted_at")
    .order("submitted_at", { ascending: true });

  if (error) return [];
  return ((data ?? []) as BetRow[]).map(betFromRow);
}

export async function submitBet(input: SubmitBetInput): Promise<SubmitBetResult> {
  const supabase = await createClient();
  const uniquePicks = new Set([input.championTeamId, input.runnerUpTeamId, input.thirdPlaceTeamId]);

  if (uniquePicks.size !== 3) throw new Error("bet_duplicate_teams");

  const { data, error } = await supabase
    .from("bets")
    .insert({
      champion_team_id: input.championTeamId,
      runner_up_team_id: input.runnerUpTeamId,
      third_place_team_id: input.thirdPlaceTeamId,
      user_id: input.userId,
    })
    .select("id,user_id,champion_team_id,runner_up_team_id,third_place_team_id,submitted_at")
    .single();

  if (error || !data) throw new Error(error?.message ?? "bet_submit_failed");

  return { bet: betFromRow(data as BetRow) };
}
