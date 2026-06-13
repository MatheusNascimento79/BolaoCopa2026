import { AppFrame, BettingStatusBar, GlassCard, LiveBottomNav, StatusBadge } from "@/components/live-ui";
import { requireAppAccessOrBettingGate } from "@/lib/access/betting-gate";
import { listParticipantStatuses } from "@/lib/app-data";

export const dynamic = "force-dynamic";

export default async function ParticipantesPage() {
  const { settings } = await requireAppAccessOrBettingGate();

  const participants = await listParticipantStatuses();

  return (
    <AppFrame
      eyebrow="Bolão Copa 2026"
      title="Participantes"
      action={<StatusBadge tone="scheduled">{participants.length} participantes</StatusBadge>}
      bottomStatus={<BettingStatusBar betsDeadlineAt={settings.betsDeadlineAt} betsOpen={settings.betsOpen} />}
      nav={<LiveBottomNav current="/participantes" />}
    >
      <section className="live-stack" aria-label="Lista de participantes">
        {participants.length === 0 && (
          <GlassCard className="live-empty-state" tone="blue">
            <strong>Nenhum participante aprovado</strong>
            <p>A lista aparece quando houver pagamentos validados.</p>
          </GlassCard>
        )}

        <ol className="live-participants-list">
          {participants.map((participant) => (
            <li key={participant.userId}>
              <span>{participant.nickname}</span>
              <strong className={participant.hasBet ? "live-participant-bet-ok" : "live-participant-bet-missing"}>
                {participant.hasBet ? "aposta ✅" : "aposta ⛔️"}
              </strong>
            </li>
          ))}
        </ol>
      </section>
    </AppFrame>
  );
}
